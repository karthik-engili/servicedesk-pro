import mongoose from "mongoose";
import AppError from "../utils/appError.js";
import { TICKET_CATEGORIES, TICKET_PRIORITIES } from "../utils/constants.js";

export const validateTicketId = (req, res, next) => {
  const { id } = req.params;
  if (!id || !mongoose.Types.ObjectId.isValid(id)) {
    return next(new AppError("Invalid ticket ID format. Must be a valid 24-character hexadecimal ID.", 400));
  }
  next();
};

export const validateApplyCategory = (req, res, next) => {
  const { category } = req.body;
  if (!category || typeof category !== "string") {
    return next(new AppError("Category is required in request body.", 400));
  }

  if (!TICKET_CATEGORIES.includes(category)) {
    return next(
      new AppError(
        `Invalid category '${category}'. Allowed categories: ${TICKET_CATEGORIES.join(", ")}`,
        400
      )
    );
  }

  next();
};

export const validateApplyPriority = (req, res, next) => {
  const { priority } = req.body;
  if (!priority || typeof priority !== "string") {
    return next(new AppError("Priority is required in request body.", 400));
  }

  if (!TICKET_PRIORITIES.includes(priority)) {
    return next(
      new AppError(
        `Invalid priority '${priority}'. Allowed priorities: ${TICKET_PRIORITIES.join(", ")}`,
        400
      )
    );
  }

  next();
};
