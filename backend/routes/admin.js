const express = require("express");
const auth = require("../middleware/authMiddleware");
const adminAuth = require("../middleware/adminMiddleware");
const {
  // User management
  getAllUsers,
  getUserById,
  toggleBlockUser,
  deleteUser,
  makeAdmin,
  removeAdmin,
  // Story management
  getAllStories,
  getStoryById,
  toggleBlockStory,
  deleteStoryAdmin,
  updateStoryStatus,
  // Comment management
  getAllComments,
  getCommentById,
  toggleBlockComment,
  deleteCommentAdmin,
  toggleApproveComment,
  // Dashboard
  getDashboardStats,
} = require("../controllers/adminController");

const router = express.Router();

// All admin routes require authentication and admin privileges
router.use(auth);
router.use(adminAuth);

// ─── Dashboard ─────────────────────────────────────────────────────────────────
router.get("/dashboard/stats", getDashboardStats);

// ─── User Management ─────────────────────────────────────────────────────────────
router.get("/users", getAllUsers);
router.get("/users/:id", getUserById);
router.patch("/users/:id/block", toggleBlockUser);
router.delete("/users/:id", deleteUser);
router.patch("/users/:id/make-admin", makeAdmin);
router.patch("/users/:id/remove-admin", removeAdmin);

// ─── Story Management ───────────────────────────────────────────────────────────
router.get("/stories", getAllStories);
router.get("/stories/:id", getStoryById);
router.patch("/stories/:id/block", toggleBlockStory);
router.delete("/stories/:id", deleteStoryAdmin);
router.patch("/stories/:id/status", updateStoryStatus);

// ─── Comment Management ─────────────────────────────────────────────────────────
router.get("/comments", getAllComments);
router.get("/comments/:id", getCommentById);
router.patch("/comments/:id/block", toggleBlockComment);
router.delete("/comments/:id", deleteCommentAdmin);
router.patch("/comments/:id/approve", toggleApproveComment);

module.exports = router;
