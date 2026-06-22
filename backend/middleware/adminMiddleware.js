const User = require("../models/User");

// Middleware to check if user is admin
const adminAuth = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    if (!user.isAdmin) {
      return res.status(403).json({
        success: false,
        message: "Access denied. Admin privileges required.",
      });
    }

    if (user.isBlocked) {
      return res.status(403).json({
        success: false,
        message: "Your admin account has been blocked.",
      });
    }

    req.admin = user;
    next();
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error verifying admin privileges",
      error: error.message,
    });
  }
};

module.exports = adminAuth;
