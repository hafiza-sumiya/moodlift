const mongoose = require('mongoose');

const storySchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Please provide a title for the story'],
      trim: true,
      maxlength: [200, 'Title cannot exceed 200 characters'],
    },
    condition: {
      type: String,
      required: [true, 'Please specify the condition or mental health topic'],
      trim: true,
      enum: [
        'Anxiety',
        'Depression',
        'Burnout',
        'Stress',
        'Sleep Issues',
        'PTSD',
        'OCD',
        'Panic Disorder',
        'Other',
      ],
    },
    story: {
      type: String,
      required: [true, 'Please provide the recovery story'],
      minlength: [1, 'Story must not be empty'],
      maxlength: [5000, 'Story cannot exceed 5000 characters'],
    },
    author: {
      type: String,
      trim: true,
      default: 'User',
    },
    anonymous: {
      type: Boolean,
      default: true,
    },
    email: {
      type: String,
      lowercase: true,
      match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, 'Please provide a valid email'],
    },
    likes: {
      type: Number,
      default: 0,
      min: 0,
    },
    views: {
      type: Number,
      default: 0,
      min: 0,
    },
    status: {
      type: String,
      enum: ['published', 'draft', 'flagged'],
      default: 'published',
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
  }
);

// Index for search functionality
storySchema.index({ title: 'text', story: 'text', condition: 1 });
storySchema.index({ createdAt: -1 });

module.exports = mongoose.model('Story', storySchema);
