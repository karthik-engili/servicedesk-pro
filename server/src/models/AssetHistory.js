import mongoose from "mongoose";
import { ASSET_HISTORY_ACTIONS } from "../utils/constants.js";

const assetHistorySchema = new mongoose.Schema(
  {
    asset: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Asset",
      required: [true, "Asset reference is required"],
      index: true,
    },
    action: {
      type: String,
      enum: {
        values: ASSET_HISTORY_ACTIONS,
        message: "Invalid asset history action: {VALUE}",
      },
      required: true,
      index: true,
    },
    previousStatus: {
      type: String,
      default: null,
    },
    newStatus: {
      type: String,
      default: null,
    },
    previousAssignee: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    newAssignee: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    performedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    notes: {
      type: String,
      default: "",
    },
    timestamp: {
      type: Date,
      default: Date.now,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

assetHistorySchema.set("toJSON", {
  transform: (doc, ret) => {
    delete ret.__v;
    return ret;
  },
});

const AssetHistory = mongoose.model("AssetHistory", assetHistorySchema);

export default AssetHistory;
