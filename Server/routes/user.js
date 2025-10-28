const express = require("express");
const router = express.Router();
const { query, queryOne } = require("../config/database");
const jwt = require("jsonwebtoken");

// Middleware to verify JWT token
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    return res.status(401).json({ message: "Access token required" });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ message: "Invalid token" });
    }
    req.user = user;
    next();
  });
};

// ============================================
// GET USER PROFILE
// ============================================
router.get("/profile", authenticateToken, async (req, res) => {
  try {
    console.log("🔍 === PROFILE REQUEST ===");
    console.log("req.user:", req.user);
    const userId = req.user.userId;
    console.log("userId from token:", userId);

    // Get user basic info
    const userQuery = `
      SELECT 
        id,
        name as username,
        email,
        name as full_name,
        phone as phone_number,
        role,
        created_at
      FROM users 
      WHERE id = ?
    `;

    const userResult = await queryOne(userQuery, [userId]);
    console.log("userResult:", userResult);

    if (!userResult.success || !userResult.data) {
      console.log("❌ User not found for userId:", userId);
      return res.status(404).json({ message: "User not found" });
    }

    const user = userResult.data;

    // Get user statistics
    const statsQuery = `
      SELECT 
        COUNT(*) as total_reservations,
        SUM(CASE WHEN status = 'active' THEN 1 ELSE 0 END) as active_reservations,
        SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) as completed_reservations,
        SUM(CASE WHEN status = 'cancelled' THEN 1 ELSE 0 END) as cancelled_reservations,
        SUM(total_amount) as total_spent
      FROM reservations
      WHERE user_id = ?
    `;

    const statsResult = await queryOne(statsQuery, [userId]);
    const stats = statsResult.data || {
      total_reservations: 0,
      active_reservations: 0,
      completed_reservations: 0,
      cancelled_reservations: 0,
      total_spent: 0,
    };

    // Get user vehicles
    const vehiclesQuery = `
      SELECT 
        id as vehicle_id,
        vehicle_type,
        license_plate,
        brand,
        model,
        color,
        created_at
      FROM vehicles
      WHERE user_id = ?
      ORDER BY created_at DESC
    `;

    const vehiclesResult = await query(vehiclesQuery, [userId]);
    const vehicles = vehiclesResult.data || [];

    // Get recent reservations (last 5)
    const recentQuery = `
      SELECT 
        r.id,
        r.start_time,
        r.end_time,
        r.status,
        r.total_amount,
        pl.name as location_name,
        ps.spot_number,
        ps.zone_type
      FROM reservations r
      JOIN parking_locations pl ON r.location_id = pl.id
      LEFT JOIN parking_spots ps ON r.spot_id = ps.id
      WHERE r.user_id = ?
      ORDER BY r.created_at DESC
      LIMIT 5
    `;

    const recentResult = await query(recentQuery, [userId]);
    const recentReservations = recentResult.data || [];

    // Combine all data
    const profile = {
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        fullName: user.full_name,
        phone: user.phone_number,
        role: user.role,
        memberSince: user.created_at,
      },
      statistics: {
        totalReservations: parseInt(stats.total_reservations) || 0,
        activeReservations: parseInt(stats.active_reservations) || 0,
        completedReservations: parseInt(stats.completed_reservations) || 0,
        cancelledReservations: parseInt(stats.cancelled_reservations) || 0,
        totalSpent: parseFloat(stats.total_spent) || 0,
      },
      vehicles: vehicles.map((v) => ({
        id: v.vehicle_id,
        type: v.vehicle_type,
        licensePlate: v.license_plate,
        brand: v.brand,
        model: v.model,
        color: v.color,
        addedAt: v.created_at,
      })),
      recentReservations: recentReservations.map((r) => ({
        id: r.id,
        locationName: r.location_name,
        spotNumber: r.spot_number,
        zoneType: r.zone_type,
        startTime: r.start_time,
        endTime: r.end_time,
        status: r.status,
        amount: parseFloat(r.total_amount) || 0,
      })),
    };

    res.json(profile);
  } catch (error) {
    console.error("❌ Error fetching profile:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// ============================================
// UPDATE USER PROFILE
// ============================================
router.put("/profile", authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId;
    const { fullName, phoneNumber } = req.body;

    const updateQuery = `
      UPDATE users 
      SET full_name = ?, phone_number = ?
      WHERE user_id = ?
    `;

    const result = await query(updateQuery, [fullName, phoneNumber, userId]);

    if (!result.success) {
      return res.status(500).json({ message: "Failed to update profile" });
    }

    res.json({ message: "Profile updated successfully" });
  } catch (error) {
    console.error("❌ Error updating profile:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// ============================================
// GET USER BY ID (for admin)
// ============================================
router.get("/:id", authenticateToken, async (req, res) => {
  try {
    const userId = req.params.id;

    // Check if user is admin or requesting own profile
    if (req.user.role !== "admin" && req.user.userId !== parseInt(userId)) {
      return res.status(403).json({ message: "Unauthorized access" });
    }

    const userQuery = `
      SELECT 
        user_id,
        username,
        email,
        full_name,
        phone_number,
        role,
        created_at
      FROM users 
      WHERE user_id = ?
    `;

    const result = await queryOne(userQuery, [userId]);

    if (!result.success || !result.data) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json(result.data);
  } catch (error) {
    console.error("❌ Error fetching user:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

module.exports = router;
