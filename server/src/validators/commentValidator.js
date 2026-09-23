import AppError from "../utils/appError.js";

export const validateComment = (req, res, next) => {
  const { message } = req.body;

  if (!message || typeof message !== "string" || message.trim().length === 0) {
    return next(new AppError("Comment message cannot be empty.", 400));
  }

  next();
};
