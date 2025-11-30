const express = require("express");
const router = express.Router();
const { authenticateToken, authorizeRole } = require("../../middleware/auth");
const db = require("../../config/database");

/**
 * GET /api/admin/locations
 * Fetch all parking locations with statistics
 */
router.get("/", authenticateToken, authorizeRole("admin"), (req, res) => {
  try {
    console.log("📍 Fetching all locations...");

    const locationsQuery = `
      SELECT 
        pl.id,
        pl.name,
        pl.address,
        pl.status,
        pl.price_per_hour,
        pl.created_at,
        COUNT(DISTINCT ps.id) as total_slots,
        COUNT(DISTINCT CASE WHEN ps.status = 'reserved' THEN ps.id END) as occupied_slots,
        ROUND((COUNT(DISTINCT CASE WHEN ps.status = 'reserved' THEN ps.id END) / 
                COUNT(DISTINCT ps.id)) * 100, 1) as occupancy_rate,
        COALESCE(SUM(CASE WHEN DATE(p.created_at) = CURDATE() THEN p.amount ELSE 0 END), 0) as today_revenue
      FROM parking_locations pl
      LEFT JOIN parking_spots ps ON pl.id = ps.location_id
      LEFT JOIN reservations r ON ps.id = r.spot_id AND r.status = 'active'
      LEFT JOIN payments p ON r.id = p.reservation_id AND p.payment_status = 'completed'
      GROUP BY pl.id, pl.name, pl.address, pl.status, pl.price_per_hour, pl.created_at
      ORDER BY pl.created_at DESC
    `;

    db.query(locationsQuery, (err, results) => {
      if (err) {
        console.error("❌ Query error:", err);
        return res.status(500).json({ error: "Failed to fetch locations" });
      }

      console.log("✅ Fetched", results.length, "locations");
      res.json({
        success: true,
        data: results,
      });
    });
  } catch (error) {
    console.error("❌ Error:", error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/admin/locations/:id
 * Fetch single location details
 */
router.get("/:id", authenticateToken, authorizeRole("admin"), (req, res) => {
  try {
    const { id } = req.params;
    console.log(`📍 Fetching location ${id}...`);

    const locationQuery = `
      SELECT 
        pl.*,
        COUNT(DISTINCT ps.id) as total_slots,
        COUNT(DISTINCT CASE WHEN ps.status = 'reserved' THEN ps.id END) as occupied_slots,
        ROUND((COUNT(DISTINCT CASE WHEN ps.status = 'reserved' THEN ps.id END) / 
                COUNT(DISTINCT ps.id)) * 100, 1) as occupancy_rate
      FROM parking_locations pl
      LEFT JOIN parking_spots ps ON pl.id = ps.location_id
      WHERE pl.id = ?
      GROUP BY pl.id
    `;

    db.query(locationQuery, [id], (err, results) => {
      if (err) {
        console.error("❌ Query error:", err);
        return res.status(500).json({ error: "Failed to fetch location" });
      }

      if (results.length === 0) {
        return res.status(404).json({ error: "Location not found" });
      }

      console.log("✅ Location fetched successfully");
      res.json({
        success: true,
        data: results[0],
      });
    });
  } catch (error) {
    console.error("❌ Error:", error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /api/admin/locations
 * Create new parking location
 */
router.post("/", authenticateToken, authorizeRole("admin"), (req, res) => {
  try {
    const { name, address, status, price_per_hour, partner_name } = req.body;

    console.log("📍 Creating new location...", { name, address, status });

    // Validation
    if (!name || !address || !status) {
      return res
        .status(400)
        .json({ error: "Name, address, and status are required" });
    }

    const validStatuses = ["active", "maintenance", "closed"];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: "Invalid status" });
    }

    const createQuery = `
      INSERT INTO parking_locations (name, address, status, price_per_hour, partner_name, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, NOW(), NOW())
    `;

    db.query(
      createQuery,
      [name, address, status, price_per_hour || 0, partner_name || null],
      (err, result) => {
        if (err) {
          console.error("❌ Insert error:", err);
          return res.status(500).json({ error: "Failed to create location" });
        }

        console.log("✅ Location created with ID:", result.insertId);
        res.status(201).json({
          success: true,
          message: "Location created successfully",
          data: { id: result.insertId },
        });
      }
    );
  } catch (error) {
    console.error("❌ Error:", error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * PUT /api/admin/locations/:id
 * Update parking location
 */
router.put("/:id", authenticateToken, authorizeRole("admin"), (req, res) => {
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
      return res.status(400).json({ error: "Invalid input data" });
    }

    const validStatuses = ["active", "maintenance", "closed"];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: "Invalid status" });
    }

    const updateQuery = `
      UPDATE parking_locations 
      SET name = ?, address = ?, status = ?, price_per_hour = ?, partner_name = ?, updated_at = NOW()
      WHERE id = ?
    `;

    db.query(
      updateQuery,
      [name, address, status, price_per_hour || 0, partner_name || null, id],
      (err, result) => {
        if (err) {
          console.error("❌ Update error:", err);
          return res.status(500).json({ error: "Failed to update location" });
        }

        if (result.affectedRows === 0) {
          return res.status(404).json({ error: "Location not found" });
        }

        console.log("✅ Location updated successfully");
        res.json({
          success: true,
          message: "Location updated successfully",
        });
      }
    );
  } catch (error) {
    console.error("❌ Error:", error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * DELETE /api/admin/locations/:id
 * Delete parking location
 */
router.delete("/:id", authenticateToken, authorizeRole("admin"), (req, res) => {
  try {
    const { id } = req.params;
    console.log(`📍 Deleting location ${id}...`);

    // Check if location has associated parking spots
    const checkQuery = `
      SELECT COUNT(*) as count FROM parking_spots WHERE location_id = ?
    `;

    db.query(checkQuery, [id], (err, results) => {
      if (err) {
        console.error("❌ Check error:", err);
        return res.status(500).json({ error: "Failed to check location" });
      }

      if (results[0].count > 0) {
        return res.status(400).json({
          error: "Cannot delete location with associated parking spots",
        });
      }

      const deleteQuery = `
        DELETE FROM parking_locations WHERE id = ?
      `;

      db.query(deleteQuery, [id], (err, result) => {
        if (err) {
          console.error("❌ Delete error:", err);
          return res.status(500).json({ error: "Failed to delete location" });
        }

        if (result.affectedRows === 0) {
          return res.status(404).json({ error: "Location not found" });
        }

        console.log("✅ Location deleted successfully");
        res.json({
          success: true,
          message: "Location deleted successfully",
        });
      });
    });
  } catch (error) {
    console.error("❌ Error:", error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
