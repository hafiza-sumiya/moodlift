const Story = require("../models/Story");
const Comment = require("../models/Comment");
const User = require("../models/User");

// GET /api/stories — all published stories with pagination, filtering, search
exports.getStories = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      condition,
      sort = "-createdAt",
      search,
    } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const filter = { status: "published" };
    if (condition) filter.condition = condition;

    let query = Story.find(filter);
    if (search) {
      query = Story.find(
        { ...filter, $text: { $search: search } },
        { score: { $meta: "textScore" } },
      ).sort({ score: { $meta: "textScore" } });
    }

    const total = await Story.countDocuments(filter);
    // NOTE: No .populate() — legacy docs store user as String, not ObjectId.
    // The author field (String) is used for display instead.
    const stories = await query
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit))
      .lean();

    res.status(200).json({
      success: true,
      message: "Stories retrieved successfully",
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
      message: "Error fetching stories",
      error: error.message,
    });
  }
};

// GET /api/stories/:id — single story (increments view count)
exports.getStory = async (req, res) => {
  try {
    // No .populate() — prevents CastError on legacy String user fields
    const story = await Story.findByIdAndUpdate(
      req.params.id,
      { $inc: { views: 1 } },
      { new: true },
    ).lean();

    if (!story) {
      return res.status(404).json({ success: false, message: "Story not found" });
    }

    res.status(200).json({ success: true, message: "Story retrieved successfully", data: story });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error fetching story", error: error.message });
  }
};

// POST /api/stories — create a new story (auth required)
exports.createStory = async (req, res) => {
  try {
    const { title, condition, story, tags, anonymous } = req.body;

    // Fetch the user's name from DB — JWT only carries { id }, not name
    const userDoc = await User.findById(req.user.id).lean();
    const authorName = userDoc?.name || "User";

    const newStory = new Story({
      user: req.user.id,
      author: authorName,
      title,
      condition,
      story,
      anonymous: anonymous !== false,
      tags: tags || [],
    });

    await newStory.save();

    res.status(201).json({
      success: true,
      message: "Story created successfully",
      data: newStory,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error creating story",
      error: error.message,
    });
  }
};

// PATCH /api/stories/:id — update own story (auth required)
exports.updateStory = async (req, res) => {
  try {
    const { title, condition, story, tags } = req.body;
    const allowedFields = { title, condition, story, tags };
    Object.keys(allowedFields).forEach(
      (key) => allowedFields[key] === undefined && delete allowedFields[key],
    );

    const existingStory = await Story.findById(req.params.id);
    if (!existingStory) {
      return res.status(404).json({ success: false, message: "Story not found" });
    }

    if (existingStory.user.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: "You can only update your own story" });
    }

    Object.assign(existingStory, allowedFields);
    await existingStory.save();

    res.status(200).json({ success: true, message: "Story updated successfully", data: existingStory });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error updating story", error: error.message });
  }
};

// DELETE /api/stories/:id — delete own story + its comments (auth required)
exports.deleteStory = async (req, res) => {
  try {
    const story = await Story.findById(req.params.id);
    if (!story) {
      return res.status(404).json({ success: false, message: "Story not found" });
    }

    if (story.user.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: "You can only delete your own story" });
    }

    await story.deleteOne();
    await Comment.deleteMany({ storyId: req.params.id });

    res.status(200).json({ success: true, message: "Story and comments deleted", data: story });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error deleting story", error: error.message });
  }
};

// PATCH /api/stories/:id/like — toggle like (auth required, one like per user)
exports.likeStory = async (req, res) => {
  try {
    const userId = req.user.id;
    const story = await Story.findById(req.params.id);
    if (!story) {
      return res.status(404).json({ success: false, message: "Story not found" });
    }

    const alreadyLiked = story.likedBy.includes(userId);
    if (alreadyLiked) {
      story.likedBy.pull(userId);
      story.likes = Math.max(story.likes - 1, 0);
    } else {
      story.likedBy.push(userId);
      story.likes += 1;
    }

    await story.save();
    res.status(200).json({ success: true, liked: !alreadyLiked, likes: story.likes });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error toggling like", error: error.message });
  }
};

// GET /api/auth/my — logged-in user's own stories
exports.getMyStories = async (req, res) => {
  try {
    // No .populate() — prevents CastError on legacy String user fields
    const stories = await Story.find({ user: req.user.id })
      .sort("-createdAt")
      .lean();

    res.status(200).json({ success: true, data: stories });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error fetching your stories", error: error.message });
  }
};
