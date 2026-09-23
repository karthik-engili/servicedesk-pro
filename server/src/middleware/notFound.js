import AppError from "../utils/appError.js";

export const notFound = (req, res, next) => {
  next(new AppError(`Resource not found: ${req.method} ${req.originalUrl}`, 404));
};
