import mongoose from "mongoose";

const commentSchema = new mongoose.Schema(
  {
    ticket: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Ticket",
      required: [true, "Ticket reference is required"],
      index: true,
    },
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Author reference is required"],
      index: true,
    },
    message: {
      type: String,
      required: [true, "Comment message is required"],
      trim: true,
      minlength: [1, "Comment message cannot be empty"],
      maxlength: [3000, "Comment cannot exceed 3000 characters"],
    },
    isInternal: {
      type: Boolean,
      default: false,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

commentSchema.set("toJSON", {
  transform: (doc, ret) => {
    delete ret.__v;
    return ret;
  },
});

const Comment = mongoose.model("Comment", commentSchema);

export default Comment;
