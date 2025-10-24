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

// Create a new reservation
router.post("/", authenticateToken, (req, res) => {
  // ✅ WRAP ENTIRE HANDLER IN TRY-CATCH TO PREVENT SERVER CRASH
  try {
    const {
      locationId,
      spotId,
      vehicleId,
      startTime,
      endTime,
      slotId,
      zone,
      zone_type, // ✅ NEW: Zone type from frontend
      duration,
      totalPrice,
    } = req.body;
    const userId = req.user.userId;

    // ========================================
    // 🔍 STEP 1: LOG SERVER-SIDE RECEIVED DATA
    // ========================================
    console.group("📥 SERVER: Received Reservation Request");
    console.log("👤 User ID:", userId);
    console.log("📦 Request Body:", JSON.stringify(req.body, null, 2));
    console.log("📋 Fields Received:");
    console.table({
      locationId: {
        value: locationId,
        type: typeof locationId,
        received: !!locationId,
      },
      spotId: { value: spotId, type: typeof spotId, received: !!spotId },
      slotId: { value: slotId, type: typeof slotId, received: !!slotId },
      vehicleId: {
        value: vehicleId,
        type: typeof vehicleId,
        received: !!vehicleId,
      },
      zone: { value: zone, type: typeof zone, received: !!zone },
      zone_type: {
        value: zone_type,
        type: typeof zone_type,
        received: !!zone_type,
      }, // ✅ NEW
      duration: {
        value: duration,
        type: typeof duration,
        received: !!duration,
      },
      startTime: {
        value: startTime,
        type: typeof startTime,
        received: !!startTime,
      },
      endTime: { value: endTime, type: typeof endTime, received: !!endTime },
      totalPrice: {
        value: totalPrice,
        type: typeof totalPrice,
        received: !!totalPrice,
      },
    });
    console.groupEnd();

    // ========================================
    // 🔍 STEP 2: VALIDATION WITH DETAILED ERRORS
    // ========================================
    // ✅ NEW: Accept either spotId/slotId OR zone_type
    const requiredFields = {
      locationId: locationId,
      spotOrZone: spotId || slotId || zone_type, // Accept spotId, slotId, OR zone_type
      vehicleId: vehicleId,
      startTime: startTime,
      endTime: endTime,
    };

    const missingFields = Object.entries(requiredFields)
      .filter(([key, value]) => !value)
      .map(([key]) => key);

    if (missingFields.length > 0) {
      console.error(
        "❌ Validation Failed - Missing Required Fields:",
        missingFields
      );
      console.group("🔍 DEBUGGING INFO");
      console.log(
        "Expected Fields:",
        "locationId, (spotId OR slotId OR zone_type), vehicleId, startTime, endTime"
      );
      console.log("Received Fields:", Object.keys(req.body).join(", "));
      console.log("Missing Fields:", missingFields.join(", "));
      console.groupEnd();

      return res.status(400).json({
        message: "Missing required fields",
        missingFields: missingFields,
        receivedFields: Object.keys(req.body),
        expectedFields: [
          "locationId",
          "spotId OR slotId OR zone_type",
          "vehicleId",
          "startTime",
          "endTime",
        ],
        hint: "Client is sending: " + Object.keys(req.body).join(", "),
      });
    }

    // Use slotId if spotId not provided
    const finalSpotId = spotId || slotId;

    // ========================================
    // 🔍 STEP 3: VALIDATE DATETIME FORMAT
    // ========================================
    console.log("\n🔍 STEP 3: Validating datetime format...");
    console.log("Raw startTime:", startTime, "Type:", typeof startTime);
    console.log("Raw endTime:", endTime, "Type:", typeof endTime);

    // Parse and validate dates
    const startDate = new Date(startTime);
    const endDate = new Date(endTime);

    console.log("Parsed startDate:", startDate.toISOString());
    console.log("Parsed endDate:", endDate.toISOString());
    console.log("Start is valid:", !isNaN(startDate.getTime()));
    console.log("End is valid:", !isNaN(endDate.getTime()));

    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
      console.error("❌ Invalid datetime format!");
      return res.status(400).json({
        message: "Invalid datetime format",
        hint: "Expected format: YYYY-MM-DD HH:mm:ss",
        received: { startTime, endTime },
      });
    }

    if (endDate <= startDate) {
      console.error("❌ End time must be after start time!");
      return res.status(400).json({
        message: "End time must be after start time",
        startTime: startTime,
        endTime: endTime,
      });
    }

    console.log("✅ Datetime validation passed!");

    // ========================================
    // 🔍 STEP 4: CHECK SPOT AVAILABILITY
    // ========================================
    console.log("\n🔍 STEP 4: Checking spot availability...");
    console.log("Spot ID:", finalSpotId, "(Type:", typeof finalSpotId, ")");
    console.log("Zone Type:", zone_type, "(Type:", typeof zone_type, ")");
    console.log("Location ID:", locationId, "(Type:", typeof locationId, ")");
    console.log("Time range:", startTime, "to", endTime);

    // ✅ NEW LOGIC: Choose query based on whether we search by spotId or zone_type
    let checkAvailabilityQuery;
    let queryParams;

    if (zone_type && !finalSpotId) {
      // Search by zone_type - find ANY available spot in this zone
      console.log("🔍 Searching by ZONE TYPE:", zone_type);
      checkAvailabilityQuery = `
      SELECT ps.*, pl.price_per_hour
      FROM parking_spots ps
      JOIN parking_locations pl ON ps.location_id = pl.id
      WHERE ps.location_id = ? 
      AND ps.zone_type = ?
      AND ps.status = 'available'
      AND ps.id NOT IN (
        SELECT DISTINCT r.spot_id 
        FROM reservations r 
        WHERE r.spot_id IS NOT NULL 
        AND r.status IN ('active', 'pending')
        AND (r.start_time < ? AND r.end_time > ?)
      )
      LIMIT 1
    `;
      queryParams = [locationId, zone_type, endTime, startTime];
    } else {
      // Original logic: Search by specific spotId
      console.log("🔍 Searching by SPOT ID:", finalSpotId);
      checkAvailabilityQuery = `
      SELECT ps.*, pl.price_per_hour
      FROM parking_spots ps
      JOIN parking_locations pl ON ps.location_id = pl.id
      WHERE ps.id = ? AND ps.location_id = ?
      AND ps.id NOT IN (
        SELECT DISTINCT r.spot_id 
        FROM reservations r 
        WHERE r.spot_id IS NOT NULL 
        AND r.status IN ('active', 'pending')
        AND r.spot_id = ?
        AND (
          (r.start_time < ? AND r.end_time > ?)
        )
      )
    `;
      queryParams = [finalSpotId, locationId, finalSpotId, endTime, startTime];
    }

    console.log("📝 Executing availability check query...");
    console.log("Query parameters:", queryParams);

    db.query(checkAvailabilityQuery, queryParams, (err, spotResults) => {
      if (err) {
        console.error("❌ Database error during availability check:", err);
        console.error("SQL Error:", err.sqlMessage);
        console.error("SQL State:", err.sqlState);
        return res.status(500).json({
          message: "Database error",
          error: err.message,
          sqlMessage: err.sqlMessage,
        });
      }

      console.log(
        "📊 Availability check results:",
        spotResults.length,
        "spots found"
      );

      if (spotResults.length === 0) {
        // ✅ FIXED: Handle zone_type search vs spotId search differently
        if (zone_type && !finalSpotId) {
          // Zone-based search failed - no spots available in zone
          console.log("❌ No available spots in zone:", zone_type);
          return res.status(400).json({
            message: "No parking spots available in the selected zone",
            details: {
              zone: zone_type,
              locationId: locationId,
              requestedTime: { start: startTime, end: endTime },
            },
            hint: "All spots in this zone are currently occupied or reserved. Try another zone or time.",
          });
        }

        // Spot ID based search - check if spot exists at all
        const checkSpotExistsQuery = `
          SELECT ps.*, 
            (SELECT COUNT(*) FROM reservations r 
             WHERE r.spot_id = ps.id 
             AND r.status IN ('active', 'pending')
             AND (r.start_time < ? AND r.end_time > ?)
            ) as conflicting_reservations
          FROM parking_spots ps
          WHERE ps.id = ? AND ps.location_id = ?
        `;

        db.query(
          checkSpotExistsQuery,
          [endTime, startTime, finalSpotId, locationId],
          (err, existResults) => {
            if (err) {
              console.error("Error checking spot existence:", err);
              return res.status(500).json({
                message: "Database error while checking spot",
                error: err.message,
              });
            }

            if (existResults.length > 0) {
              const spot = existResults[0];
              console.log("🔍 Spot exists but not available:");
              console.log("   Spot status:", spot.status);
              console.log(
                "   Conflicting reservations:",
                spot.conflicting_reservations
              );

              return res.status(400).json({
                message: "Parking spot is not available for the selected time",
                details: {
                  spotExists: true,
                  spotStatus: spot.status,
                  conflictingReservations: spot.conflicting_reservations,
                  requestedTime: { start: startTime, end: endTime },
                },
                hint:
                  spot.conflicting_reservations > 0
                    ? "There are existing reservations for this time slot"
                    : "Spot may be occupied or unavailable",
              });
            } else {
              console.log("❌ Spot does not exist!");
              return res.status(404).json({
                message: "Parking spot not found",
                spotId: finalSpotId,
                locationId: locationId,
              });
            }
          }
        );
        return;
      }

      console.log("✅ Spot is available!");

      const spot = spotResults[0];
      const pricePerHour = parseFloat(spot.price_per_hour);
      const assignedSpotId = spot.id; // ✅ Use the found spot's ID

      console.log("📍 Assigned spot:");
      console.log("   Spot ID:", assignedSpotId);
      console.log("   Spot Number:", spot.spot_number);
      console.log("   Zone Type:", spot.zone_type);
      console.log("   Status:", spot.status);

      // Calculate total amount
      const start = new Date(startTime);
      const end = new Date(endTime);
      const hours = Math.ceil((end - start) / (1000 * 60 * 60)); // Round up to next hour
      const calculatedAmount = hours * pricePerHour;

      // Use calculated amount or received totalPrice (prefer calculated for accuracy)
      const finalTotalAmount = calculatedAmount || totalPrice || 0;

      console.log("\n💰 Price calculation:");
      console.log("   Price per hour:", pricePerHour);
      console.log("   Duration (hours):", hours);
      console.log("   Calculated amount:", calculatedAmount);
      console.log("   Received totalPrice:", totalPrice);
      console.log("   Final amount:", finalTotalAmount);

      // ========================================
      // 🔍 STEP 5: INSERT RESERVATION
      // ========================================
      console.log("\n🔍 STEP 5: Creating reservation...");

      const insertReservationQuery = `
        INSERT INTO reservations (user_id, location_id, spot_id, vehicle_id, start_time, end_time, total_amount, status)
        VALUES (?, ?, ?, ?, ?, ?, ?, 'pending')
      `;

      const insertParams = [
        userId,
        locationId,
        assignedSpotId, // ✅ Use assigned spot ID from query result
        vehicleId,
        startTime,
        endTime,
        finalTotalAmount,
      ];

      console.log("📝 Insert parameters:");
      console.table({
        user_id: { value: userId, type: typeof userId },
        location_id: { value: locationId, type: typeof locationId },
        spot_id: { value: assignedSpotId, type: typeof assignedSpotId },
        vehicle_id: { value: vehicleId, type: typeof vehicleId },
        start_time: { value: startTime, type: typeof startTime },
        end_time: { value: endTime, type: typeof endTime },
        total_amount: {
          value: finalTotalAmount,
          type: typeof finalTotalAmount,
        },
      });

      db.query(insertReservationQuery, insertParams, (err, result) => {
        if (err) {
          console.error("❌ Database error during INSERT:", err);
          console.error("   SQL Message:", err.sqlMessage);
          console.error("   SQL State:", err.sqlState);
          console.error("   Error Code:", err.code);
          console.error("   Error Number:", err.errno);

          return res.status(500).json({
            message: "Error creating reservation",
            error: err.message,
            sqlMessage: err.sqlMessage,
            sqlState: err.sqlState,
            code: err.code,
            hint: "Check if all foreign keys (location_id, spot_id, vehicle_id) exist",
          });
        }

        console.log("✅ Reservation created successfully!");
        console.log("   Reservation ID:", result.insertId);

        // Update spot status to reserved
        console.log("\n📝 Updating spot status to 'reserved'...");
        const updateSpotQuery =
          'UPDATE parking_spots SET status = "reserved" WHERE id = ?';
        db.query(updateSpotQuery, [assignedSpotId], (err) => {
          if (err) {
            console.error("⚠️ Error updating spot status:", err);
          } else {
            console.log("✅ Spot status updated to 'reserved'");
          }
        });

        // Get the created reservation with details
        const getReservationQuery = `
        SELECT 
          r.*,
          pl.name as location_name,
          ps.spot_number,
          v.license_plate,
          v.vehicle_type
        FROM reservations r
        JOIN parking_locations pl ON r.location_id = pl.id
        JOIN parking_spots ps ON r.spot_id = ps.id
        JOIN vehicles v ON r.vehicle_id = v.id
        WHERE r.id = ?
      `;

        db.query(
          getReservationQuery,
          [result.insertId],
          (err, reservationResults) => {
            if (err) {
              console.error("Database error:", err);
              return res.status(500).json({
                message: "Reservation created but failed to fetch details",
              });
            }

            const reservation = reservationResults[0];
            res.status(201).json({
              message: "Reservation created successfully",
              reservation: {
                id: reservation.id,
                locationName: reservation.location_name,
                spotNumber: reservation.spot_number,
                vehiclePlate: reservation.license_plate,
                vehicleType: reservation.vehicle_type,
                startTime: reservation.start_time,
                endTime: reservation.end_time,
                totalAmount: parseFloat(reservation.total_amount),
                status: reservation.status,
              },
            });
          }
        );
      });
    });
  } catch (error) {
    // ✅ CATCH ANY UNEXPECTED ERRORS TO PREVENT SERVER CRASH
    console.error("❌ FATAL ERROR in reservation creation:", error);
    console.error("Stack trace:", error.stack);
    return res.status(500).json({
      message: "An unexpected error occurred while creating reservation",
      error: error.message,
      hint: "Please check server logs for details",
    });
  }
});

