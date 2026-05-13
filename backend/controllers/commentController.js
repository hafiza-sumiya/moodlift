const Comment = require("../models/Comment");
const Story = require("../models/Story");

// GET /api/stories/:storyId/comments — all approved comments (top-level + replies)
exports.getComments = async (req, res) => {
  try {
    const { storyId } = req.params;
    const { page = 1, limit = 50, sort = "-createdAt" } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const story = await Story.findById(storyId);
    if (!story) {
      return res.status(404).json({ success: false, message: "Story not found" });
    }

    const total = await Comment.countDocuments({ storyId, isApproved: true });
    const comments = await Comment.find({ storyId, isApproved: true })
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit))
      .lean();

    res.status(200).json({
      success: true,
      message: "Comments retrieved successfully",
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
    res.status(500).json({ success: false, message: "Error fetching comments", error: error.message });
  }
};

// POST /api/stories/:storyId/comments — create comment or reply (auth required)
exports.createComment = async (req, res) => {
  try {
    const { storyId } = req.params;
    const { text, email, anonymous, author, parentId } = req.body;

    const story = await Story.findById(storyId);
    if (!story) {
      return res.status(404).json({ success: false, message: "Story not found" });
    }

    // If parentId given, verify parent exists
    if (parentId) {
      const parent = await Comment.findById(parentId);
      if (!parent || parent.storyId.toString() !== storyId) {
        return res.status(404).json({ success: false, message: "Parent comment not found" });
      }
    }

    const isAnon = anonymous !== false;

    const newComment = new Comment({
      storyId,
      parentId: parentId || null,
      user: req.user.id,
      author: isAnon ? "Anonymous User" : (author?.trim() || "User"),
      text,
      email: !isAnon ? email : undefined,
      anonymous: isAnon,
    });

    await newComment.save();

    res.status(201).json({ success: true, message: "Comment created successfully", data: newComment });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error creating comment", error: error.message });
  }
};

// PATCH /api/stories/:storyId/comments/:commentId — edit own comment (auth required)
exports.updateComment = async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.commentId);

    if (!comment || comment.storyId.toString() !== req.params.storyId) {
      return res.status(404).json({ success: false, message: "Comment not found" });
    }

    if (comment.user?.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: "You can only edit your own comment" });
    }

    const newText = req.body.text?.trim();
    if (!newText || newText.length < 2) {
      return res.status(400).json({ success: false, message: "Comment text must be at least 2 characters" });
    }

    comment.text = newText;
    comment.edited = true;
    await comment.save();

    res.status(200).json({ success: true, message: "Comment updated", data: comment });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error updating comment", error: error.message });
  }
};

// PATCH /api/stories/:storyId/comments/:commentId/like — toggle like (auth required)
exports.likeComment = async (req, res) => {
  try {
    const userId = req.user.id;
    const comment = await Comment.findById(req.params.commentId);

    if (!comment || comment.storyId.toString() !== req.params.storyId) {
      return res.status(404).json({ success: false, message: "Comment not found" });
    }

    const alreadyLiked = comment.likedBy.includes(userId);

    if (alreadyLiked) {
      comment.likedBy.pull(userId);
      comment.likes = Math.max(comment.likes - 1, 0);
    } else {
      comment.likedBy.push(userId);
      comment.likes += 1;
    }

    await comment.save();

    res.status(200).json({ success: true, liked: !alreadyLiked, likes: comment.likes });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error toggling comment like", error: error.message });
  }
};

// DELETE /api/stories/:storyId/comments/:commentId (auth required)
exports.deleteComment = async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.commentId);

    if (!comment || comment.storyId.toString() !== req.params.storyId) {
      return res.status(404).json({ success: false, message: "Comment not found" });
    }

    if (comment.user?.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: "You can only delete your own comment" });
    }

    await comment.deleteOne();
    // Also delete all replies to this comment
    await Comment.deleteMany({ parentId: comment._id });

    res.status(200).json({ success: true, message: "Comment deleted", data: comment });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error deleting comment", error: error.message });
  }
};
