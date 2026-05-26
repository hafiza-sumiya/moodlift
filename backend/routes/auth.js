const express = require("express");
const { signup, login, adminLogin, getCurrentUser } = require("../controllers/authController");
const auth = require("../middleware/authMiddleware");
const { getMyStories } = require("../controllers/storyController");

const router = express.Router();

router.post("/signup", signup);
router.post("/login", login);
router.post("/admin-login", adminLogin);
router.get("/my", auth, getMyStories);
router.get("/me", auth, getCurrentUser);

module.exports = router;
