import mongoose from "mongoose";
import AppError from "../utils/appError.js";
import { ARTICLE_CATEGORIES, ARTICLE_VISIBILITIES } from "../utils/constants.js";

export const validateCreateArticle = (req, res, next) => {
  const { title, content, category, visibility, department } = req.body;
  const errors = [];

  if (!title || typeof title !== "string" || title.trim().length < 3) {
    errors.push({ field: "title", message: "Title must be at least 3 characters long." });
  }

  if (!content || typeof content !== "string" || content.trim().length < 10) {
    errors.push({ field: "content", message: "Content must be at least 10 characters long." });
  }

  if (category && !ARTICLE_CATEGORIES.includes(category)) {
    errors.push({
      field: "category",
      message: `Category must be one of: ${ARTICLE_CATEGORIES.join(", ")}`,
    });
  }

  if (visibility && !ARTICLE_VISIBILITIES.includes(visibility)) {
    errors.push({
      field: "visibility",
      message: `Visibility must be one of: ${ARTICLE_VISIBILITIES.join(", ")}`,
    });
  }

  if (department && !mongoose.Types.ObjectId.isValid(department)) {
    errors.push({ field: "department", message: "Invalid department ID format." });
  }

  if (errors.length > 0) {
    return next(new AppError("Validation failed for article creation.", 400, errors));
  }

  next();
};

export const validateUpdateArticle = (req, res, next) => {
  const { title, content, category, visibility, department, status } = req.body;
  const errors = [];

  // Protect publishing workflow from arbitrary PATCH edits
  if (status !== undefined) {
    return next(
      new AppError(
        "Article status cannot be updated directly via PATCH. Use explicit workflow actions (/publish, /archive, /unpublish).",
        400
      )
    );
  }

  if (title !== undefined && (typeof title !== "string" || title.trim().length < 3)) {
    errors.push({ field: "title", message: "Title must be at least 3 characters long." });
  }

  if (content !== undefined && (typeof content !== "string" || content.trim().length < 10)) {
    errors.push({ field: "content", message: "Content must be at least 10 characters long." });
  }

  if (category !== undefined && !ARTICLE_CATEGORIES.includes(category)) {
    errors.push({
      field: "category",
      message: `Category must be one of: ${ARTICLE_CATEGORIES.join(", ")}`,
    });
  }

  if (visibility !== undefined && !ARTICLE_VISIBILITIES.includes(visibility)) {
    errors.push({
      field: "visibility",
      message: `Visibility must be one of: ${ARTICLE_VISIBILITIES.join(", ")}`,
    });
  }

  if (department !== undefined && department !== null && !mongoose.Types.ObjectId.isValid(department)) {
    errors.push({ field: "department", message: "Invalid department ID format." });
  }

  if (errors.length > 0) {
    return next(new AppError("Validation failed for article update.", 400, errors));
  }

  next();
};
