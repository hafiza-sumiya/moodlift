const express = require("express");
const { signup, login } = require("../controllers/authController");
const auth = require("../middleware/authMiddleware");
const { getMyStories } = require("../controllers/storyController");

const router = express.Router();

router.post("/signup", signup);
router.post("/login", login);
router.get("/my", auth, getMyStories);

module.exports = router;
