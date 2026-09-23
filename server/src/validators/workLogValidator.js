import AppError from "../utils/appError.js";

export const validateWorkLog = (req, res, next) => {
  const { description, timeSpentMinutes } = req.body;
  const errors = [];

  if (!description || typeof description !== "string" || description.trim().length < 3) {
    errors.push({ field: "description", message: "Work description must be at least 3 characters long." });
  }

  if (timeSpentMinutes === undefined || isNaN(timeSpentMinutes) || Number(timeSpentMinutes) <= 0) {
    errors.push({ field: "timeSpentMinutes", message: "Time spent in minutes must be a positive number." });
  }

  if (errors.length > 0) {
    return next(new AppError("Validation failed for work log entry.", 400, errors));
  }

  next();
};
