const User = require("../models/User");
const Story = require("../models/Story");
const Comment = require("../models/Comment");

// ─── USER MANAGEMENT ─────────────────────────────────────────────────────────────

// Get all users with pagination and filtering
exports.getAllUsers = async (req, res) => {
  try {
    console.log("👥 [Users] Fetching users for admin...", req.query);
    const { page = 1, limit = 20, search, status } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const filter = {};
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
      ];
    }
    if (status === "blocked") {
      filter.isBlocked = true;
    } else if (status === "active") {
      filter.isBlocked = false;
    } else if (status === "admin") {
      filter.isAdmin = true;
    }

    console.log("👥 [Users] Filter:", filter);

    const total = await User.countDocuments(filter);
    const users = await User.find(filter)
      .select("-password")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    // Enrich users with story and comment counts
    const enrichedUsers = await Promise.all(
      users.map(async (user) => {
        const storiesCount = await Story.countDocuments({ user: user._id });
        const commentsCount = await Comment.countDocuments({ user: user._id });
        
        return {
          ...user.toObject(),
          stats: {
            stories: storiesCount,
            comments: commentsCount,
          },
        };
      })
    );

    console.log("✅ [Users] Retrieved", enrichedUsers.length, "users with stats");

    res.status(200).json({
      success: true,
      message: "Users retrieved successfully",
      data: {
        users: enrichedUsers,
        pagination: {
          total,
          page: parseInt(page),
          limit: parseInt(limit),
          pages: Math.ceil(total / parseInt(limit)),
        },
      },
    });
  } catch (error) {
    console.error("❌ [Users] Error fetching users:", error.message, error.stack);
    res.status(500).json({
      success: false,
      message: "Error fetching users",
      error: error.message,
    });
  }
};

// Get single user by ID
exports.getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select("-password").lean(); // lean --> simple JS obj/ No extra things
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Get user's stories count
    const storiesCount = await Story.countDocuments({ user: req.params.id });
    const commentsCount = await Comment.countDocuments({ user: req.params.id });

    res.status(200).json({
      success: true,
      message: "User retrieved successfully",
      data: {
        ...user,
        stats: {
          storiesCount,
          commentsCount,
        },
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching user",
      error: error.message,
    });
  }
};

// Block/Unblock user
exports.toggleBlockUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Prevent admin from blocking themselves
    if (user._id.toString() === req.admin._id.toString()) {
      return res.status(400).json({
        success: false,
        message: "You cannot block yourself",
      });
    }

    // Prevent blocking other admins
    if (user.isAdmin) {
      return res.status(400).json({
        success: false,
        message: "You cannot block another admin",
      });
    }

    user.isBlocked = !user.isBlocked;
    await user.save();

    res.status(200).json({
      success: true,
      message: user.isBlocked ? "User blocked successfully" : "User unblocked successfully",
      data: {
        id: user._id,
        isBlocked: user.isBlocked,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error toggling user block status",
      error: error.message,
    });
  }
};

// Delete user
exports.deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Prevent admin from deleting themselves
    if (user._id.toString() === req.admin._id.toString()) {
      return res.status(400).json({
        success: false,
        message: "You cannot delete yourself",
      });
    }

    // Prevent deleting other admins
    if (user.isAdmin) {
      return res.status(400).json({
        success: false,
        message: "You cannot delete another admin",
      });
    }

    // Delete user's stories and comments
    await Story.deleteMany({ user: req.params.id });
    await Comment.deleteMany({ user: req.params.id });
    await user.deleteOne();

    res.status(200).json({
      success: true,
      message: "User and all associated data deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error deleting user",
      error: error.message,
    });
  }
};

// Make user an admin
exports.makeAdmin = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Prevent making the user an admin if already an admin
    if (user.isAdmin) {
      return res.status(400).json({
        success: false,
        message: "User is already an admin",
      });
    }

    user.isAdmin = true;
    await user.save();

    res.status(200).json({
      success: true,
      message: "User promoted to admin successfully",
      data: {
        id: user._id,
        isAdmin: user.isAdmin,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error promoting user to admin",
      error: error.message,
    });
  }
};

// Remove admin privileges from user
exports.removeAdmin = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Prevent removing admin from themselves
    if (user._id.toString() === req.admin._id.toString()) {
      return res.status(400).json({
        success: false,
        message: "You cannot remove admin privileges from yourself",
      });
    }

    // Prevent removing admin if not currently an admin
    if (!user.isAdmin) {
      return res.status(400).json({
        success: false,
        message: "User is not an admin",
      });
    }

    user.isAdmin = false;
    await user.save();

    res.status(200).json({
      success: true,
      message: "Admin privileges removed successfully",
      data: {
        id: user._id,
        isAdmin: user.isAdmin,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error removing admin privileges",
      error: error.message,
    });
  }
};


// ─── STORY MANAGEMENT ────────────────────────────────────────────────────────────

