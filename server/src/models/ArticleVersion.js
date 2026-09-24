import mongoose from "mongoose";

const articleVersionSchema = new mongoose.Schema(
  {
    article: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Article",
      required: [true, "Article reference is required"],
      index: true,
    },
    versionNumber: {
      type: Number,
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    summary: {
      type: String,
      default: "",
    },
    content: {
      type: String,
      required: true,
    },
    category: {
      type: String,
    },
    tags: {
      type: [String],
      default: [],
    },
    visibility: {
      type: String,
    },
    changedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    changeNote: {
      type: String,
      default: "Content revision",
    },
    createdAt: {
      type: Date,
      default: Date.now,
      index: true,
    },
  },
  {
    timestamps: false,
  }
);

articleVersionSchema.set("toJSON", {
  transform: (doc, ret) => {
    delete ret.__v;
    return ret;
  },
});

const ArticleVersion = mongoose.model("ArticleVersion", articleVersionSchema);

export default ArticleVersion;
