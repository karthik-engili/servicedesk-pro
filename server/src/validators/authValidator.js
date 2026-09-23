import AppError from "../utils/appError.js";

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const validateRegister = (req, res, next) => {
  const { name, email, password } = req.body;
  const errors = [];

  if (!name || typeof name !== "string" || name.trim().length < 2) {
    errors.push({ field: "name", message: "Name must be at least 2 characters long." });
  }

  if (!email || typeof email !== "string" || !emailRegex.test(email.trim())) {
    errors.push({ field: "email", message: "Please provide a valid email address." });
  }

  if (!password || typeof password !== "string" || password.length < 6) {
    errors.push({ field: "password", message: "Password must be at least 6 characters long." });
  }

  if (errors.length > 0) {
    return next(new AppError("Validation failed for registration.", 400, errors));
  }

  next();
};

export const validateLogin = (req, res, next) => {
  const { email, password } = req.body;
  const errors = [];

  if (!email || typeof email !== "string" || !emailRegex.test(email.trim())) {
    errors.push({ field: "email", message: "Please provide a valid email address." });
  }

  if (!password || typeof password !== "string" || !password.trim()) {
    errors.push({ field: "password", message: "Password is required." });
  }

  if (errors.length > 0) {
    return next(new AppError("Validation failed for login.", 400, errors));
  }

  next();
};

export const validateRefreshToken = (req, res, next) => {
  const { refreshToken } = req.body;

  if (!refreshToken || typeof refreshToken !== "string") {
    return next(new AppError("Refresh token is required.", 400));
  }

  next();
};
