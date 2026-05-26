const jwt = require("jsonwebtoken");

module.exports = (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];

  if (!token) {
    console.log("❌ [Auth] No token provided");
    return res.status(401).json({ message: "Not authorized" });
  }

  try {
    console.log("🔑 [Auth] Verifying token...");
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log("✅ [Auth] Token verified for user:", decoded.id, "isAdmin:", decoded.isAdmin);
    req.user = decoded; // { id, isAdmin }
    next();
  } catch (error) {
    console.error("❌ [Auth] Token verification failed:", error.message);
    res.status(401).json({ message: "Invalid token" });
  }
};