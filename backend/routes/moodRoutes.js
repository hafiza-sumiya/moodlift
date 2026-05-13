const express = require("express");
const auth = require("../middleware/authMiddleware");
const { createMood } = require("../controllers/moodController");

const router = express.Router();

router.post("/", auth, createMood);

module.exports = router;
