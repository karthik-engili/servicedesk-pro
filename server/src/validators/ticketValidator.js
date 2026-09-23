import AppError from "../utils/appError.js";
import { TICKET_PRIORITIES, TICKET_CATEGORIES } from "../utils/constants.js";

export const validateCreateTicket = (req, res, next) => {
  const { title, description, priority, category } = req.body;
  const errors = [];

  if (!title || typeof title !== "string" || title.trim().length < 3) {
    errors.push({ field: "title", message: "Title must be at least 3 characters long." });
  }

  if (!description || typeof description !== "string" || description.trim().length < 5) {
    errors.push({ field: "description", message: "Description must be at least 5 characters long." });
  }

  if (priority && !TICKET_PRIORITIES.includes(priority)) {
    errors.push({
      field: "priority",
      message: `Priority must be one of: ${TICKET_PRIORITIES.join(", ")}`,
    });
  }

  if (category && !TICKET_CATEGORIES.includes(category)) {
    errors.push({
      field: "category",
      message: `Category must be one of: ${TICKET_CATEGORIES.join(", ")}`,
    });
  }

  if (errors.length > 0) {
    return next(new AppError("Validation failed for ticket creation.", 400, errors));
  }

  next();
};

export const validateUpdateTicket = (req, res, next) => {
  const { title, description, priority, category } = req.body;
  const errors = [];

  if (title !== undefined && (typeof title !== "string" || title.trim().length < 3)) {
    errors.push({ field: "title", message: "Title must be at least 3 characters long." });
  }

  if (description !== undefined && (typeof description !== "string" || description.trim().length < 5)) {
    errors.push({ field: "description", message: "Description must be at least 5 characters long." });
  }

  if (priority !== undefined && !TICKET_PRIORITIES.includes(priority)) {
    errors.push({
      field: "priority",
      message: `Priority must be one of: ${TICKET_PRIORITIES.join(", ")}`,
    });
  }

  if (category !== undefined && !TICKET_CATEGORIES.includes(category)) {
    errors.push({
      field: "category",
      message: `Category must be one of: ${TICKET_CATEGORIES.join(", ")}`,
    });
  }

  if (errors.length > 0) {
    return next(new AppError("Validation failed for ticket update.", 400, errors));
  }

  next();
};

export const validateAssignTicket = (req, res, next) => {
  const { assignedTo } = req.body;

  if (!assignedTo || typeof assignedTo !== "string") {
    return next(new AppError("A valid technician 'assignedTo' user ID is required.", 400));
  }

  next();
};

export const validateResolveTicket = (req, res, next) => {
  const { resolutionNotes } = req.body;

  if (!resolutionNotes || typeof resolutionNotes !== "string" || resolutionNotes.trim().length < 5) {
    return next(new AppError("Resolution notes (min 5 characters) are required to resolve a ticket.", 400));
  }

  next();
};
