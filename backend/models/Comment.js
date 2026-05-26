const mongoose = require("mongoose");

const commentSchema = new mongoose.Schema(
  {
    storyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Story",
      required: true,
    },
    // parentId — if set, this comment is a reply to that comment
    parentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Comment",
      default: null,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    author: {
      type: String,
      trim: true,
      default: "Anonymous User",
      maxlength: [100, "Author name cannot exceed 100 characters"],
    },
    text: {
      type: String,
      required: [true, "Please provide comment text"],
      minlength: [2, "Comment must be at least 2 characters"],
      maxlength: [1000, "Comment cannot exceed 1000 characters"],
    },
    email: {
      type: String,
      lowercase: true,
    },
    anonymous: {
      type: Boolean,
      default: true,
    },
    edited: {
      type: Boolean,
      default: false,
    },
    likes: {
      type: Number,
      default: 0,
      min: 0,
    },
    likedBy: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    isApproved: {
      type: Boolean,
      default: true,
    },
    isBlocked: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true },
);

commentSchema.index({ storyId: 1, parentId: 1, createdAt: -1 });

module.exports = mongoose.model("Comment", commentSchema);
