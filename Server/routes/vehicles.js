const express = require("express");
const router = express.Router();
const mysql = require("mysql2");
const jwt = require("jsonwebtoken");

// Database connection
const db = mysql.createConnection({
  host: process.env.DB_HOST || "localhost",
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "",
  database: process.env.DB_NAME || "parking_system",
});

// Check and add missing columns on startup
db.query("SHOW COLUMNS FROM vehicles LIKE 'vehicle_name'", (err, results) => {
  if (!err && results.length === 0) {
    db.query(
      "ALTER TABLE vehicles ADD COLUMN vehicle_name VARCHAR(255) DEFAULT NULL",
      (alterErr) => {
        if (alterErr)
          console.error("Error adding vehicle_name column:", alterErr);
        else console.log("Added vehicle_name column to vehicles table");
      }
    );
  }
});

db.query("SHOW COLUMNS FROM vehicles LIKE 'is_default'", (err, results) => {
  if (!err && results.length === 0) {
    db.query(
      "ALTER TABLE vehicles ADD COLUMN is_default BOOLEAN DEFAULT FALSE",
      (alterErr) => {
        if (alterErr)
          console.error("Error adding is_default column:", alterErr);
        else console.log("Added is_default column to vehicles table");
      }
    );
  }
});

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

// Get user's vehicles
router.get("/", authenticateToken, (req, res) => {
  const userId = req.user.userId;

  const query =
    "SELECT * FROM vehicles WHERE user_id = ? ORDER BY created_at DESC";

  db.query(query, [userId], (err, results) => {
    if (err) {
      console.error("Database error:", err);
      return res.status(500).json({ message: "Database error" });
    }

    const vehicles = results.map((vehicle) => ({
      id: vehicle.id,
      vehicle_name:
        vehicle.brand && vehicle.model
          ? `${vehicle.brand} ${vehicle.model}`
          : vehicle.vehicle_name || "My Vehicle",
      license_plate: vehicle.license_plate,
      vehicle_type: vehicle.vehicle_type,
      color: vehicle.color,
      is_default: vehicle.is_default || false,
      created_at: vehicle.created_at,
    }));

    res.json(vehicles);
  });
});

// Add new vehicle
router.post("/", authenticateToken, (req, res) => {
  const { vehicle_name, license_plate, vehicle_type, color, is_default } =
    req.body;
  const userId = req.user.userId;

  // ========================================
  // ENHANCED LOGGING - DATA TYPES & VALUES
  // ========================================
  console.group("📝 POST /api/vehicles - Detailed Request");
  console.log("👤 User ID:", userId);
  console.log("📦 Raw Request Body:", JSON.stringify(req.body, null, 2));
  console.table({
    vehicle_name: {
      value: vehicle_name,
      type: typeof vehicle_name,
      length: vehicle_name?.length,
      trimmed: vehicle_name?.trim(),
    },
    license_plate: {
      value: license_plate,
      type: typeof license_plate,
      length: license_plate?.length,
      trimmed: license_plate?.trim(),
    },
    vehicle_type: {
      value: vehicle_type,
      type: typeof vehicle_type,
      length: vehicle_type?.length,
      trimmed: vehicle_type?.trim(),
    },
    color: {
      value: color,
      type: typeof color,
      length: color?.length,
    },
    is_default: {
      value: is_default,
      type: typeof is_default,
      boolValue: !!is_default,
      intValue: is_default ? 1 : 0,
    },
  });
  console.groupEnd();

  // Validation
  if (!license_plate || !vehicle_type || !vehicle_name) {
    console.error("❌ Validation failed - missing required fields");
    return res.status(400).json({
      message: "Vehicle name, license plate and vehicle type are required",
      receivedFields: Object.keys(req.body),
      missingFields: [
        !vehicle_name && "vehicle_name",
        !license_plate && "license_plate",
        !vehicle_type && "vehicle_type",
      ].filter(Boolean),
    });
  }

  // ========================================
  // NORMALIZE DATA - TRIM & CONVERT TYPES
  // ========================================
  const normalizedData = {
    vehicle_name: vehicle_name.trim(),
    license_plate: license_plate.trim().toUpperCase(), // Uppercase untuk konsistensi
    vehicle_type: vehicle_type.trim(), // Remove extra spaces
    color: color ? color.trim() : null,
    is_default: is_default ? 1 : 0, // Convert boolean to TINYINT
  };

  console.log("🔄 Normalized Data:", normalizedData);

  // Check if license plate already exists for this user
  const checkQuery =
    "SELECT * FROM vehicles WHERE user_id = ? AND license_plate = ?";

  db.query(
    checkQuery,
    [userId, normalizedData.license_plate],
    (err, results) => {
      if (err) {
        console.error("❌ Database error checking license plate:", err);
        console.error("SQL Message:", err.sqlMessage);
        console.error("SQL State:", err.sqlState);
        return res.status(500).json({
          message: "Database error",
          error: err.message,
          sqlMessage: err.sqlMessage,
          sqlState: err.sqlState,
        });
      }

      if (results.length > 0) {
        console.error(
          "❌ License plate already exists:",
          normalizedData.license_plate
        );
        return res.status(400).json({
          message: "Vehicle with this license plate already exists",
          licensePlate: normalizedData.license_plate,
        });
      }

      // If this is set as default, unset other defaults first
      if (normalizedData.is_default === 1) {
        const updateDefaultQuery =
          "UPDATE vehicles SET is_default = 0 WHERE user_id = ?";
        db.query(updateDefaultQuery, [userId], (err) => {
          if (err) {
            console.error("⚠️ Error updating default vehicles:", err);
          } else {
            console.log("✅ Unset other default vehicles");
          }
        });
      }

      // Insert new vehicle
      const insertQuery = `
      INSERT INTO vehicles (user_id, license_plate, vehicle_type, vehicle_name, color, is_default)
      VALUES (?, ?, ?, ?, ?, ?)
    `;

      const insertParams = [
        userId,
        normalizedData.license_plate,
        normalizedData.vehicle_type,
        normalizedData.vehicle_name,
        normalizedData.color,
        normalizedData.is_default,
      ];

      console.group("💾 Executing INSERT");
      console.log("Query:", insertQuery);
      console.log("Params:", insertParams);
      console.groupEnd();

      db.query(insertQuery, insertParams, (err, result) => {
        if (err) {
          console.group("❌ DATABASE INSERT ERROR");
          console.error("Error Object:", err);
          console.error("Error Code:", err.code);
          console.error("Error Number:", err.errno);
          console.error("Error Message:", err.message);
          console.error("SQL Message:", err.sqlMessage);
          console.error("SQL State:", err.sqlState);
          console.error("SQL:", err.sql);
          console.groupEnd();

          return res.status(500).json({
            message: "Error adding vehicle",
            error: err.message,
            sqlMessage: err.sqlMessage || err.message,
            sqlState: err.sqlState,
            code: err.code,
            errno: err.errno,
            hint:
              err.code === "ER_DATA_TOO_LONG" ||
              err.code === "ER_WARN_DATA_OUT_OF_RANGE"
                ? "Check database column types - run: DESCRIBE vehicles; and SHOW WARNINGS;"
                : err.code === "ER_BAD_FIELD_ERROR"
                ? "Column doesn't exist - run: ALTER TABLE vehicles ADD COLUMN ..."
                : err.code === "ER_DUP_ENTRY"
                ? "Duplicate entry - this license plate already exists"
                : "Check backend logs for details",
          });
        }

        console.log("✅ Vehicle added successfully, ID:", result.insertId);

        res.status(201).json({
          message: "Vehicle added successfully",
          vehicle: {
            id: result.insertId,
            vehicle_name: normalizedData.vehicle_name,
            license_plate: normalizedData.license_plate,
            vehicle_type: normalizedData.vehicle_type,
            color: normalizedData.color,
            is_default: normalizedData.is_default === 1,
          },
        });
      });
    }
  );
});

