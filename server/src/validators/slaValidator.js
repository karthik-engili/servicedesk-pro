import AppError from "../utils/appError.js";
import { TICKET_PRIORITIES } from "../utils/constants.js";

export const validateCreateSla = (req, res, next) => {
  const { name, priority, responseTimeMinutes, resolutionTimeMinutes } = req.body;
  const errors = [];

  if (!name || typeof name !== "string" || name.trim().length < 2) {
    errors.push({ field: "name", message: "SLA Policy name must be at least 2 characters long." });
  }

  if (!priority || !TICKET_PRIORITIES.includes(priority)) {
    errors.push({
      field: "priority",
      message: `Priority is required and must be one of: ${TICKET_PRIORITIES.join(", ")}`,
    });
  }

  if (!responseTimeMinutes || isNaN(responseTimeMinutes) || Number(responseTimeMinutes) <= 0) {
    errors.push({ field: "responseTimeMinutes", message: "Response time must be a positive number of minutes." });
  }

  if (!resolutionTimeMinutes || isNaN(resolutionTimeMinutes) || Number(resolutionTimeMinutes) <= 0) {
    errors.push({ field: "resolutionTimeMinutes", message: "Resolution time must be a positive number of minutes." });
  }

  if (errors.length > 0) {
    return next(new AppError("Validation failed for SLA Policy creation.", 400, errors));
  }

  next();
};

export const validateUpdateSla = (req, res, next) => {
  const { name, priority, responseTimeMinutes, resolutionTimeMinutes } = req.body;
  const errors = [];

  if (name !== undefined && (typeof name !== "string" || name.trim().length < 2)) {
    errors.push({ field: "name", message: "SLA Policy name must be at least 2 characters long." });
  }

  if (priority !== undefined && !TICKET_PRIORITIES.includes(priority)) {
    errors.push({
      field: "priority",
      message: `Priority must be one of: ${TICKET_PRIORITIES.join(", ")}`,
    });
  }

  if (responseTimeMinutes !== undefined && (isNaN(responseTimeMinutes) || Number(responseTimeMinutes) <= 0)) {
    errors.push({ field: "responseTimeMinutes", message: "Response time must be a positive number." });
  }

  if (resolutionTimeMinutes !== undefined && (isNaN(resolutionTimeMinutes) || Number(resolutionTimeMinutes) <= 0)) {
    errors.push({ field: "resolutionTimeMinutes", message: "Resolution time must be a positive number." });
  }

  if (errors.length > 0) {
    return next(new AppError("Validation failed for SLA Policy update.", 400, errors));
  }

  next();
};
