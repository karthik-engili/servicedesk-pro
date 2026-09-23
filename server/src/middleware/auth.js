import User from "../models/User.js";
import { verifyAccessToken } from "../utils/token.js";
import AppError from "../utils/appError.js";

export const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return next(new AppError("Authentication required. Please provide a Bearer token.", 401));
    }

    const token = authHeader.split(" ")[1];

    if (!token) {
      return next(new AppError("Authentication token is missing.", 401));
    }

    let decoded;
    try {
      decoded = verifyAccessToken(token);
    } catch (err) {
      if (err.name === "TokenExpiredError") {
        return next(new AppError("Access token expired. Please refresh your session.", 401));
      }
      return next(new AppError("Invalid access token.", 401));
    }

    const user = await User.findById(decoded.id).populate("department", "name status");

    if (!user) {
      return next(new AppError("User account associated with this token no longer exists.", 401));
    }

    if (user.status !== "active") {
      return next(new AppError(`Account is ${user.status}. Access denied.`, 403));
    }

    req.user = user;
    next();
  } catch (error) {
    next(error);
  }
};