// Get all stories with pagination and filtering
exports.getAllStories = async (req, res) => {
  try {
    console.log("📖 [Stories] Fetching stories for admin...", req.query);
    const { page = 1, limit = 20, search, condition, status } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const filter = {};
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: "i" } },
        { story: { $regex: search, $options: "i" } },
      ];
    }
    if (condition) {
      filter.condition = condition;
    }
    if (status === "blocked") {
      filter.isBlocked = true;
    } else if (status === "active") {
      filter.isBlocked = false;
    } else if (status === "flagged") {
      filter.status = "flagged";
    }

    console.log("📖 [Stories] Filter:", filter);

    const total = await Story.countDocuments(filter);
    console.log("📖 [Stories] Total stories found:", total);

    const stories = await Story.find(filter)
      .select("_id title story condition user isBlocked status createdAt updatedAt")
      .populate({
        path: "user",
        select: "name email isAdmin",
        model: "User"
      })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    console.log("✅ [Stories] Retrieved", stories.length, "stories");

    res.status(200).json({
      success: true,
      message: "Stories retrieved successfully",
      data: {
        stories: stories,
        pagination: {
          total,
          page: parseInt(page),
          limit: parseInt(limit),
          pages: Math.ceil(total / parseInt(limit)),
        },
      },
    });
  } catch (error) {
    console.error("❌ [Stories] Error fetching stories:", error.message, error.stack);
    res.status(500).json({
      success: false,
      message: "Error fetching stories",
      error: error.message,
    });
  }
};

// Get single story by ID
exports.getStoryById = async (req, res) => {
  try {
    const story = await Story.findById(req.params.id)
      .populate("user", "name email isAdmin")
      .lean();
    
    if (!story) {
      return res.status(404).json({
        success: false,
        message: "Story not found",
      });
    }

    // Get comments count for this story
    const commentsCount = await Comment.countDocuments({ storyId: req.params.id });

    res.status(200).json({
      success: true,
      message: "Story retrieved successfully",
      data: {
        ...story,
        stats: {
          commentsCount,
        },
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching story",
      error: error.message,
    });
  }
};

// Block/Unblock story
exports.toggleBlockStory = async (req, res) => {
  try {
    const story = await Story.findById(req.params.id);
    
    if (!story) {
      return res.status(404).json({
        success: false,
        message: "Story not found",
      });
    }

    story.isBlocked = !story.isBlocked;
    await story.save();

    res.status(200).json({
      success: true,
      message: story.isBlocked ? "Story blocked successfully" : "Story unblocked successfully",
      data: {
        id: story._id,
        isBlocked: story.isBlocked,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error toggling story block status",
      error: error.message,
    });
  }
};

// Delete story
exports.deleteStoryAdmin = async (req, res) => {
  try {
    const story = await Story.findById(req.params.id);
    
    if (!story) {
      return res.status(404).json({
        success: false,
        message: "Story not found",
      });
    }

    // Delete story and all its comments
    await Comment.deleteMany({ storyId: req.params.id });
    await story.deleteOne();

    res.status(200).json({
      success: true,
      message: "Story and all comments deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error deleting story",
      error: error.message,
    });
  }
};

// Update story status (published/draft/flagged)
exports.updateStoryStatus = async (req, res) => {
  try {
    const { status } = req.body;
    
    if (!["published", "draft", "flagged"].includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid status. Must be published, draft, or flagged",
      });
    }

    const story = await Story.findById(req.params.id);
    
    if (!story) {
      return res.status(404).json({
        success: false,
        message: "Story not found",
      });
    }

    story.status = status;
    await story.save();

    res.status(200).json({
      success: true,
      message: "Story status updated successfully",
      data: {
        id: story._id,
        status: story.status,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error updating story status",
      error: error.message,
    });
  }
};

// ─── COMMENT MANAGEMENT ──────────────────────────────────────────────────────────

// Get all comments with pagination and filtering
exports.getAllComments = async (req, res) => {
  try {
    console.log("💬 [Comments] Fetching comments for admin...", req.query);
    const { page = 1, limit = 20, search, status } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const filter = {};
    if (search) {
      filter.$or = [
        { text: { $regex: search, $options: "i" } },
        { author: { $regex: search, $options: "i" } },
      ];
    }
    if (status === "blocked") {
      filter.isBlocked = true;
    } else if (status === "active") {
      filter.isBlocked = false;
    } else if (status === "pending") {
      filter.isApproved = false;
    }

    console.log("💬 [Comments] Filter:", filter);

    const total = await Comment.countDocuments(filter);
    console.log("💬 [Comments] Total comments found:", total);

    const comments = await Comment.find(filter)
      .select("_id text user storyId isBlocked isApproved createdAt updatedAt")
      .populate({
        path: "user",
        select: "name email isAdmin",
        model: "User"
      })
      .populate({
        path: "storyId",
        select: "title",
        model: "Story"
      })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    console.log("✅ [Comments] Retrieved", comments.length, "comments");

    res.status(200).json({
      success: true,
      message: "Comments retrieved successfully",
      data: {
        comments: comments,
        pagination: {
          total,
          page: parseInt(page),
          limit: parseInt(limit),
          pages: Math.ceil(total / parseInt(limit)),
        },
      },
    });
  } catch (error) {
    console.error("❌ [Comments] Error fetching comments:", error.message, error.stack);
    res.status(500).json({
      success: false,
      message: "Error fetching comments",
      error: error.message,
    });
  }
};

// Get single comment by ID
exports.getCommentById = async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.id)
      .populate("user", "name email isAdmin")
      .populate("storyId", "title condition")
      .lean();
    
    if (!comment) {
      return res.status(404).json({
        success: false,
        message: "Comment not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Comment retrieved successfully",
      data: comment,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching comment",
      error: error.message,
    });
  }
};

