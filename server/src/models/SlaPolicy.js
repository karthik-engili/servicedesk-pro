import mongoose from "mongoose";
import { TICKET_PRIORITIES } from "../utils/constants.js";

const slaPolicySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "SLA policy name is required"],
      trim: true,
    },
    priority: {
      type: String,
      enum: {
        values: TICKET_PRIORITIES,
        message: "Invalid priority: {VALUE}",
      },
      required: [true, "Priority is required for SLA policy"],
      unique: true,
      index: true,
    },
    responseTimeMinutes: {
      type: Number,
      required: [true, "Response target in minutes is required"],
      min: [1, "Response target must be at least 1 minute"],
    },
    resolutionTimeMinutes: {
      type: Number,
      required: [true, "Resolution target in minutes is required"],
      min: [1, "Resolution target must be at least 1 minute"],
    },
    businessHoursOnly: {
      type: Boolean,
      default: true,
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
    escalationNotifyRoles: {
      type: [String],
      default: ["it_manager", "system_admin"],
    },
  },
  {
    timestamps: true,
  }
);

slaPolicySchema.set("toJSON", {
  transform: (doc, ret) => {
    delete ret.__v;
    return ret;
  },
});

const SlaPolicy = mongoose.model("SlaPolicy", slaPolicySchema);

export default SlaPolicy;
