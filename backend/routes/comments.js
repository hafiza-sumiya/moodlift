const express = require('express');
const Comment = require('../models/Comment');
const Story = require('../models/Story');
const { validateComment, handleValidationErrors } = require('../middleware/validation');

const router = express.Router({ mergeParams: true });

// GET all comments for a story
router.get('/', async (req, res) => {
  try {
    const { storyId } = req.params;
    const { page = 1, limit = 20, sort = '-createdAt' } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Verify story exists
    const story = await Story.findById(storyId);
    if (!story) {
      return res.status(404).json({
        success: false,
        message: 'Story not found',
      });
    }

    const total = await Comment.countDocuments({
      storyId,
      isApproved: true,
    });

    const comments = await Comment.find({ storyId, isApproved: true })
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit))
      .lean();

    res.status(200).json({
      success: true,
      message: 'Comments retrieved successfully',
      data: {
        comments,
        pagination: {
          total,
          page: parseInt(page),
          limit: parseInt(limit),
          pages: Math.ceil(total / parseInt(limit)),
        },
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching comments',
      error: error.message,
    });
  }
});

// POST create a comment on a story
router.post('/', validateComment, handleValidationErrors, async (req, res) => {
  try {
    const { storyId } = req.params;
    const { author, text, email, anonymous } = req.body;

    // Verify story exists
    const story = await Story.findById(storyId);
    if (!story) {
      return res.status(404).json({
        success: false,
        message: 'Story not found',
      });
    }

    const newComment = new Comment({
      storyId,
      author: anonymous ? 'Anonymous User' : author || 'Anonymous User',
      text,
      email: !anonymous ? email : undefined,
      anonymous: anonymous !== false,
    });

    await newComment.save();

    res.status(201).json({
      success: true,
      message: 'Comment created successfully',
      data: newComment,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error creating comment',
      error: error.message,
    });
  }
});

// PATCH like a comment
router.patch('/:commentId/like', async (req, res) => {
  try {
    const comment = await Comment.findByIdAndUpdate(
      req.params.commentId,
      { $inc: { likes: 1 } },
      { new: true }
    );

    if (!comment) {
      return res.status(404).json({
        success: false,
        message: 'Comment not found',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Like added to comment',
      data: comment,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error liking comment',
      error: error.message,
    });
  }
});

// DELETE a comment
router.delete('/:commentId', async (req, res) => {
  try {
    const comment = await Comment.findByIdAndDelete(req.params.commentId);

    if (!comment) {
      return res.status(404).json({
        success: false,
        message: 'Comment not found',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Comment deleted successfully',
      data: comment,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error deleting comment',
      error: error.message,
    });
  }
});

module.exports = router;