// Get user's reservations
router.get("/my-reservations", authenticateToken, (req, res) => {
  try {
    const userId = req.user.userId;

    console.log("📋 Fetching reservations for user:", userId);

    const query = `
      SELECT 
        r.*,
        pl.name as location_name,
        pl.address as location_address,
        ps.spot_number,
        ps.zone_type,
        v.license_plate,
        v.vehicle_type,
        p.payment_status,
        p.payment_method
      FROM reservations r
      JOIN parking_locations pl ON r.location_id = pl.id
      LEFT JOIN parking_spots ps ON r.spot_id = ps.id
      JOIN vehicles v ON r.vehicle_id = v.id
      LEFT JOIN payments p ON r.id = p.reservation_id
      WHERE r.user_id = ?
      ORDER BY r.created_at DESC
    `;

    db.query(query, [userId], (err, results) => {
      if (err) {
        console.error("❌ Database error in my-reservations:", err);
        return res.status(500).json({
          message: "Database error",
          error: err.message,
        });
      }

      const reservations = results.map((reservation) => {
        // ✅ Handle datetime - could be Date object or string
        const formatDateTime = (datetime) => {
          if (!datetime) return null;
          if (datetime instanceof Date) {
            return datetime.toISOString().split("T")[0]; // Extract date
          }
          if (typeof datetime === "string") {
            return datetime.split(" ")[0];
          }
          return null;
        };

        const formatTime = (datetime) => {
          if (!datetime) return null;
          if (datetime instanceof Date) {
            return datetime.toISOString().split("T")[1].split(".")[0]; // Extract time
          }
          if (typeof datetime === "string") {
            return datetime.split(" ")[1];
          }
          return null;
        };

        return {
          id: reservation.id,
          parking_location: reservation.location_name,
          location_address: reservation.location_address,
          slot_number: reservation.spot_number,
          zone_type: reservation.zone_type,
          license_plate: reservation.license_plate,
          vehicle_type: reservation.vehicle_type,
          reservation_date: formatDateTime(reservation.start_time),
          start_time: formatTime(reservation.start_time),
          end_time: formatTime(reservation.end_time),
          actual_start_time: reservation.actual_start_time,
          actual_end_time: reservation.actual_end_time,
          total_cost: parseFloat(reservation.total_amount),
          status: reservation.status,
          payment_status: reservation.payment_status,
          payment_method: reservation.payment_method,
          created_at: reservation.created_at,
        };
      });

      console.log("✅ Retrieved", reservations.length, "reservations");
      res.json(reservations);
    });
  } catch (error) {
    console.error("❌ FATAL ERROR in my-reservations:", error);
    return res.status(500).json({
      message: "An unexpected error occurred",
      error: error.message,
    });
  }
});

