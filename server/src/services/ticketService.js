import Ticket from "../models/Ticket.js";
import User from "../models/User.js";
import Department from "../models/Department.js";
import AppError from "../utils/appError.js";
import { isValidTransition } from "../utils/constants.js";
import slaService from "./slaService.js";
import auditService from "./auditService.js";
import notificationService from "./notificationService.js";

class TicketService {
  async createTicket(payload, requestingUser) {
    const { title, description, category, priority, department, asset, createdBy } = payload;

    // Prevent non-admin clients from spoofing createdBy
    let requesterId = requestingUser._id;
    if (createdBy && createdBy.toString() !== requestingUser._id.toString()) {
      if (requestingUser.role === "system_admin") {
        requesterId = createdBy;
      } else {
        throw new AppError("Only system administrators can create tickets on behalf of other users.", 403);
      }
    }

    // Determine department
    let targetDepartment = department || null;
    if (!targetDepartment && requestingUser.department) {
      targetDepartment = requestingUser.department._id || requestingUser.department;
    }

    if (targetDepartment) {
      const deptExists = await Department.findById(targetDepartment);
      if (!deptExists) {
        throw new AppError("Specified department does not exist.", 400);
      }
    }

    const selectedPriority = priority || "MEDIUM";
    const slaPolicy = await slaService.getPolicyForPriority(selectedPriority);
    const { responseDeadline, resolutionDeadline } = slaService.calculateDeadlines(slaPolicy);

    const ticket = new Ticket({
      title: title.trim(),
      description: description.trim(),
      category: category || "GENERAL",
      priority: selectedPriority,
      status: "OPEN",
      createdBy: requesterId,
      department: targetDepartment,
      asset: asset || null,
      slaPolicy: slaPolicy._id,
      responseDeadline,
      resolutionDeadline,
      slaStatus: "WITHIN_SLA",
    });

    await ticket.save();

    // Audit log
    await auditService.logAction({
      entityType: "Ticket",
      entityId: ticket._id,
      action: "TICKET_CREATED",
      performedBy: requestingUser._id,
      newState: {
        ticketNumber: ticket.ticketNumber,
        status: ticket.status,
        priority: ticket.priority,
      },
      details: `Ticket ${ticket.ticketNumber} created by ${requestingUser.name}`,
    });

    // Notify requester
    await notificationService.createNotification({
      recipient: requesterId,
      type: "TICKET_CREATED",
      message: `Your ticket ${ticket.ticketNumber} ("${ticket.title}") has been received.`,
      ticket: ticket._id,
    });

    return Ticket.findById(ticket._id)
      .populate("createdBy", "name email role")
      .populate("assignedTo", "name email role")
      .populate("department", "name status")
      .populate("slaPolicy");
  }

