import AppError from "../utils/appError.js";
import { VENDOR_STATUSES } from "../utils/constants.js";

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const validateCreateVendor = (req, res, next) => {
  const { name, email, status } = req.body;
  const errors = [];

  if (!name || typeof name !== "string" || name.trim().length < 2) {
    errors.push({ field: "name", message: "Vendor name must be at least 2 characters long." });
  }

  if (email && (typeof email !== "string" || !emailRegex.test(email.trim()))) {
    errors.push({ field: "email", message: "Please provide a valid vendor email address." });
  }

  if (status && !VENDOR_STATUSES.includes(status)) {
    errors.push({
      field: "status",
      message: `Status must be one of: ${VENDOR_STATUSES.join(", ")}`,
    });
  }

  if (errors.length > 0) {
    return next(new AppError("Validation failed for vendor creation.", 400, errors));
  }

  next();
};

export const validateUpdateVendor = (req, res, next) => {
  const { name, email, status } = req.body;
  const errors = [];

  if (name !== undefined && (typeof name !== "string" || name.trim().length < 2)) {
    errors.push({ field: "name", message: "Vendor name must be at least 2 characters long." });
  }

  if (email !== undefined && email !== "" && (typeof email !== "string" || !emailRegex.test(email.trim()))) {
    errors.push({ field: "email", message: "Please provide a valid vendor email address." });
  }

  if (status !== undefined && !VENDOR_STATUSES.includes(status)) {
    errors.push({
      field: "status",
      message: `Status must be one of: ${VENDOR_STATUSES.join(", ")}`,
    });
  }

  if (errors.length > 0) {
    return next(new AppError("Validation failed for vendor update.", 400, errors));
  }

  next();
};
