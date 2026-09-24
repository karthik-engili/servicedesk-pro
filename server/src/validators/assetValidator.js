import mongoose from "mongoose";
import AppError from "../utils/appError.js";
import { ASSET_CATEGORIES } from "../utils/constants.js";

export const validateCreateAsset = (req, res, next) => {
  const { assetTag, name, category, purchaseCost, department, vendor, serialNumber } = req.body;
  const errors = [];

  if (!assetTag || typeof assetTag !== "string" || assetTag.trim().length < 2) {
    errors.push({ field: "assetTag", message: "Asset tag is required (min 2 characters)." });
  }

  if (!name || typeof name !== "string" || name.trim().length < 2) {
    errors.push({ field: "name", message: "Asset name is required (min 2 characters)." });
  }

  if (!category || !ASSET_CATEGORIES.includes(category)) {
    errors.push({
      field: "category",
      message: `Category is required and must be one of: ${ASSET_CATEGORIES.join(", ")}`,
    });
  }

  if (purchaseCost !== undefined && (isNaN(purchaseCost) || Number(purchaseCost) < 0)) {
    errors.push({ field: "purchaseCost", message: "Purchase cost cannot be negative." });
  }

  if (department && !mongoose.Types.ObjectId.isValid(department)) {
    errors.push({ field: "department", message: "Invalid department ID format." });
  }

  if (vendor && !mongoose.Types.ObjectId.isValid(vendor)) {
    errors.push({ field: "vendor", message: "Invalid vendor ID format." });
  }

  if (errors.length > 0) {
    return next(new AppError("Validation failed for asset creation.", 400, errors));
  }

  next();
};

export const validateUpdateAsset = (req, res, next) => {
  const { name, category, purchaseCost, department, vendor, status } = req.body;
  const errors = [];

  // Protect lifecycle status from direct modification
  if (status !== undefined) {
    return next(
      new AppError(
        "Asset status cannot be changed directly via PATCH. Use explicit lifecycle actions (/assign, /unassign, /repair, /return, /replace, /retire, /report-lost, /recover).",
        400
      )
    );
  }

  if (name !== undefined && (typeof name !== "string" || name.trim().length < 2)) {
    errors.push({ field: "name", message: "Asset name must be at least 2 characters long." });
  }

  if (category !== undefined && !ASSET_CATEGORIES.includes(category)) {
    errors.push({
      field: "category",
      message: `Category must be one of: ${ASSET_CATEGORIES.join(", ")}`,
    });
  }

  if (purchaseCost !== undefined && (isNaN(purchaseCost) || Number(purchaseCost) < 0)) {
    errors.push({ field: "purchaseCost", message: "Purchase cost cannot be negative." });
  }

  if (department && !mongoose.Types.ObjectId.isValid(department)) {
    errors.push({ field: "department", message: "Invalid department ID format." });
  }

  if (vendor && !mongoose.Types.ObjectId.isValid(vendor)) {
    errors.push({ field: "vendor", message: "Invalid vendor ID format." });
  }

  if (errors.length > 0) {
    return next(new AppError("Validation failed for asset update.", 400, errors));
  }

  next();
};

export const validateAssignAsset = (req, res, next) => {
  const { assignedTo } = req.body;

  if (!assignedTo || !mongoose.Types.ObjectId.isValid(assignedTo)) {
    return next(new AppError("A valid user ID (assignedTo) is required for asset assignment.", 400));
  }

  next();
};
