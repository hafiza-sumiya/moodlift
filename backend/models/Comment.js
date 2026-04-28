const mongoose = require('mongoose');

const commentSchema = new mongoose.Schema(
  {
    storyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Story',
      required: true,
    },
    author: {
      type: String,
      trim: true,
      default: 'Anonymous User',
      maxlength: [100, 'Author name cannot exceed 100 characters'],
    },
    text: {
      type: String,
      required: [true, 'Please provide comment text'],
      minlength: [5, 'Comment must be at least 5 characters'],
      maxlength: [1000, 'Comment cannot exceed 1000 characters'],
    },
    email: {
      type: String,
      lowercase: true,
      match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, 'Please provide a valid email'],
    },
    anonymous: {
      type: Boolean,
      default: true,
    },
    likes: {
      type: Number,
      default: 0,
      min: 0,
    },
    isApproved: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

// Automatically delete comments when story is deleted
commentSchema.index({ storyId: 1, createdAt: -1 });

module.exports = mongoose.model('Comment', commentSchema);
