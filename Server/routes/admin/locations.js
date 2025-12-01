const express = require("express");
const router = express.Router();
const { authenticateToken, authorizeRole } = require("../../middleware/auth");
const db = require("../../config/database");

/**
 * GET /api/admin/locations
 * Fetch all parking locations with statistics
 */
router.get("/", authenticateToken, authorizeRole("admin"), async (req, res) => {
  try {
    console.log("📍 Fetching all locations...");

    const locationsQuery = `
      SELECT 
        id,
        name,
        address,
        status,
        price_per_hour as hourly_rate,
        total_slots,
        occupied_slots,
        created_at
      FROM parking_locations
      ORDER BY created_at DESC
    `;

    const locRes = await db.query(locationsQuery);

    if (!locRes.success) {
      throw new Error("Failed to fetch locations");
    }

    console.log("✅ Fetched", locRes.data.length, "locations");
    res.json({
      success: true,
      data: locRes.data,
    });
  } catch (error) {
    console.error("❌ Error:", error);
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * GET /api/admin/locations/:id
 * Fetch single location details
 */
router.get("/:id", authenticateToken, authorizeRole("admin"), async (req, res) => {
  try {
    const { id } = req.params;
    console.log(`📍 Fetching location ${id}...`);

    const locationQuery = `
      SELECT 
        id,
        name,
        address,
        status,
        price_per_hour as hourly_rate,
        total_slots,
        occupied_slots,
        created_at
      FROM parking_locations
      WHERE id = ?
    `;

    const locRes = await db.queryOne(locationQuery, [id]);

    if (!locRes.success) {
      throw new Error("Failed to fetch location");
    }

    if (!locRes.data) {
      return res.status(404).json({ success: false, error: "Location not found" });
    }

    console.log("✅ Location fetched successfully");
    res.json({
      success: true,
      data: locRes.data,
    });
  } catch (error) {
    console.error("❌ Error:", error);
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * POST /api/admin/locations
 * Create new parking location
 */
router.post("/", authenticateToken, authorizeRole("admin"), async (req, res) => {
  try {
    const { name, address, status, price_per_hour, partner_name } = req.body;

    console.log("📍 Creating new location...", { name, address, status });

    // Validation
    if (!name || !address || !status) {
      return res
        .status(400)
        .json({ success: false, error: "Name, address, and status are required" });
    }

    const validStatuses = ["active", "maintenance", "closed"];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ success: false, error: "Invalid status" });
    }

    const createQuery = `
      INSERT INTO parking_locations (name, address, status, price_per_hour, partner_name, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, NOW(), NOW())
    `;

    const result = await db.query(
      createQuery,
      [name, address, status, price_per_hour || 0, partner_name || null]
    );

    if (!result.success) {
      throw new Error("Failed to create location");
    }

    console.log("✅ Location created with ID:", result.insertId);
    res.status(201).json({
      success: true,
      message: "Location created successfully",
      data: { id: result.insertId },
    });
  } catch (error) {
    console.error("❌ Error:", error);
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * PUT /api/admin/locations/:id
 * Update parking location
 */
router.put("/:id", authenticateToken, authorizeRole("admin"), async (req, res) => {
  try {
    const { id } = req.params;
    const { name, address, status, price_per_hour, partner_name } = req.body;

    console.log(`📍 Updating location ${id}...`);

    if (
      !name ||
      !address ||
      !status ||
      typeof name !== "string" ||
      typeof address !== "string"
    ) {
      return res.status(400).json({ success: false, error: "Invalid input data" });
    }

    const validStatuses = ["active", "maintenance", "closed"];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ success: false, error: "Invalid status" });
    }

    const updateQuery = `
      UPDATE parking_locations 
      SET name = ?, address = ?, status = ?, price_per_hour = ?, partner_name = ?, updated_at = NOW()
      WHERE id = ?
    `;

    const result = await db.query(
      updateQuery,
      [name, address, status, price_per_hour || 0, partner_name || null, id]
    );

    if (!result.success) {
      throw new Error("Failed to update location");
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, error: "Location not found" });
    }

    console.log("✅ Location updated successfully");
    res.json({
      success: true,
      message: "Location updated successfully",
    });
  } catch (error) {
    console.error("❌ Error:", error);
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * DELETE /api/admin/locations/:id
 * Delete parking location
 */
router.delete("/:id", authenticateToken, authorizeRole("admin"), async (req, res) => {
  try {
    const { id } = req.params;
    console.log(`📍 Deleting location ${id}...`);

    // Check if location has associated parking spots
    const checkQuery = `
      SELECT COUNT(*) as count FROM parking_spots WHERE location_id = ?
    `;

    const checkRes = await db.queryOne(checkQuery, [id]);
    
    if (!checkRes.success) {
      throw new Error("Failed to check location");
    }

    if (checkRes.data && checkRes.data.count > 0) {
      return res.status(400).json({
        success: false,
        error: "Cannot delete location with associated parking spots",
      });
    }

    const deleteQuery = `
      DELETE FROM parking_locations WHERE id = ?
    `;

    const result = await db.query(deleteQuery, [id]);

    if (!result.success) {
      throw new Error("Failed to delete location");
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, error: "Location not found" });
    }

    console.log("✅ Location deleted successfully");
    res.json({
      success: true,
      message: "Location deleted successfully",
    });
  } catch (error) {
    console.error("❌ Error:", error);
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;
