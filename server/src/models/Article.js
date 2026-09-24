import mongoose from "mongoose";
import {
  ARTICLE_CATEGORIES,
  ARTICLE_STATUSES,
  ARTICLE_VISIBILITIES,
} from "../utils/constants.js";
import { slugify } from "../utils/slugify.js";

const articleSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Article title is required"],
      trim: true,
      minlength: [3, "Title must be at least 3 characters"],
      maxlength: [200, "Title cannot exceed 200 characters"],
      index: true,
    },
    slug: {
      type: String,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    summary: {
      type: String,
      trim: true,
      default: "",
      maxlength: [500, "Summary cannot exceed 500 characters"],
    },
    content: {
      type: String,
      required: [true, "Article content is required"],
      trim: true,
      minlength: [10, "Content must be at least 10 characters"],
    },
    category: {
      type: String,
      enum: {
        values: ARTICLE_CATEGORIES,
        message: "Invalid article category: {VALUE}",
      },
      default: "GENERAL",
      index: true,
    },
    tags: {
      type: [String],
      default: [],
      index: true,
    },
    visibility: {
      type: String,
      enum: {
        values: ARTICLE_VISIBILITIES,
        message: "Invalid visibility: {VALUE}",
      },
      default: "PUBLIC",
      index: true,
    },
    status: {
      type: String,
      enum: {
        values: ARTICLE_STATUSES,
        message: "Invalid article status: {VALUE}",
      },
      default: "DRAFT",
      index: true,
    },
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Author is required"],
      index: true,
    },
    department: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Department",
      default: null,
      index: true,
    },
    relatedAssets: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Asset",
      },
    ],
    relatedTicketCategories: {
      type: [String],
      default: [],
      index: true,
    },
    helpfulCount: {
      type: Number,
      default: 0,
      min: 0,
    },
    notHelpfulCount: {
      type: Number,
      default: 0,
      min: 0,
    },
    viewCount: {
      type: Number,
      default: 0,
      min: 0,
    },
    publishedAt: {
      type: Date,
      default: null,
      index: true,
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

// Auto-generate unique slug pre-save if missing or modified
articleSchema.pre("validate", async function () {
  if (this.isModified("title") || !this.slug) {
    const baseSlug = slugify(this.title);
    let potentialSlug = baseSlug;
    let count = 1;

    while (
      await mongoose.models.Article.findOne({
        slug: potentialSlug,
        _id: { $ne: this._id },
      })
    ) {
      potentialSlug = `${baseSlug}-${count}`;
      count += 1;
    }
    this.slug = potentialSlug;
  }
});

// Full-text search index
articleSchema.index(
  {
    title: "text",
    summary: "text",
    content: "text",
    tags: "text",
  },
  {
    weights: {
      title: 10,
      summary: 5,
      tags: 4,
      content: 1,
    },
    name: "ArticleTextIndex",
  }
);

articleSchema.set("toJSON", {
  transform: (doc, ret) => {
    delete ret.__v;
    return ret;
  },
});

const Article = mongoose.model("Article", articleSchema);

export default Article;
