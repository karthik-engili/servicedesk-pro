import mongoose from "mongoose";
import { ASSET_STATUSES, ASSET_CATEGORIES } from "../utils/constants.js";

const assetSchema = new mongoose.Schema(
  {
    assetTag: {
      type: String,
      required: [true, "Asset tag is required"],
      unique: true,
      trim: true,
      uppercase: true,
      index: true,
    },
    name: {
      type: String,
      required: [true, "Asset name is required"],
      trim: true,
      minlength: [2, "Asset name must be at least 2 characters"],
      maxlength: [150, "Asset name cannot exceed 150 characters"],
    },
    description: {
      type: String,
      trim: true,
      default: "",
    },
    category: {
      type: String,
      enum: {
        values: ASSET_CATEGORIES,
        message: "Invalid asset category: {VALUE}",
      },
      required: [true, "Asset category is required"],
      default: "LAPTOP",
      index: true,
    },
    assetType: {
      type: String,
      trim: true,
      default: "",
    },
    serialNumber: {
      type: String,
      trim: true,
      sparse: true,
      index: true,
    },
    manufacturer: {
      type: String,
      trim: true,
      default: "",
    },
    model: {
      type: String,
      trim: true,
      default: "",
    },
    purchaseDate: {
      type: Date,
      default: null,
    },
    purchaseCost: {
      type: Number,
      default: 0,
      min: [0, "Purchase cost cannot be negative"],
    },
    warrantyExpiry: {
      type: Date,
      default: null,
      index: true,
    },
    status: {
      type: String,
      enum: {
        values: ASSET_STATUSES,
        message: "Invalid asset status: {VALUE}",
      },
      default: "AVAILABLE",
      index: true,
    },
    location: {
      type: String,
      trim: true,
      default: "",
    },
    department: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Department",
      default: null,
      index: true,
    },
    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
      index: true,
    },
    assignedDate: {
      type: Date,
      default: null,
    },
    assignedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    vendor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Vendor",
      default: null,
      index: true,
    },
    notes: {
      type: String,
      trim: true,
      default: "",
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

assetSchema.set("toJSON", {
  transform: (doc, ret) => {
    delete ret.__v;
    return ret;
  },
});

const Asset = mongoose.model("Asset", assetSchema);

export default Asset;
