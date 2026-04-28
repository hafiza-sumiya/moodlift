const express = require('express');
const Story = require('../models/Story');
const Comment = require('../models/Comment');
const { validateStory, handleValidationErrors } = require('../middleware/validation');

const router = express.Router();

// GET all stories with pagination, filtering, and sorting
router.get('/', async (req, res) => {
  try {
    const { page = 1, limit = 10, condition, sort = '-createdAt', search } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Build filter object
    const filter = { status: 'published' };
    if (condition) {
      filter.condition = condition;
    }

    // Search in title and story content
    let query = Story.find(filter);
    if (search) {
      query = Story.find(
        { ...filter, $text: { $search: search } },
        { score: { $meta: 'textScore' } }
      ).sort({ score: { $meta: 'textScore' } });
    }

    const total = await Story.countDocuments(filter);
    const stories = await query
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit))
      .lean();

    res.status(200).json({
      success: true,
      message: 'Stories retrieved successfully',
      data: {
        stories,
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
      message: 'Error fetching stories',
      error: error.message,
    });
  }
});

// GET single story by ID
router.get('/:id', async (req, res) => {
  try {
    const story = await Story.findByIdAndUpdate(
      req.params.id,
      { $inc: { views: 1 } }, // Increment views
      { new: true }
    );

    if (!story) {
      return res.status(404).json({
        success: false,
        message: 'Story not found',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Story retrieved successfully',
      data: story,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching story',
      error: error.message,
    });
  }
});

// POST create a new story
router.post('/', validateStory, handleValidationErrors, async (req, res) => {
  try {
    const { title, condition, story, author, email, anonymous, tags } = req.body;

    const newStory = new Story({
      title,
      condition,
      story,
      author: anonymous ? 'Anonymous' : author || 'Anonymous',
      email: !anonymous ? email : undefined,
      anonymous: anonymous !== false,
      tags: tags || [],
    });

    await newStory.save();

    res.status(201).json({
      success: true,
      message: 'Story created successfully',
      data: newStory,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error creating story',
      error: error.message,
    });
  }
});

// PATCH update a story
router.patch('/:id', async (req, res) => {
  try {
    const { title, condition, story, author, tags } = req.body;
    const allowedFields = { title, condition, story, author, tags };

    // Remove undefined fields
    Object.keys(allowedFields).forEach(
      (key) => allowedFields[key] === undefined && delete allowedFields[key]
    );

    const updatedStory = await Story.findByIdAndUpdate(
      req.params.id,
      allowedFields,
      {
        new: true,
        runValidators: true,
      }
    );

    if (!updatedStory) {
      return res.status(404).json({
        success: false,
        message: 'Story not found',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Story updated successfully',
      data: updatedStory,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating story',
      error: error.message,
    });
  }
});

// DELETE a story
router.delete('/:id', async (req, res) => {
  try {
    const story = await Story.findByIdAndDelete(req.params.id);

    if (!story) {
      return res.status(404).json({
        success: false,
        message: 'Story not found',
      });
    }

    // Delete all associated comments
    await Comment.deleteMany({ storyId: req.params.id });

    res.status(200).json({
      success: true,
      message: 'Story and associated comments deleted successfully',
      data: story,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error deleting story',
      error: error.message,
    });
  }
});

// PATCH like/unlike a story
router.patch('/:id/like', async (req, res) => {
  try {
    const story = await Story.findByIdAndUpdate(
      req.params.id,
      { $inc: { likes: 1 } },
      { new: true }
    );

    if (!story) {
      return res.status(404).json({
        success: false,
        message: 'Story not found',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Like added successfully',
      data: story,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error liking story',
      error: error.message,
    });
  }
});

module.exports = router;
