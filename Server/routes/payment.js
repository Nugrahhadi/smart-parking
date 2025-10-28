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

// Process payment for a reservation
router.post("/process", authenticateToken, (req, res) => {
  console.group("💳 PAYMENT: Process Payment Request");

  const { reservation_id, payment_method, amount } = req.body;
  const userId = req.user.userId;

  console.log("👤 User ID:", userId);
  console.log("📦 Payment Details:", {
    reservation_id,
    payment_method,
    amount,
  });

  // Validation
  if (!reservation_id || !payment_method || !amount) {
    console.error("❌ Missing required fields");
    console.groupEnd();
    return res.status(400).json({
      message: "Missing required fields",
      required: ["reservation_id", "payment_method", "amount"],
    });
  }

  // Step 1: Verify reservation exists and belongs to user
  const checkReservationQuery = `
    SELECT * FROM reservations 
    WHERE id = ? AND user_id = ?
  `;

  db.query(checkReservationQuery, [reservation_id, userId], (err, results) => {
    if (err) {
      console.error("❌ Database error:", err);
      console.groupEnd();
      return res.status(500).json({
        message: "Database error",
        error: err.message,
      });
    }

    if (results.length === 0) {
      console.error("❌ Reservation not found or doesn't belong to user");
      console.groupEnd();
      return res.status(404).json({
        message: "Reservation not found or access denied",
      });
    }

    const reservation = results[0];
    console.log("✅ Reservation found:", {
      id: reservation.id,
      status: reservation.status,
      total_amount: reservation.total_amount,
    });

    // Check if reservation is already paid
    if (reservation.status === "active" || reservation.status === "completed") {
      console.error("❌ Reservation already paid");
      console.groupEnd();
      return res.status(400).json({
        message: "Reservation already paid",
        status: reservation.status,
      });
    }

    // Check if reservation is cancelled
    if (reservation.status === "cancelled") {
      console.error("❌ Cannot pay for cancelled reservation");
      console.groupEnd();
      return res.status(400).json({
        message: "Cannot pay for cancelled reservation",
      });
    }

    // Verify amount matches
    if (parseFloat(amount) !== parseFloat(reservation.total_amount)) {
      console.error("❌ Payment amount mismatch");
      console.groupEnd();
      return res.status(400).json({
        message: "Payment amount doesn't match reservation total",
        expected: reservation.total_amount,
        received: amount,
      });
    }

    // Step 2: Check if payment already exists
    const checkPaymentQuery = `
      SELECT * FROM payments WHERE reservation_id = ?
    `;

    db.query(checkPaymentQuery, [reservation_id], (err, paymentResults) => {
      if (err) {
        console.error("❌ Error checking existing payment:", err);
        console.groupEnd();
        return res.status(500).json({
          message: "Database error",
          error: err.message,
        });
      }

      if (paymentResults.length > 0) {
        console.error("❌ Payment already exists for this reservation");
        console.groupEnd();
        return res.status(400).json({
          message: "Payment already exists for this reservation",
          payment_id: paymentResults[0].id,
        });
      }

      // Step 3: Generate transaction ID
      const transaction_id = `TRX-${Date.now()}-${reservation_id}`;
      console.log("🔑 Generated transaction ID:", transaction_id);

      // Step 4: Insert payment record
      const insertPaymentQuery = `
        INSERT INTO payments (
          reservation_id, amount, payment_method, 
          payment_status, transaction_id, payment_date
        ) VALUES (?, ?, ?, 'completed', ?, NOW())
      `;

      db.query(
        insertPaymentQuery,
        [reservation_id, amount, payment_method, transaction_id],
        (err, insertResult) => {
          if (err) {
            console.error("❌ Error inserting payment:", err);
            console.groupEnd();
            return res.status(500).json({
              message: "Failed to process payment",
              error: err.message,
            });
          }

          const payment_id = insertResult.insertId;
          console.log("✅ Payment record created:", payment_id);

          // Step 5: Update reservation status to 'active'
          const updateReservationQuery = `
            UPDATE reservations 
            SET status = 'active' 
            WHERE id = ?
          `;

          db.query(updateReservationQuery, [reservation_id], (err) => {
            if (err) {
              console.error("❌ Error updating reservation:", err);
              // Rollback payment? Or leave as-is?
              console.groupEnd();
              return res.status(500).json({
                message: "Payment processed but failed to update reservation",
                error: err.message,
                payment_id: payment_id,
              });
            }

            console.log("✅ Reservation status updated to 'active'");

            // Step 6: Update parking spot status to 'occupied'
            if (reservation.spot_id) {
              const updateSpotQuery = `
                UPDATE parking_spots 
                SET status = 'occupied' 
                WHERE id = ?
              `;

              db.query(updateSpotQuery, [reservation.spot_id], (err) => {
                if (err) {
                  console.error(
                    "⚠️ Warning: Failed to update spot status:",
                    err
                  );
                  // Don't fail the whole transaction for this
                }
              });
            }

            // Step 7: Get complete payment info
            const getPaymentQuery = `
              SELECT 
                p.*,
                r.start_time,
                r.end_time,
                r.total_amount as reservation_total,
                ps.spot_number,
                pl.name as location_name,
                v.license_plate
              FROM payments p
              JOIN reservations r ON p.reservation_id = r.id
              LEFT JOIN parking_spots ps ON r.spot_id = ps.id
              LEFT JOIN parking_locations pl ON r.location_id = pl.id
              LEFT JOIN vehicles v ON r.vehicle_id = v.id
              WHERE p.id = ?
            `;

            db.query(getPaymentQuery, [payment_id], (err, paymentData) => {
              if (err) {
                console.error(
                  "⚠️ Warning: Failed to fetch payment details:",
                  err
                );
                // Still return success, just without full details
                console.groupEnd();
                return res.status(200).json({
                  message: "Payment processed successfully",
                  payment_id: payment_id,
                  transaction_id: transaction_id,
                  reservation_id: reservation_id,
                });
              }

              console.log("✅ Payment processing complete!");
              console.groupEnd();

              res.status(200).json({
                message: "Payment processed successfully",
                payment: paymentData[0],
              });
            });
          });
        }
      );
    });
  });
});

