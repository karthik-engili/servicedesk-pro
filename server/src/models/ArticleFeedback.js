import mongoose from "mongoose";

const articleFeedbackSchema = new mongoose.Schema(
  {
    article: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Article",
      required: [true, "Article reference is required"],
      index: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "User reference is required"],
      index: true,
    },
    feedback: {
      type: String,
      enum: {
        values: ["HELPFUL", "NOT_HELPFUL"],
        message: "Feedback must be HELPFUL or NOT_HELPFUL",
      },
      required: true,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: false,
  }
);

articleFeedbackSchema.index({ article: 1, user: 1 }, { unique: true });

articleFeedbackSchema.set("toJSON", {
  transform: (doc, ret) => {
    delete ret.__v;
    return ret;
  },
});

const ArticleFeedback = mongoose.model("ArticleFeedback", articleFeedbackSchema);

export default ArticleFeedback;
