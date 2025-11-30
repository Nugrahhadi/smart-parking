const express = require("express");
const router = express.Router();
const { authenticateToken, authorizeRole } = require("../../middleware/auth");
const db = require("../../config/database");

/**
 * GET /api/admin/transactions
 * Fetch all parking transactions with filtering and sorting
 */
router.get("/", authenticateToken, authorizeRole("admin"), (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      location_id,
      startDate,
      endDate,
      status,
      sortBy = "created_at",
      sortOrder = "DESC",
    } = req.query;

    const offset = (page - 1) * limit;

    console.log("💳 Fetching transactions...", {
      page,
      limit,
      location_id,
      startDate,
      endDate,
    });

    let transactionsQuery = `
      SELECT 
        r.id as transaction_id,
        r.user_id,
        v.license_plate as vehicle_plate,
        pl.name as location_name,
        r.start_time as time_in,
        r.end_time as time_out,
        CEIL((TIMESTAMPDIFF(MINUTE, r.start_time, r.end_time) / 60)) as duration_hours,
        r.total_amount as total_fee,
        p.payment_status,
        p.payment_method,
        r.status as reservation_status,
        r.created_at,
        u.full_name,
        u.email
      FROM reservations r
      LEFT JOIN vehicles v ON r.vehicle_id = v.id
      LEFT JOIN parking_locations pl ON r.location_id = pl.id
      LEFT JOIN payments p ON r.id = p.reservation_id
      LEFT JOIN users u ON r.user_id = u.id
      WHERE 1=1
    `;

    const params = [];

    // Add filters
    if (location_id) {
      transactionsQuery += ` AND r.location_id = ?`;
      params.push(location_id);
    }

    if (startDate) {
      transactionsQuery += ` AND DATE(r.start_time) >= ?`;
      params.push(startDate);
    }

    if (endDate) {
      transactionsQuery += ` AND DATE(r.start_time) <= ?`;
      params.push(endDate);
    }

    if (status) {
      transactionsQuery += ` AND p.payment_status = ?`;
      params.push(status);
    }

    // Validate sortBy to prevent SQL injection
    const allowedSortBy = [
      "r.created_at",
      "r.total_amount",
      "duration_hours",
      "u.full_name",
      "pl.name",
    ];
    const validSortBy = allowedSortBy.includes(sortBy)
      ? sortBy
      : "r.created_at";
    const validSortOrder = sortOrder.toUpperCase() === "ASC" ? "ASC" : "DESC";

    transactionsQuery += ` ORDER BY ${validSortBy} ${validSortOrder}
      LIMIT ? OFFSET ?`;

    params.push(parseInt(limit), offset);

    db.query(transactionsQuery, params, (err, results) => {
      if (err) {
        console.error("❌ Query error:", err);
        return res.status(500).json({ error: "Failed to fetch transactions" });
      }

      // Get total count for pagination
      let countQuery = `
        SELECT COUNT(*) as total FROM reservations r
        WHERE 1=1
      `;
      let countParams = [];

      if (location_id) {
        countQuery += ` AND r.location_id = ?`;
        countParams.push(location_id);
      }

      if (startDate) {
        countQuery += ` AND DATE(r.start_time) >= ?`;
        countParams.push(startDate);
      }

      if (endDate) {
        countQuery += ` AND DATE(r.start_time) <= ?`;
        countParams.push(endDate);
      }

      db.query(countQuery, countParams, (err, countResults) => {
        if (err) {
          console.error("❌ Count error:", err);
          return res
            .status(500)
            .json({ error: "Failed to count transactions" });
        }

        const total = countResults[0].total;
        const totalPages = Math.ceil(total / limit);

        console.log("✅ Fetched", results.length, "transactions");
        res.json({
          success: true,
          data: results,
          pagination: {
            page: parseInt(page),
            limit: parseInt(limit),
            total,
            totalPages,
          },
        });
      });
    });
  } catch (error) {
    console.error("❌ Error:", error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/admin/transactions/:id
 * Fetch single transaction details
 */
router.get("/:id", authenticateToken, authorizeRole("admin"), (req, res) => {
  try {
    const { id } = req.params;
    console.log(`💳 Fetching transaction ${id}...`);

    const transactionQuery = `
      SELECT 
        r.id as transaction_id,
        r.user_id,
        v.license_plate as vehicle_plate,
        v.vehicle_type,
        pl.name as location_name,
        pl.address as location_address,
        ps.spot_number,
        ps.zone_type,
        r.start_time as time_in,
        r.end_time as time_out,
        CEIL((TIMESTAMPDIFF(MINUTE, r.start_time, r.end_time) / 60)) as duration_hours,
        r.total_amount as total_fee,
        p.payment_status,
        p.payment_method,
        p.transaction_id as payment_transaction_id,
        r.status as reservation_status,
        r.created_at,
        u.full_name,
        u.email,
        u.phone_number
      FROM reservations r
      LEFT JOIN vehicles v ON r.vehicle_id = v.id
      LEFT JOIN parking_locations pl ON r.location_id = pl.id
      LEFT JOIN parking_spots ps ON r.spot_id = ps.id
      LEFT JOIN payments p ON r.id = p.reservation_id
      LEFT JOIN users u ON r.user_id = u.id
      WHERE r.id = ?
    `;

    db.query(transactionQuery, [id], (err, results) => {
      if (err) {
        console.error("❌ Query error:", err);
        return res.status(500).json({ error: "Failed to fetch transaction" });
      }

      if (results.length === 0) {
        return res.status(404).json({ error: "Transaction not found" });
      }

      console.log("✅ Transaction fetched successfully");
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
 * GET /api/admin/transactions/stats/summary
 * Get transaction summary statistics
 */
router.get(
  "/stats/summary",
  authenticateToken,
  authorizeRole("admin"),
  (req, res) => {
    try {
      console.log("📊 Fetching transaction summary...");

      const summaryQuery = `
      SELECT 
        COUNT(*) as total_transactions,
        SUM(r.total_amount) as total_revenue,
        AVG(r.total_amount) as avg_transaction_value,
        COUNT(DISTINCT r.user_id) as unique_users,
        COUNT(DISTINCT r.location_id) as locations_used,
        SUM(CEIL((TIMESTAMPDIFF(MINUTE, r.start_time, r.end_time) / 60))) as total_hours_parked,
        COUNT(CASE WHEN p.payment_status = 'completed' THEN 1 END) as completed_payments,
        COUNT(CASE WHEN p.payment_status = 'pending' THEN 1 END) as pending_payments
      FROM reservations r
      LEFT JOIN payments p ON r.id = p.reservation_id
    `;

      db.query(summaryQuery, (err, results) => {
        if (err) {
          console.error("❌ Query error:", err);
          return res
            .status(500)
            .json({ error: "Failed to fetch transaction summary" });
        }

        console.log("✅ Summary fetched successfully");
        res.json({
          success: true,
          data: results[0],
        });
      });
    } catch (error) {
      console.error("❌ Error:", error);
      res.status(500).json({ error: error.message });
    }
  }
);

/**
 * GET /api/admin/transactions/export/csv
 * Export transactions to CSV (basic implementation)
 */
router.get(
  "/export/csv",
  authenticateToken,
  authorizeRole("admin"),
  (req, res) => {
    try {
      const { startDate, endDate, location_id } = req.query;

      console.log("📥 Exporting transactions to CSV...");

      let exportQuery = `
      SELECT 
        r.id as 'Transaction ID',
        u.full_name as 'User Name',
        v.license_plate as 'Vehicle Plate',
        pl.name as 'Location',
        r.start_time as 'Check In',
        r.end_time as 'Check Out',
        CEIL((TIMESTAMPDIFF(MINUTE, r.start_time, r.end_time) / 60)) as 'Duration (Hours)',
        r.total_amount as 'Total Fee',
        p.payment_status as 'Payment Status',
        r.created_at as 'Created At'
      FROM reservations r
      LEFT JOIN vehicles v ON r.vehicle_id = v.id
      LEFT JOIN parking_locations pl ON r.location_id = pl.id
      LEFT JOIN payments p ON r.id = p.reservation_id
      LEFT JOIN users u ON r.user_id = u.id
      WHERE 1=1
    `;

      const params = [];

      if (startDate) {
        exportQuery += ` AND DATE(r.start_time) >= ?`;
        params.push(startDate);
      }

      if (endDate) {
        exportQuery += ` AND DATE(r.start_time) <= ?`;
        params.push(endDate);
      }

      if (location_id) {
        exportQuery += ` AND r.location_id = ?`;
        params.push(location_id);
      }

      exportQuery += ` ORDER BY r.created_at DESC`;

      db.query(exportQuery, params, (err, results) => {
        if (err) {
          console.error("❌ Query error:", err);
          return res
            .status(500)
            .json({ error: "Failed to export transactions" });
        }

        if (results.length === 0) {
          return res.status(404).json({ error: "No transactions to export" });
        }

        // Convert to CSV
        const headers = Object.keys(results[0]);
        const csv = [headers.join(",")];

        results.forEach((row) => {
          const values = headers.map((header) => {
            const value = row[header];
            // Escape quotes and wrap in quotes if needed
            if (
              typeof value === "string" &&
              (value.includes(",") || value.includes('"'))
            ) {
              return `"${value.replace(/"/g, '""')}"`;
            }
            return value || "";
          });
          csv.push(values.join(","));
        });

        res.setHeader("Content-Type", "text/csv");
        res.setHeader(
          "Content-Disposition",
          `attachment; filename=transactions-${
            new Date().toISOString().split("T")[0]
          }.csv`
        );

        console.log("✅ CSV exported successfully");
        res.send(csv.join("\n"));
      });
    } catch (error) {
      console.error("❌ Error:", error);
      res.status(500).json({ error: error.message });
    }
  }
);

module.exports = router;