// Get payment history for current user
router.get("/history", authenticateToken, (req, res) => {
  console.log("📋 PAYMENT: Get payment history for user:", req.user.userId);

  const userId = req.user.userId;

  const query = `
    SELECT 
      p.*,
      r.start_time,
      r.end_time,
      r.status as reservation_status,
      ps.spot_number,
      ps.zone_type,
      pl.name as location_name,
      pl.address as location_address,
      v.license_plate,
      v.vehicle_type
    FROM payments p
    JOIN reservations r ON p.reservation_id = r.id
    LEFT JOIN parking_spots ps ON r.spot_id = ps.id
    LEFT JOIN parking_locations pl ON r.location_id = pl.id
    LEFT JOIN vehicles v ON r.vehicle_id = v.id
    WHERE r.user_id = ?
    ORDER BY p.created_at DESC
  `;

  db.query(query, [userId], (err, results) => {
    if (err) {
      console.error("❌ Database error:", err);
      return res.status(500).json({
        message: "Database error",
        error: err.message,
      });
    }

    console.log(`✅ Found ${results.length} payment(s)`);

    res.status(200).json({
      message: "Payment history retrieved successfully",
      payments: results,
    });
  });
});

// Get payment details by reservation ID
router.get("/reservation/:reservation_id", authenticateToken, (req, res) => {
  const { reservation_id } = req.params;
  const userId = req.user.userId;

  console.log("🔍 PAYMENT: Get payment for reservation:", reservation_id);

  const query = `
    SELECT 
      p.*,
      r.start_time,
      r.end_time,
      r.status as reservation_status,
      r.total_amount as reservation_total
    FROM payments p
    JOIN reservations r ON p.reservation_id = r.id
    WHERE p.reservation_id = ? AND r.user_id = ?
  `;

  db.query(query, [reservation_id, userId], (err, results) => {
    if (err) {
      console.error("❌ Database error:", err);
      return res.status(500).json({
        message: "Database error",
        error: err.message,
      });
    }

    if (results.length === 0) {
      return res.status(404).json({
        message: "Payment not found for this reservation",
      });
    }

    console.log("✅ Payment found");

    res.status(200).json({
      message: "Payment retrieved successfully",
      payment: results[0],
    });
  });
});

module.exports = router;
