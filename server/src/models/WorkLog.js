import mongoose from "mongoose";

const workLogSchema = new mongoose.Schema(
  {
    ticket: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Ticket",
      required: [true, "Ticket reference is required"],
      index: true,
    },
    technician: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Technician reference is required"],
      index: true,
    },
    description: {
      type: String,
      required: [true, "Work log description is required"],
      trim: true,
      minlength: [3, "Description must be at least 3 characters"],
      maxlength: [2000, "Description cannot exceed 2000 characters"],
    },
    timeSpentMinutes: {
      type: Number,
      required: [true, "Time spent in minutes is required"],
      min: [1, "Time spent must be at least 1 minute"],
    },
  },
  {
    timestamps: true,
  }
);

workLogSchema.set("toJSON", {
  transform: (doc, ret) => {
    delete ret.__v;
    return ret;
  },
});

const WorkLog = mongoose.model("WorkLog", workLogSchema);

export default WorkLog;