// Cancel reservation
router.put("/:id/cancel", authenticateToken, (req, res) => {
  const reservationId = req.params.id;
  const userId = req.user.userId;

  // Check if reservation belongs to user and can be cancelled
  const checkQuery = `
    SELECT r.*, ps.id as spot_id
    FROM reservations r
    LEFT JOIN parking_spots ps ON r.spot_id = ps.id
    WHERE r.id = ? AND r.user_id = ? AND r.status IN ('pending', 'active')
  `;

  db.query(checkQuery, [reservationId, userId], (err, results) => {
    if (err) {
      console.error("Database error:", err);
      return res.status(500).json({ message: "Database error" });
    }

    if (results.length === 0) {
      return res
        .status(404)
        .json({ message: "Reservation not found or cannot be cancelled" });
    }

    const reservation = results[0];

    // Update reservation status
    const updateReservationQuery =
      'UPDATE reservations SET status = "cancelled" WHERE id = ?';

    db.query(updateReservationQuery, [reservationId], (err) => {
      if (err) {
        console.error("Database error:", err);
        return res
          .status(500)
          .json({ message: "Error cancelling reservation" });
      }

      // Update spot status back to available if spot exists
      if (reservation.spot_id) {
        const updateSpotQuery =
          'UPDATE parking_spots SET status = "available" WHERE id = ?';
        db.query(updateSpotQuery, [reservation.spot_id], (err) => {
          if (err) {
            console.error("Error updating spot status:", err);
          }
        });
      }

      res.json({ message: "Reservation cancelled successfully" });
    });
  });
});

module.exports = router;
