import mongoose from "mongoose";
import { VENDOR_STATUSES } from "../utils/constants.js";

const vendorSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Vendor name is required"],
      unique: true,
      trim: true,
      minlength: [2, "Vendor name must be at least 2 characters"],
      maxlength: [100, "Vendor name cannot exceed 100 characters"],
      index: true,
    },
    contactPerson: {
      type: String,
      trim: true,
      default: "",
    },
    email: {
      type: String,
      lowercase: true,
      trim: true,
      match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, "Please provide a valid vendor email"],
      default: null,
    },
    phone: {
      type: String,
      trim: true,
      default: "",
    },
    address: {
      type: String,
      trim: true,
      default: "",
    },
    website: {
      type: String,
      trim: true,
      default: "",
    },
    status: {
      type: String,
      enum: {
        values: VENDOR_STATUSES,
        message: "Invalid vendor status: {VALUE}",
      },
      default: "ACTIVE",
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

vendorSchema.set("toJSON", {
  transform: (doc, ret) => {
    delete ret.__v;
    return ret;
  },
});

const Vendor = mongoose.model("Vendor", vendorSchema);

export default Vendor;
