import ticketService from "../services/ticketService.js";
import auditService from "../services/auditService.js";
import { sendSuccess } from "../utils/response.js";

export const createTicket = async (req, res, next) => {
  try {
    const ticket = await ticketService.createTicket(req.body, req.user);
    return sendSuccess(res, {
      statusCode: 201,
      message: "Ticket created successfully.",
      data: { ticket },
    });
  } catch (error) {
    next(error);
  }
};

export const listTickets = async (req, res, next) => {
  try {
    const result = await ticketService.listTickets(req.query, req.user);
    return sendSuccess(res, {
      statusCode: 200,
      message: "Tickets retrieved successfully.",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

export const getTicketById = async (req, res, next) => {
  try {
    const ticket = await ticketService.getTicketById(req.params.id, req.user);
    return sendSuccess(res, {
      statusCode: 200,
      message: "Ticket retrieved successfully.",
      data: { ticket },
    });
  } catch (error) {
    next(error);
  }
};

export const updateTicket = async (req, res, next) => {
  try {
    const ticket = await ticketService.updateTicket(req.params.id, req.body, req.user);
    return sendSuccess(res, {
      statusCode: 200,
      message: "Ticket updated successfully.",
      data: { ticket },
    });
  } catch (error) {
    next(error);
  }
};

export const assignTicket = async (req, res, next) => {
  try {
    const ticket = await ticketService.assignTicket(req.params.id, req.body, req.user);
    return sendSuccess(res, {
      statusCode: 200,
      message: "Ticket assigned successfully.",
      data: { ticket },
    });
  } catch (error) {
    next(error);
  }
};

export const startTicket = async (req, res, next) => {
  try {
    const ticket = await ticketService.startTicket(req.params.id, req.user);
    return sendSuccess(res, {
      statusCode: 200,
      message: "Ticket work marked in progress.",
      data: { ticket },
    });
  } catch (error) {
    next(error);
  }
};

export const resolveTicket = async (req, res, next) => {
  try {
    const ticket = await ticketService.resolveTicket(req.params.id, req.body, req.user);
    return sendSuccess(res, {
      statusCode: 200,
      message: "Ticket marked as resolved.",
      data: { ticket },
    });
  } catch (error) {
    next(error);
  }
};

export const reopenTicket = async (req, res, next) => {
  try {
    const ticket = await ticketService.reopenTicket(req.params.id, req.body, req.user);
    return sendSuccess(res, {
      statusCode: 200,
      message: "Ticket reopened.",
      data: { ticket },
    });
  } catch (error) {
    next(error);
  }
};

export const closeTicket = async (req, res, next) => {
  try {
    const ticket = await ticketService.closeTicket(req.params.id, req.user);
    return sendSuccess(res, {
      statusCode: 200,
      message: "Ticket closed successfully.",
      data: { ticket },
    });
  } catch (error) {
    next(error);
  }
};

export const getTicketAuditLogs = async (req, res, next) => {
  try {
    // First verify ticket access
    await ticketService.getTicketById(req.params.id, req.user);
    const result = await auditService.getAuditLogs(req.params.id, req.query);
    return sendSuccess(res, {
      statusCode: 200,
      message: "Audit trail retrieved successfully.",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};
