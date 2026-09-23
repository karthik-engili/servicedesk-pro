import Comment from "../models/Comment.js";
import Ticket from "../models/Ticket.js";
import AppError from "../utils/appError.js";
import auditService from "./auditService.js";
import notificationService from "./notificationService.js";

class CommentService {
  async addComment({ ticketId, message, isInternal = false }, requestingUser) {
    const ticket = await Ticket.findById(ticketId);
    if (!ticket) {
      throw new AppError("Ticket not found.", 404);
    }

    const isOwner = ticket.createdBy.toString() === requestingUser._id.toString();
    const isSupportStaff = ["technician", "it_manager", "system_admin"].includes(requestingUser.role);

    if (!isOwner && !isSupportStaff) {
      throw new AppError("You do not have permission to comment on this ticket.", 403);
    }

    // Employees can never mark comments as internal
    const internalFlag = isSupportStaff ? Boolean(isInternal) : false;

    const comment = await Comment.create({
      ticket: ticket._id,
      author: requestingUser._id,
      message: message.trim(),
      isInternal: internalFlag,
    });

    await auditService.logAction({
      entityType: "Ticket",
      entityId: ticket._id,
      action: "COMMENT_ADDED",
      performedBy: requestingUser._id,
      details: internalFlag ? "Added internal note" : "Added public comment",
    });

    // Notify appropriate parties
    if (isOwner && ticket.assignedTo) {
      await notificationService.createNotification({
        recipient: ticket.assignedTo,
        type: "COMMENT_ADDED",
        message: `New comment on ${ticket.ticketNumber} from requester ${requestingUser.name}`,
        ticket: ticket._id,
      });
    } else if (isSupportStaff && !internalFlag) {
      await notificationService.createNotification({
        recipient: ticket.createdBy,
        type: "COMMENT_ADDED",
        message: `Support updated ticket ${ticket.ticketNumber}`,
        ticket: ticket._id,
      });
    }

    return Comment.findById(comment._id).populate("author", "name email role");
  }

  async getComments(ticketId, requestingUser) {
    const ticket = await Ticket.findById(ticketId);
    if (!ticket) {
      throw new AppError("Ticket not found.", 404);
    }

    const isOwner = ticket.createdBy.toString() === requestingUser._id.toString();
    const isSupportStaff = ["technician", "it_manager", "system_admin"].includes(requestingUser.role);

    if (!isOwner && !isSupportStaff) {
      throw new AppError("You do not have permission to view comments for this ticket.", 403);
    }

    const query = { ticket: ticketId };
    if (!isSupportStaff) {
      query.isInternal = { $ne: true };
    }

    return Comment.find(query)
      .populate("author", "name email role")
      .sort({ createdAt: 1 });
  }
}

export default new CommentService();
