const Mood = require("../models/Mood");

// POST /api/moods — log a mood entry (auth required)
exports.createMood = async (req, res) => {
  try {
    const mood = await Mood.create({
      user: req.user.id,
      feeling: req.body.feeling,
      emoji: req.body.emoji,
      color: req.body.color,
      date: req.body.date,
    });

    res.status(201).json({ success: true, data: mood });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error logging mood",
      error: error.message,
    });
  }
};
