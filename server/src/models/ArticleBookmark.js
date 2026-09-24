import mongoose from "mongoose";

const articleBookmarkSchema = new mongoose.Schema(
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
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: false,
  }
);

// Prevent duplicate bookmarks by the same user for the same article
articleBookmarkSchema.index({ article: 1, user: 1 }, { unique: true });

articleBookmarkSchema.set("toJSON", {
  transform: (doc, ret) => {
    delete ret.__v;
    return ret;
  },
});

const ArticleBookmark = mongoose.model("ArticleBookmark", articleBookmarkSchema);

export default ArticleBookmark;
