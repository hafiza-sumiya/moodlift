const express = require("express");
const {
  validateComment,
  handleValidationErrors,
} = require("../middleware/validation");
const auth = require("../middleware/authMiddleware");
const {
  getComments,
  createComment,
  updateComment,
  likeComment,
  deleteComment,
} = require("../controllers/commentController");

const router = express.Router({ mergeParams: true });

router.get("/", getComments);
router.post("/", auth, validateComment, handleValidationErrors, createComment);
router.patch("/:commentId", auth, updateComment);          // edit own comment
router.patch("/:commentId/like", auth, likeComment);       // toggle like
router.delete("/:commentId", auth, deleteComment);

module.exports = router;
