import { sendError } from "../utils/response.js";

export const errorHandler = (err, req, res, next) => {
  let error = { ...err };
  error.message = err.message;
  error.name = err.name;
  error.statusCode = err.statusCode || 500;

  // Handle Mongoose Bad ObjectId (CastError)
  if (err.name === "CastError") {
    const message = `Invalid ${err.path}: ${err.value}`;
    return sendError(res, {
      statusCode: 400,
      message,
    });
  }

  // Handle Mongoose Duplicate Key Error (E11000)
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue || {})[0] || "field";
    const value = err.keyValue ? err.keyValue[field] : "";
    const message = `Duplicate entry for ${field} '${value}'. Please use another value.`;
    return sendError(res, {
      statusCode: 409,
      message,
    });
  }

  // Handle Mongoose Validation Error
  if (err.name === "ValidationError") {
    const errors = Object.values(err.errors || {}).map((el) => ({
      field: el.path,
      message: el.message,
    }));
    return sendError(res, {
      statusCode: 400,
      message: "Validation failed. Please verify the submitted data.",
      errors,
    });
  }

  // Handle JWT Errors
  if (err.name === "JsonWebTokenError") {
    return sendError(res, {
      statusCode: 401,
      message: "Invalid authentication token. Please log in again.",
    });
  }

  if (err.name === "TokenExpiredError") {
    return sendError(res, {
      statusCode: 401,
      message: "Authentication token has expired. Please refresh your session.",
    });
  }

  // Operational / AppError
  if (err.isOperational) {
    return sendError(res, {
      statusCode: err.statusCode,
      message: err.message,
      errors: err.errors || null,
    });
  }

  // Unhandled / Programming Errors
  console.error("Unhandled Server Error:", err);
  const message =
    process.env.NODE_ENV === "production"
      ? "An unexpected internal server error occurred."
      : err.message || "Internal server error";

  return sendError(res, {
    statusCode: error.statusCode || 500,
    message,
  });
};
