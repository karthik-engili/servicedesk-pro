import mongoose from "mongoose";
import { TICKET_CATEGORIES, TICKET_PRIORITIES } from "../utils/constants.js";

const aiTicketAnalysisSchema = new mongoose.Schema(
  {
    ticket: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Ticket",
      required: [true, "Ticket reference is required for AI analysis"],
      index: true,
    },
    analyzedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "User initiating analysis is required"],
    },
    model: {
      type: String,
      default: "unknown",
      trim: true,
    },
    provider: {
      type: String,
      default: "openrouter",
      trim: true,
    },
    categorySuggestion: {
      type: String,
      enum: {
        values: [...TICKET_CATEGORIES, null],
        message: "Invalid suggested category: {VALUE}",
      },
      default: null,
    },
    categoryConfidence: {
      type: Number,
      min: 0,
      max: 1,
      default: 0,
    },
    prioritySuggestion: {
      type: String,
      enum: {
        values: [...TICKET_PRIORITIES, null],
        message: "Invalid suggested priority: {VALUE}",
      },
      default: null,
    },
    priorityConfidence: {
      type: Number,
      min: 0,
      max: 1,
      default: 0,
    },
    riskLevel: {
      type: String,
      enum: ["LOW", "MEDIUM", "HIGH", "CRITICAL"],
      default: "LOW",
    },
    risks: {
      type: [String],
      default: [],
    },
    escalationRecommended: {
      type: Boolean,
      default: false,
    },
    escalationReason: {
      type: String,
      default: "",
      trim: true,
    },
    articleRecommendations: [
      {
        articleId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Article",
        },
        title: {
          type: String,
          default: "",
        },
        relevance: {
          type: Number,
          default: 0,
        },
        reason: {
          type: String,
          default: "",
        },
      },
    ],
    solutionDraft: {
      type: String,
      default: "",
      trim: true,
    },
    reasoning: {
      type: String,
      default: "",
      trim: true,
    },
    aiAvailable: {
      type: Boolean,
      default: true,
    },
    source: {
      type: String,
      default: "ai_provider",
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

aiTicketAnalysisSchema.index({ ticket: 1, createdAt: -1 });

aiTicketAnalysisSchema.set("toJSON", {
  transform: (doc, ret) => {
    delete ret.__v;
    return ret;
  },
});

const AiTicketAnalysis = mongoose.model("AiTicketAnalysis", aiTicketAnalysisSchema);

export default AiTicketAnalysis;