  async listTickets(queryFilters = {}, requestingUser) {
    const {
      status,
      priority,
      category,
      assignedTo,
      createdBy,
      department,
      slaStatus,
      search,
      page = 1,
      limit = 20,
      sortBy = "createdAt",
      sortOrder = "desc",
    } = queryFilters;

    const query = {};

    // RBAC Dataset scoping
    if (requestingUser.role === "employee") {
      // Employees only see tickets they created
      query.createdBy = requestingUser._id;
    } else if (requestingUser.role === "technician") {
      // Technicians see assigned to them, or in their department, or unassigned open
      if (!assignedTo) {
        query.$or = [
          { assignedTo: requestingUser._id },
          { status: "OPEN" },
          ...(requestingUser.department ? [{ department: requestingUser.department }] : []),
        ];
      } else {
        query.assignedTo = assignedTo;
      }
    } else if (requestingUser.role === "it_manager") {
      if (requestingUser.department && !department) {
        query.department = requestingUser.department;
      } else if (department) {
        query.department = department;
      }
    }

    if (status) query.status = status;
    if (priority) query.priority = priority;
    if (category) query.category = category;
    if (slaStatus) query.slaStatus = slaStatus;
    if (createdBy && requestingUser.role !== "employee") query.createdBy = createdBy;
    if (assignedTo && requestingUser.role !== "employee") query.assignedTo = assignedTo;
    if (department && requestingUser.role === "system_admin") query.department = department;

    if (search && search.trim()) {
      const regex = new RegExp(search.trim(), "i");
      query.$or = [{ title: regex }, { ticketNumber: regex }];
    }

    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10) || 20));
    const skip = (pageNum - 1) * limitNum;
    const sortObj = { [sortBy]: sortOrder === "asc" ? 1 : -1 };

    const [tickets, total] = await Promise.all([
      Ticket.find(query)
        .populate("createdBy", "name email role")
        .populate("assignedTo", "name email role")
        .populate("department", "name status")
        .populate("slaPolicy")
        .sort(sortObj)
        .skip(skip)
        .limit(limitNum),
      Ticket.countDocuments(query),
    ]);

    return {
      tickets,
      pagination: {
        total,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(total / limitNum) || 1,
      },
    };
  }

  async getTicketById(ticketId, requestingUser) {
    const ticket = await Ticket.findById(ticketId)
      .populate("createdBy", "name email role")
      .populate("assignedTo", "name email role")
      .populate("department", "name status")
      .populate("slaPolicy");

    if (!ticket) {
      throw new AppError("Ticket not found.", 404);
    }

    // Role guard: Employees can only view own tickets
    if (
      requestingUser.role === "employee" &&
      ticket.createdBy._id.toString() !== requestingUser._id.toString()
    ) {
      throw new AppError("Access denied. You can only view your own tickets.", 403);
    }

    // Dynamic SLA status check
    const currentSla = slaService.evaluateTicketSla(ticket);
    if (currentSla !== ticket.slaStatus) {
      ticket.slaStatus = currentSla;
      if (currentSla === "BREACHED") ticket.slaBreached = true;
      await ticket.save();
    }

    return ticket;
  }

  async updateTicket(ticketId, updates, requestingUser) {
    const ticket = await Ticket.findById(ticketId);
    if (!ticket) {
      throw new AppError("Ticket not found.", 404);
    }

    // Authorization
    const isOwner = ticket.createdBy.toString() === requestingUser._id.toString();
    const isAssigned = ticket.assignedTo && ticket.assignedTo.toString() === requestingUser._id.toString();
    const isPrivileged = ["system_admin", "it_manager"].includes(requestingUser.role);

    if (!isPrivileged && !isAssigned && !isOwner) {
      throw new AppError("You do not have permission to modify this ticket.", 403);
    }

    // Protect workflow: status cannot be updated via generic patch
    if (updates.status && updates.status !== ticket.status) {
      throw new AppError(
        "Status cannot be changed via general update. Use explicit workflow endpoints (/assign, /start, /resolve, /reopen, /close).",
        400
      );
    }

    const previousPriority = ticket.priority;

    if (updates.title !== undefined) ticket.title = updates.title.trim();
    if (updates.description !== undefined) ticket.description = updates.description.trim();
    if (updates.category !== undefined) ticket.category = updates.category;
    if (updates.department !== undefined) ticket.department = updates.department || null;
    if (updates.asset !== undefined) ticket.asset = updates.asset || null;

    // Priority modification with SLA recalculation
    if (updates.priority && updates.priority !== ticket.priority) {
      if (!isPrivileged) {
        throw new AppError("Only IT Managers or System Admins can update ticket priority.", 403);
      }
      ticket.priority = updates.priority;
      const newPolicy = await slaService.getPolicyForPriority(updates.priority);
      const { responseDeadline, resolutionDeadline } = slaService.calculateDeadlines(
        newPolicy,
        ticket.createdAt
      );
      ticket.slaPolicy = newPolicy._id;
      ticket.responseDeadline = responseDeadline;
      ticket.resolutionDeadline = resolutionDeadline;
      ticket.slaStatus = slaService.evaluateTicketSla(ticket);

      await auditService.logAction({
        entityType: "Ticket",
        entityId: ticket._id,
        action: "PRIORITY_CHANGED",
        performedBy: requestingUser._id,
        previousState: { priority: previousPriority },
        newState: { priority: ticket.priority },
        details: `Priority updated from ${previousPriority} to ${ticket.priority}`,
      });
    }

    await ticket.save();

    return Ticket.findById(ticket._id)
      .populate("createdBy", "name email role")
      .populate("assignedTo", "name email role")
      .populate("department", "name status")
      .populate("slaPolicy");
  }

  // --- Explicit Workflow State Machine Actions ---

  async assignTicket(ticketId, { assignedTo }, requestingUser) {
    if (!["system_admin", "it_manager"].includes(requestingUser.role)) {
      throw new AppError("Only System Admins and IT Managers can assign tickets.", 403);
    }

    const ticket = await Ticket.findById(ticketId);
    if (!ticket) {
      throw new AppError("Ticket not found.", 404);
    }

    const technician = await User.findById(assignedTo);
    if (!technician) {
      throw new AppError("Target technician user not found.", 404);
    }

    if (!["technician", "it_manager", "system_admin"].includes(technician.role)) {
      throw new AppError("Tickets can only be assigned to technical support staff.", 400);
    }

    const prevStatus = ticket.status;
    const prevAssignee = ticket.assignedTo;

    ticket.assignedTo = technician._id;
    if (ticket.status === "OPEN") {
      ticket.status = "ASSIGNED";
    }

    if (!ticket.respondedAt) {
      ticket.respondedAt = new Date();
    }

    ticket.slaStatus = slaService.evaluateTicketSla(ticket);
    await ticket.save();

    await auditService.logAction({
      entityType: "Ticket",
      entityId: ticket._id,
      action: "ASSIGNED",
      performedBy: requestingUser._id,
      previousState: { assignedTo: prevAssignee, status: prevStatus },
      newState: { assignedTo: technician._id, status: ticket.status },
      details: `Ticket assigned to ${technician.name} (${technician.role})`,
    });

    // Notify technician
    await notificationService.createNotification({
      recipient: technician._id,
      type: "TICKET_ASSIGNED",
      message: `You have been assigned ticket ${ticket.ticketNumber}: "${ticket.title}"`,
      ticket: ticket._id,
    });

    // Notify requester
    await notificationService.createNotification({
      recipient: ticket.createdBy,
      type: "STATUS_UPDATED",
      message: `Your ticket ${ticket.ticketNumber} has been assigned to ${technician.name}.`,
      ticket: ticket._id,
    });

    return Ticket.findById(ticket._id)
      .populate("createdBy", "name email role")
      .populate("assignedTo", "name email role")
      .populate("department", "name status")
      .populate("slaPolicy");
  }

  async startTicket(ticketId, requestingUser) {
    const ticket = await Ticket.findById(ticketId);
    if (!ticket) {
      throw new AppError("Ticket not found.", 404);
    }

    const isAssignee = ticket.assignedTo && ticket.assignedTo.toString() === requestingUser._id.toString();
    const isPrivileged = ["system_admin", "it_manager"].includes(requestingUser.role);

    if (!isAssignee && !isPrivileged) {
      throw new AppError("Only the assigned technician or an IT manager can start work on this ticket.", 403);
    }

    if (!isValidTransition(ticket.status, "IN_PROGRESS")) {
      throw new AppError(
        `Invalid status transition: Cannot transition from '${ticket.status}' to 'IN_PROGRESS'.`,
        400
      );
    }

    const prevStatus = ticket.status;
    ticket.status = "IN_PROGRESS";
    if (!ticket.respondedAt) {
      ticket.respondedAt = new Date();
    }
    ticket.slaStatus = slaService.evaluateTicketSla(ticket);
    await ticket.save();

    await auditService.logAction({
      entityType: "Ticket",
      entityId: ticket._id,
      action: "STATUS_CHANGED",
      performedBy: requestingUser._id,
      previousState: { status: prevStatus },
      newState: { status: "IN_PROGRESS" },
      details: `Work started by ${requestingUser.name}`,
    });

    await notificationService.createNotification({
      recipient: ticket.createdBy,
      type: "STATUS_UPDATED",
      message: `Work has begun on ticket ${ticket.ticketNumber} by ${requestingUser.name}.`,
      ticket: ticket._id,
    });

    return Ticket.findById(ticket._id)
      .populate("createdBy", "name email role")
      .populate("assignedTo", "name email role")
      .populate("department", "name status")
      .populate("slaPolicy");
  }

  async resolveTicket(ticketId, { resolutionNotes }, requestingUser) {
    const ticket = await Ticket.findById(ticketId);
    if (!ticket) {
      throw new AppError("Ticket not found.", 404);
    }

    const isAssignee = ticket.assignedTo && ticket.assignedTo.toString() === requestingUser._id.toString();
    const isPrivileged = ["system_admin", "it_manager"].includes(requestingUser.role);

    if (!isAssignee && !isPrivileged) {
      throw new AppError("Only the assigned technician or an IT manager can resolve this ticket.", 403);
    }

    if (!isValidTransition(ticket.status, "RESOLVED")) {
      throw new AppError(
        `Invalid status transition: Cannot resolve ticket in '${ticket.status}' status.`,
        400
      );
    }

    if (!resolutionNotes || resolutionNotes.trim().length < 5) {
      throw new AppError("Resolution notes (min 5 chars) are required when resolving a ticket.", 400);
    }

    const prevStatus = ticket.status;
    ticket.status = "RESOLVED";
    ticket.resolvedAt = new Date();
    ticket.resolutionNotes = resolutionNotes.trim();
    ticket.slaStatus = slaService.evaluateTicketSla(ticket);
    await ticket.save();

    await auditService.logAction({
      entityType: "Ticket",
      entityId: ticket._id,
      action: "RESOLVED",
      performedBy: requestingUser._id,
      previousState: { status: prevStatus },
      newState: { status: "RESOLVED", resolvedAt: ticket.resolvedAt },
      details: `Ticket resolved. Notes: ${ticket.resolutionNotes}`,
    });

    await notificationService.createNotification({
      recipient: ticket.createdBy,
      type: "STATUS_UPDATED",
      message: `Your ticket ${ticket.ticketNumber} has been resolved! Please confirm or reopen if needed.`,
      ticket: ticket._id,
    });

    return Ticket.findById(ticket._id)
      .populate("createdBy", "name email role")
      .populate("assignedTo", "name email role")
      .populate("department", "name status")
      .populate("slaPolicy");
  }

  async reopenTicket(ticketId, { reason }, requestingUser) {
    const ticket = await Ticket.findById(ticketId);
    if (!ticket) {
      throw new AppError("Ticket not found.", 404);
    }

    const isOwner = ticket.createdBy.toString() === requestingUser._id.toString();
    const isPrivileged = ["system_admin", "it_manager"].includes(requestingUser.role);

    if (!isOwner && !isPrivileged) {
      throw new AppError("Only the ticket creator or a manager can reopen this ticket.", 403);
    }

    if (!isValidTransition(ticket.status, "REOPENED")) {
      throw new AppError(
        `Invalid status transition: Only 'RESOLVED' tickets can be reopened (current: '${ticket.status}').`,
        400
      );
    }

    const prevStatus = ticket.status;
    ticket.status = "REOPENED";
    ticket.resolvedAt = null;
    ticket.slaStatus = slaService.evaluateTicketSla(ticket);
    await ticket.save();

    await auditService.logAction({
      entityType: "Ticket",
      entityId: ticket._id,
      action: "REOPENED",
      performedBy: requestingUser._id,
      previousState: { status: prevStatus },
      newState: { status: "REOPENED" },
      details: reason ? `Ticket reopened: ${reason}` : "Ticket reopened by user",
    });

    if (ticket.assignedTo) {
      await notificationService.createNotification({
        recipient: ticket.assignedTo,
        type: "STATUS_UPDATED",
        message: `Ticket ${ticket.ticketNumber} was reopened by ${requestingUser.name}.`,
        ticket: ticket._id,
      });
    }

    return Ticket.findById(ticket._id)
      .populate("createdBy", "name email role")
      .populate("assignedTo", "name email role")
      .populate("department", "name status")
      .populate("slaPolicy");
  }

  async closeTicket(ticketId, requestingUser) {
    const ticket = await Ticket.findById(ticketId);
    if (!ticket) {
      throw new AppError("Ticket not found.", 404);
    }

    const isOwner = ticket.createdBy.toString() === requestingUser._id.toString();
    const isPrivileged = ["system_admin", "it_manager"].includes(requestingUser.role);

    if (!isOwner && !isPrivileged) {
      throw new AppError("Only the ticket creator or an administrator can close this ticket.", 403);
    }

    if (!isValidTransition(ticket.status, "CLOSED")) {
      throw new AppError(
        `Invalid status transition: Only 'RESOLVED' tickets can be closed (current: '${ticket.status}').`,
        400
      );
    }

    const prevStatus = ticket.status;
    ticket.status = "CLOSED";
    ticket.closedAt = new Date();
    await ticket.save();

    await auditService.logAction({
      entityType: "Ticket",
      entityId: ticket._id,
      action: "CLOSED",
      performedBy: requestingUser._id,
      previousState: { status: prevStatus },
      newState: { status: "CLOSED", closedAt: ticket.closedAt },
      details: `Ticket closed by ${requestingUser.name}`,
    });

    return Ticket.findById(ticket._id)
      .populate("createdBy", "name email role")
      .populate("assignedTo", "name email role")
      .populate("department", "name status")
      .populate("slaPolicy");
  }
}

export default new TicketService();
