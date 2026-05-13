const express = require("express");
const {
  validateStory,
  handleValidationErrors,
} = require("../middleware/validation");
const auth = require("../middleware/authMiddleware");
const {
  getStories,
  getStory,
  createStory,
  updateStory,
  deleteStory,
  likeStory,
} = require("../controllers/storyController");

const router = express.Router();

router.get("/", getStories);
router.get("/:id", getStory);
router.post("/", auth, validateStory, handleValidationErrors, createStory);
router.patch("/:id", auth, updateStory);
router.delete("/:id", auth, deleteStory);
router.patch("/:id/like", auth, likeStory);

module.exports = router;
