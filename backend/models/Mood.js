const mongoose = require('mongoose');

const moodSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },

  feeling: String,
  emoji: String,
  color: String,
  date: String,
}, { timestamps: true });

module.exports = mongoose.model("Mood", moodSchema);