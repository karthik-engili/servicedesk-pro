import AppError from "../utils/appError.js";

export const validateCreateDepartment = (req, res, next) => {
  const { name } = req.body;
  const errors = [];

  if (!name || typeof name !== "string" || name.trim().length < 2) {
    errors.push({ field: "name", message: "Department name must be at least 2 characters long." });
  }

  if (errors.length > 0) {
    return next(new AppError("Validation failed for department creation.", 400, errors));
  }

  next();
};

export const validateUpdateDepartment = (req, res, next) => {
  const { name, status } = req.body;
  const errors = [];

  if (name !== undefined && (typeof name !== "string" || name.trim().length < 2)) {
    errors.push({ field: "name", message: "Department name must be at least 2 characters long." });
  }

  if (status !== undefined && !["active", "inactive"].includes(status)) {
    errors.push({ field: "status", message: "Status must be either 'active' or 'inactive'." });
  }

  if (errors.length > 0) {
    return next(new AppError("Validation failed for department update.", 400, errors));
  }

  next();
};
