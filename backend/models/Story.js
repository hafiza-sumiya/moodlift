const mongoose = require("mongoose");

const storySchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Please provide a title for the story"],
      trim: true,
      maxlength: [200, "Title cannot exceed 200 characters"],
    },
    condition: {
      type: String,
      required: [true, "Please specify the condition or mental health topic"],
      trim: true,
      enum: [
        "Anxiety",
        "Depression",
        "Burnout",
        "Stress",
        "Sleep Issues",
        "PTSD",
        "OCD",
        "Panic Disorder",
        "Other",
      ],
    },
    // Story text content (was wrongly typed as ObjectId — fixed to String)
    story: {
      type: String,
      trim: true,
    },
    // Author reference — kept as String for backward-compat with existing data
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    author: {
      type: String,
      trim: true,
      default: "User",
    },
    anonymous: {
      type: Boolean,
      default: true,
    },
    email: {
      type: String,
      lowercase: true,
      match: [
        /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
        "Please provide a valid email",
      ],
    },
    likes: {
      type: Number,
      default: 0,
      min: 0,
    },
    // Fixed: was single ObjectId — must be an array for .includes() / .pull() to work
    likedBy: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    views: {
      type: Number,
      default: 0,
      min: 0,
    },
    status: {
      type: String,
      enum: ["published", "draft", "flagged"],
      default: "published",
    },
    tags: [
      {
        type: String,
        trim: true,
        lowercase: true,
      },
    ],
  },
  {
    timestamps: true,
  },
);

storySchema.index({ title: "text", story: "text", condition: 1 });
storySchema.index({ createdAt: -1 });

module.exports = mongoose.model("Story", storySchema);
