require("dotenv").config();
const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");
const dns = require("dns");

const authRoutes = require("./routes/auth");
const moodRoutes = require("./routes/moodRoutes");
const storyRoutes = require("./routes/stories");
const commentRoutes = require("./routes/comments");
const adminRoutes = require("./routes/admin");

const app = express();
dns.setServers(["1.1.1.1", "8.8.8.8"]);

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());

// Connect to MongoDB
connectDB();

// Routes
app.use("/api/stories", storyRoutes);
app.use("/api/stories/:storyId/comments", commentRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/moods", moodRoutes);
app.use("/api/admin", adminRoutes);

// Health check
app.get("/api/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Server is running",
    timestamp: new Date().toISOString(),
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "Route not found",
  });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: "Internal server error",
    error: process.env.NODE_ENV === "development" ? err.message : undefined,
  });
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📝 MoodLift API ready`);
});
