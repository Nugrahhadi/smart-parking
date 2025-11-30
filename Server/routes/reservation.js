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
      const assignedSpotId = spot.id; // ✅ FIXED: Use spot.id (from ps.id in query)

      console.log("📍 Assigned spot:");
      console.log("   Spot ID:", assignedSpotId);
      console.log("   Spot Number:", spot.spot_number);
      console.log("   Zone Type:", spot.zone_type);
      console.log("   Status:", spot.status);

      // ✅ FIX: Use totalPrice from frontend (already calculated correctly by zone)
      // Backend price_per_hour is from parking_locations (same for all zones - WRONG!)
      // Frontend calculates based on zone_type: VIP=25k, Entertainment=15k, Regular=8k
      const finalTotalAmount = totalPrice || 0;

      console.log("\n💰 Price calculation:");
      console.log("   Zone Type:", spot.zone_type);
      console.log("   Received totalPrice from frontend:", totalPrice);
      console.log("   Final amount (using frontend price):", finalTotalAmount);

      // ========================================
      // 🔍 STEP 5: INSERT RESERVATION
      // ========================================
      console.log("\n🔍 STEP 5: Creating reservation...");

      // ✅ FIXED: Use 'total_amount' and 'location_id' (actual database schema)
      const insertReservationQuery = `
        INSERT INTO reservations (
          user_id, 
          location_id,
          spot_id, 
          vehicle_id, 
          start_time, 
          end_time, 
          total_amount, 
          status
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, 'pending')
      `;

      const insertParams = [
        userId,
        locationId, // ✅ ADDED: location_id is required in database
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
          // ✅ FIXED: Renamed from total_cost
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
        console.log("   Request body payment_method:", req.body.payment_method);

        const reservationId = result.insertId;

        // ✅ AUTO-CREATE PAYMENT RECORD (since payment was validated in frontend)
        console.log("\n💳 Step: Auto-creating payment record...");
        console.log("   Payment Method from request:", req.body.payment_method);
        console.log("   Payment Token from request:", req.body.paymentToken);

        const paymentToken = req.body.paymentToken || `PAY-${Date.now()}-AUTO`;
        const paymentMethod =
          req.body.payment_method || req.body.paymentMethod || "ewallet";
        const transactionId = `TRX-${Date.now()}-${reservationId}`;

        console.log("   Using Payment Method:", paymentMethod);
        console.log("   Using Payment Token:", paymentToken);
        console.log("   Generated Transaction ID:", transactionId);

        const insertPaymentQuery = `
          INSERT INTO payments (
            reservation_id, 
            amount, 
            payment_method, 
            payment_status, 
            transaction_id, 
            payment_date
          ) VALUES (?, ?, ?, 'completed', ?, NOW())
        `;

        // Insert payment
        db.query(
          insertPaymentQuery,
          [reservationId, finalTotalAmount, paymentMethod, transactionId],
          (paymentErr, paymentResult) => {
            if (paymentErr) {
              console.error(
                "❌ CRITICAL: Error creating payment record:",
                paymentErr
              );
              console.error("   SQL Message:", paymentErr.sqlMessage);
              // Continue anyway - don't fail the entire request
            } else {
              console.log(
                "✅ Payment record created! ID:",
                paymentResult.insertId
              );
              console.log("   Transaction ID:", transactionId);
            }

            // Update reservation status to 'active' after payment attempt
            console.log("\n📝 Updating reservation status to 'active'...");
            const updateStatusQuery =
              'UPDATE reservations SET status = "active" WHERE id = ?';
            db.query(updateStatusQuery, [reservationId], (statusErr) => {
              if (statusErr) {
                console.error(
                  "⚠️ Error updating reservation status:",
                  statusErr
                );
              } else {
                console.log("✅ Reservation status updated to 'active'");
              }

              // Update spot status to reserved
              console.log("\n📝 Updating spot status to 'reserved'...");
              const updateSpotQuery =
                'UPDATE parking_spots SET status = "reserved" WHERE id = ?';
              db.query(updateSpotQuery, [assignedSpotId], (spotErr) => {
                if (spotErr) {
                  console.error("⚠️ Error updating spot status:", spotErr);
                } else {
                  console.log("✅ Spot status updated to 'reserved'");
                }

                // Finally, fetch and return the reservation
                console.log("\n📋 Fetching created reservation...");
                const getReservationQuery = `
                  SELECT 
                    r.*,
                    pl.name as location_name,
                    ps.spot_number,
                    v.license_plate,
                    v.vehicle_type
                  FROM reservations r
                  JOIN parking_locations pl ON r.location_id = pl.id
                  LEFT JOIN parking_spots ps ON r.spot_id = ps.id
                  JOIN vehicles v ON r.vehicle_id = v.id
                  WHERE r.id = ?
                `;

                db.query(
                  getReservationQuery,
                  [reservationId],
                  (fetchErr, reservationResults) => {
                    if (fetchErr) {
                      console.error("Database error:", fetchErr);
                      return res.status(500).json({
                        message:
                          "Reservation created but failed to fetch details",
                      });
                    }

                    if (
                      !reservationResults ||
                      reservationResults.length === 0
                    ) {
                      return res.status(500).json({
                        message: "Reservation created but details not found",
                      });
                    }

                    const reservation = reservationResults[0];
                    console.log("✅ Reservation fetched successfully!");

                    res.status(201).json({
                      message: "Reservation created successfully",
                      reservation: {
                        id: reservation.id,
                        locationName: reservation.location_name,
                        spotNumber: reservation.spot_number || "N/A",
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

    // ✅ FIXED: Use actual database schema
    // Database has: id (not reservation_id), total_amount (not total_cost)
    const query = `
      SELECT 
        r.id,
        r.user_id,
        r.location_id,
        r.spot_id,
        r.vehicle_id,
        r.start_time,
        r.end_time,
        r.actual_start_time,
        r.actual_end_time,
        r.total_amount,
        r.status,
        r.created_at,
        r.updated_at,
        pl.name as location_name,
        pl.address as location_address,
        ps.spot_number,
        ps.zone_type,
        v.license_plate,
        v.vehicle_type,
        p.payment_status,
        p.payment_method
      FROM reservations r
      LEFT JOIN parking_spots ps ON r.spot_id = ps.id
      LEFT JOIN parking_locations pl ON r.location_id = pl.id
      LEFT JOIN vehicles v ON r.vehicle_id = v.id
      LEFT JOIN payments p ON r.id = p.reservation_id
      WHERE r.user_id = ?
      ORDER BY r.created_at DESC
    `;

    db.query(query, [userId], (err, results) => {
      if (err) {
        console.error("❌ Database error in my-reservations:", err);
        console.error("   SQL Message:", err.sqlMessage);
        console.error("   SQL State:", err.sqlState);
        return res.status(500).json({
          message: "Database error",
          error: err.message,
          sqlMessage: err.sqlMessage,
        });
      }

      console.log("📊 Raw query results:", results.length, "rows");

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
          id: reservation.id, // ✅ FIXED: Use 'id' not 'reservation_id'
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
          duration: (() => {
            // Calculate duration in hours from start_time and end_time
            if (reservation.start_time && reservation.end_time) {
              const start = new Date(reservation.start_time);
              const end = new Date(reservation.end_time);
              const hours = Math.ceil((end - start) / (1000 * 60 * 60));
              return hours;
            }
            return 1; // Default to 1 hour if calculation fails
          })(),
          total_cost: parseFloat(reservation.total_amount || 0), // ✅ FIXED: Use 'total_amount' from DB
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

  console.log("🚫 Cancel reservation request:", { reservationId, userId });

  // ✅ FIXED: Use 'id' instead of 'reservation_id', 'spot_id' exists in reservations table
  const checkQuery = `
    SELECT r.id, r.user_id, r.spot_id, r.status
    FROM reservations r
    WHERE r.id = ? AND r.user_id = ? AND r.status IN ('pending', 'active')
  `;

  db.query(checkQuery, [reservationId, userId], (err, results) => {
    if (err) {
      console.error("❌ Database error:", err);
      console.error("   SQL Message:", err.sqlMessage);
      return res.status(500).json({
        message: "Database error",
        error: err.message,
        sqlMessage: err.sqlMessage,
      });
    }

    if (results.length === 0) {
      console.log("❌ Reservation not found or cannot be cancelled");
      return res
        .status(404)
        .json({ message: "Reservation not found or cannot be cancelled" });
    }

    const reservation = results[0];
    console.log("✅ Reservation found:", reservation);

    // ✅ FIXED: Update using 'id' column
    const updateReservationQuery =
      'UPDATE reservations SET status = "cancelled", updated_at = CURRENT_TIMESTAMP WHERE id = ?';

    db.query(updateReservationQuery, [reservationId], (err) => {
      if (err) {
        console.error("❌ Error updating reservation:", err);
        console.error("   SQL Message:", err.sqlMessage);
        return res.status(500).json({
          message: "Error cancelling reservation",
          error: err.message,
          sqlMessage: err.sqlMessage,
        });
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
