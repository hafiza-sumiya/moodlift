const User = require("../models/User");

// Middleware to check if user is admin
const adminAuth = async (req, res, next) => {
  try {
    console.log("🔐 [Admin Auth] Checking admin privileges for user:", req.user?.id);

    const user = await User.findById(req.user.id);
    
    if (!user) {
      console.error("❌ [Admin Auth] User not found:", req.user.id);
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    console.log("✅ [Admin Auth] User found:", { email: user.email, isAdmin: user.isAdmin, isBlocked: user.isBlocked });

    if (!user.isAdmin) {
      console.error("❌ [Admin Auth] User is not admin:", user.email);
      return res.status(403).json({
        success: false,
        message: "Access denied. Admin privileges required.",
      });
    }

    if (user.isBlocked) {
      console.error("❌ [Admin Auth] Admin account is blocked:", user.email);
      return res.status(403).json({
        success: false,
        message: "Your admin account has been blocked.",
      });
    }

    console.log("✅ [Admin Auth] Admin verified successfully:", user.email);
    req.admin = user;
    next();
  } catch (error) {
    console.error("❌ [Admin Auth] Error verifying admin privileges:", error.message);
    res.status(500).json({
      success: false,
      message: "Error verifying admin privileges",
      error: error.message,
    });
  }
};

module.exports = adminAuth;
