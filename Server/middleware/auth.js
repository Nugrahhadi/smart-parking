const jwt = require("jsonwebtoken");

/**
 * Middleware to verify JWT token
 */
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1]; // Bearer TOKEN

  if (!token) {
    console.log("❌ No token provided");
    return res.status(401).json({ error: "No token provided" });
  }

  try {
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || "your-secret-key"
    );
    req.user = decoded;
    console.log(`✅ Token verified for user: ${decoded.email}`);
    next();
  } catch (err) {
    console.error("❌ Token verification failed:", err.message);
    res.status(403).json({ error: "Invalid or expired token" });
  }
};

/**
 * Middleware to check user role
 */
const authorizeRole = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      console.log("❌ No user found in request");
      return res.status(401).json({ error: "Unauthorized" });
    }

    if (!allowedRoles.includes(req.user.role)) {
      console.log(`❌ User ${req.user.email} does not have role`, allowedRoles);
      return res.status(403).json({
        error: `Forbidden: Only ${allowedRoles.join(
          ", "
        )} can access this resource`,
      });
    }

    console.log(
      `✅ User ${req.user.email} authorized with role: ${req.user.role}`
    );
    next();
  };
};

module.exports = {
  authenticateToken,
  authorizeRole,
};
