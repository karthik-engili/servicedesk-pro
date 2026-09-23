import mongoose from "mongoose";
import {
  TICKET_PRIORITIES,
  TICKET_STATUSES,
  TICKET_CATEGORIES,
  SLA_STATUSES,
} from "../utils/constants.js";
import { getNextSequence } from "./Counter.js";

const ticketSchema = new mongoose.Schema(
  {
    ticketNumber: {
      type: String,
      unique: true,
      index: true,
    },
    title: {
      type: String,
      required: [true, "Ticket title is required"],
      trim: true,
      minlength: [3, "Title must be at least 3 characters"],
      maxlength: [200, "Title cannot exceed 200 characters"],
    },
    description: {
      type: String,
      required: [true, "Ticket description is required"],
      trim: true,
      minlength: [5, "Description must be at least 5 characters"],
    },
    category: {
      type: String,
      enum: {
        values: TICKET_CATEGORIES,
        message: "Invalid category: {VALUE}",
      },
      default: "GENERAL",
      index: true,
    },
    priority: {
      type: String,
      enum: {
        values: TICKET_PRIORITIES,
        message: "Invalid priority: {VALUE}",
      },
      default: "MEDIUM",
      index: true,
    },
    status: {
      type: String,
      enum: {
        values: TICKET_STATUSES,
        message: "Invalid status: {VALUE}",
      },
      default: "OPEN",
      index: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Requester (createdBy) is required"],
      index: true,
    },
    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
      index: true,
    },
    department: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Department",
      default: null,
      index: true,
    },
    asset: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Asset",
      default: null,
      index: true,
    },
    slaPolicy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "SlaPolicy",
      default: null,
    },
    responseDeadline: {
      type: Date,
      default: null,
      index: true,
    },
    resolutionDeadline: {
      type: Date,
      default: null,
      index: true,
    },
    respondedAt: {
      type: Date,
      default: null,
    },
    resolvedAt: {
      type: Date,
      default: null,
    },
    closedAt: {
      type: Date,
      default: null,
    },
    slaStatus: {
      type: String,
      enum: {
        values: SLA_STATUSES,
        message: "Invalid SLA status: {VALUE}",
      },
      default: "WITHIN_SLA",
      index: true,
    },
    slaBreached: {
      type: Boolean,
      default: false,
      index: true,
    },
    escalationTriggered: {
      type: Boolean,
      default: false,
    },
    resolutionNotes: {
      type: String,
      default: "",
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

ticketSchema.pre("save", async function () {
  if (this.isNew && !this.ticketNumber) {
    const seq = await getNextSequence("ticketNumber");
    this.ticketNumber = `SD-${seq}`;
  }
});

ticketSchema.set("toJSON", {
  transform: (doc, ret) => {
    delete ret.__v;
    return ret;
  },
});

const Ticket = mongoose.model("Ticket", ticketSchema);

export default Ticket;