// Block/Unblock comment
exports.toggleBlockComment = async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.id);
    
    if (!comment) {
      return res.status(404).json({
        success: false,
        message: "Comment not found",
      });
    }

    comment.isBlocked = !comment.isBlocked;
    await comment.save();

    res.status(200).json({
      success: true,
      message: comment.isBlocked ? "Comment blocked successfully" : "Comment unblocked successfully",
      data: {
        id: comment._id,
        isBlocked: comment.isBlocked,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error toggling comment block status",
      error: error.message,
    });
  }
};

// Delete comment
exports.deleteCommentAdmin = async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.id);
    
    if (!comment) {
      return res.status(404).json({
        success: false,
        message: "Comment not found",
      });
    }

    // Delete comment and all its replies
    await Comment.deleteMany({ parentId: req.params.id });
    await comment.deleteOne();

    res.status(200).json({
      success: true,
      message: "Comment and all replies deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error deleting comment",
      error: error.message,
    });
  }
};

// Approve/Unapprove comment
exports.toggleApproveComment = async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.id);
    
    if (!comment) {
      return res.status(404).json({
        success: false,
        message: "Comment not found",
      });
    }

    comment.isApproved = !comment.isApproved;
    await comment.save();

    res.status(200).json({
      success: true,
      message: comment.isApproved ? "Comment approved successfully" : "Comment unapproved successfully",
      data: {
        id: comment._id,
        isApproved: comment.isApproved,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error toggling comment approval status",
      error: error.message,
    });
  }
};

// ─── DASHBOARD STATS ─────────────────────────────────────────────────────────────

// Get dashboard statistics
exports.getDashboardStats = async (req, res) => {
  try {
    console.log("📊 [Dashboard] Fetching dashboard stats for admin:", req.admin._id);

    // User statistics
    const totalUsers = await User.countDocuments();
    const activeUsers = await User.countDocuments({ isBlocked: false });
    const blockedUsers = await User.countDocuments({ isBlocked: true });
    const adminUsers = await User.countDocuments({ isAdmin: true });

    console.log("✅ [Dashboard] User stats:", { totalUsers, activeUsers, blockedUsers, adminUsers });

    // Story statistics
    const totalStories = await Story.countDocuments();
    const activeStories = await Story.countDocuments({ isBlocked: false });
    const blockedStories = await Story.countDocuments({ isBlocked: true });
    const flaggedStories = await Story.countDocuments({ status: "flagged" });

    console.log("✅ [Dashboard] Story stats:", { totalStories, activeStories, blockedStories, flaggedStories });

    // Comment statistics
    const totalComments = await Comment.countDocuments();
    const activeComments = await Comment.countDocuments({ isBlocked: false, isApproved: true });
    const blockedComments = await Comment.countDocuments({ isBlocked: true });
    const pendingComments = await Comment.countDocuments({ isApproved: false });

    console.log("✅ [Dashboard] Comment stats:", { totalComments, activeComments, blockedComments, pendingComments });

    // Get recent activity (simplified to avoid populate issues)
    const recentUsers = await User.find()
      .select("-password")
      .sort({ createdAt: -1 })
      .limit(5)
      .lean();

    const recentStories = await Story.find()
      .select("title user condition createdAt isBlocked")
      .sort({ createdAt: -1 })
      .limit(5)
      .lean();

    const recentComments = await Comment.find()
      .select("text user storyId createdAt isApproved")
      .sort({ createdAt: -1 })
      .limit(5)
      .lean();

    console.log("✅ [Dashboard] Recent activity loaded");

    res.status(200).json({
      success: true,
      message: "Dashboard statistics retrieved successfully",
      data: {
        users: {
          total: totalUsers,
          active: activeUsers,
          blocked: blockedUsers,
          admins: adminUsers,
        },
        stories: {
          total: totalStories,
          active: activeStories,
          blocked: blockedStories,
          flagged: flaggedStories,
        },
        comments: {
          total: totalComments,
          active: activeComments,
          blocked: blockedComments,
          pending: pendingComments,
        },
        recentActivity: {
          users: recentUsers,
          stories: recentStories,
          comments: recentComments,
        },
      },
    });
  } catch (error) {
    console.error("❌ [Dashboard] Error fetching stats:", error.message, error.stack);
    res.status(500).json({
      success: false,
      message: "Error fetching dashboard statistics",
      error: error.message,
    });
  }
};
