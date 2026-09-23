import WorkLog from "../models/WorkLog.js";
import Ticket from "../models/Ticket.js";
import AppError from "../utils/appError.js";
import auditService from "./auditService.js";

class WorkLogService {
  async addWorkLog({ ticketId, description, timeSpentMinutes }, requestingUser) {
    if (!["technician", "it_manager", "system_admin"].includes(requestingUser.role)) {
      throw new AppError("Only support staff (technicians and managers) can log work time.", 403);
    }

    const ticket = await Ticket.findById(ticketId);
    if (!ticket) {
      throw new AppError("Ticket not found.", 404);
    }

    const workLog = await WorkLog.create({
      ticket: ticket._id,
      technician: requestingUser._id,
      description: description.trim(),
      timeSpentMinutes: Number(timeSpentMinutes),
    });

    await auditService.logAction({
      entityType: "Ticket",
      entityId: ticket._id,
      action: "WORKLOG_ADDED",
      performedBy: requestingUser._id,
      details: `Logged ${timeSpentMinutes} mins: ${description.substring(0, 50)}...`,
    });

    return WorkLog.findById(workLog._id).populate("technician", "name email role");
  }

  async getWorkLogs(ticketId, requestingUser) {
    if (!["technician", "it_manager", "system_admin"].includes(requestingUser.role)) {
      throw new AppError("Only technical support personnel can view work logs.", 403);
    }

    const ticket = await Ticket.findById(ticketId);
    if (!ticket) {
      throw new AppError("Ticket not found.", 404);
    }

    return WorkLog.find({ ticket: ticketId })
      .populate("technician", "name email role")
      .sort({ createdAt: -1 });
  }
}

export default new WorkLogService();