// Update vehicle
router.put("/:id", authenticateToken, (req, res) => {
  const vehicleId = req.params.id;
  const { vehicle_name, license_plate, vehicle_type, color, is_default } =
    req.body;
  const userId = req.user.userId;

  // Validation
  if (!license_plate || !vehicle_type || !vehicle_name) {
    return res.status(400).json({
      message: "Vehicle name, license plate and vehicle type are required",
    });
  }

  // Check if vehicle belongs to user
  const checkQuery = "SELECT * FROM vehicles WHERE id = ? AND user_id = ?";

  db.query(checkQuery, [vehicleId, userId], (err, results) => {
    if (err) {
      console.error("Database error:", err);
      return res.status(500).json({ message: "Database error" });
    }

    if (results.length === 0) {
      return res.status(404).json({ message: "Vehicle not found" });
    }

    // Check if license plate already exists for another vehicle
    const checkLicenseQuery =
      "SELECT * FROM vehicles WHERE user_id = ? AND license_plate = ? AND id != ?";

    db.query(
      checkLicenseQuery,
      [userId, license_plate, vehicleId],
      (err, results) => {
        if (err) {
          console.error("Database error:", err);
          return res.status(500).json({ message: "Database error" });
        }

        if (results.length > 0) {
          return res.status(400).json({
            message: "Vehicle with this license plate already exists",
          });
        }

        // If this is set as default, unset other defaults first
        if (is_default) {
          const updateDefaultQuery =
            "UPDATE vehicles SET is_default = 0 WHERE user_id = ? AND id != ?";
          db.query(updateDefaultQuery, [userId, vehicleId], (err) => {
            if (err) {
              console.error("Error updating default vehicles:", err);
            }
          });
        }

        // Update vehicle
        const updateQuery = `
        UPDATE vehicles 
        SET vehicle_name = ?, license_plate = ?, vehicle_type = ?, color = ?, is_default = ?
        WHERE id = ? AND user_id = ?
      `;

        db.query(
          updateQuery,
          [
            vehicle_name,
            license_plate,
            vehicle_type,
            color,
            is_default || false,
            vehicleId,
            userId,
          ],
          (err, result) => {
            if (err) {
              console.error("Database error:", err);
              return res
                .status(500)
                .json({ message: "Error updating vehicle" });
            }

            res.json({
              message: "Vehicle updated successfully",
              vehicle: {
                id: vehicleId,
                vehicle_name,
                license_plate,
                vehicle_type,
                color,
                is_default: is_default || false,
              },
            });
          }
        );
      }
    );
  });
});

// Delete vehicle
router.delete("/:id", authenticateToken, (req, res) => {
  const vehicleId = req.params.id;
  const userId = req.user.userId;

  // Check if vehicle belongs to user
  const checkQuery = "SELECT * FROM vehicles WHERE id = ? AND user_id = ?";

  db.query(checkQuery, [vehicleId, userId], (err, results) => {
    if (err) {
      console.error("Database error:", err);
      return res.status(500).json({ message: "Database error" });
    }

    if (results.length === 0) {
      return res.status(404).json({ message: "Vehicle not found" });
    }

    // Delete vehicle
    const deleteQuery = "DELETE FROM vehicles WHERE id = ? AND user_id = ?";

    db.query(deleteQuery, [vehicleId, userId], (err, result) => {
      if (err) {
        console.error("Database error:", err);
        return res.status(500).json({ message: "Error deleting vehicle" });
      }

      res.json({ message: "Vehicle deleted successfully" });
    });
  });
});

module.exports = router;
