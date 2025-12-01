const express = require("express");
const router = express.Router();
const { authenticateToken, authorizeRole } = require("../../middleware/auth");
const db = require("../../config/database");

/**
 * GET /api/admin/transactions
 * Fetch all parking transactions with filtering and sorting
 */
router.get("/", authenticateToken, authorizeRole("admin"), async (req, res) => {
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
        r.id,
        r.user_id,
        u.full_name as user_name,
        u.email as user_email,
        pl.name as location_name,
        r.start_time as check_in_time,
        r.end_time as check_out_time,
        r.total_amount as amount,
        r.status,
        r.created_at
      FROM reservations r
      LEFT JOIN parking_locations pl ON r.location_id = pl.id
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
      transactionsQuery += ` AND r.status = ?`;
      params.push(status);
    }

    // Validate sortBy to prevent SQL injection
    const allowedSortBy = [
      "r.created_at",
      "r.total_amount",
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

    const [transRes, countRes] = await Promise.all([
      db.query(transactionsQuery, params),
      db.query("SELECT COUNT(*) as total FROM reservations WHERE 1=1" + (location_id ? " AND location_id = ?" : "") + (startDate ? " AND DATE(start_time) >= ?" : "") + (endDate ? " AND DATE(start_time) <= ?" : "") + (status ? " AND status = ?" : ""), 
        [location_id, startDate, endDate, status].filter(Boolean)
      ),
    ]);

    if (!transRes.success || !countRes.success) {
      throw new Error("Failed to fetch transactions");
    }

    const total = countRes.data[0]?.total || 0;
    const totalPages = Math.ceil(total / limit);

    console.log("✅ Fetched", transRes.data.length, "transactions");
    res.json({
      success: true,
      data: transRes.data,
      pagination: {
        current_page: parseInt(page),
        per_page: parseInt(limit),
        total_pages: totalPages,
        total: total,
      },
    });
  } catch (error) {
    console.error("❌ Error:", error);
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * GET /api/admin/transactions/:id
 * Fetch single transaction details
 */
router.get("/:id", authenticateToken, authorizeRole("admin"), async (req, res) => {
  try {
    const { id } = req.params;
    console.log(`💳 Fetching transaction ${id}...`);

    const transactionQuery = `
      SELECT 
        r.id,
        r.user_id,
        u.full_name as user_name,
        u.email as user_email,
        pl.name as location_name,
        r.start_time as check_in_time,
        r.end_time as check_out_time,
        r.total_amount as amount,
        r.status,
        r.created_at
      FROM reservations r
      LEFT JOIN parking_locations pl ON r.location_id = pl.id
      LEFT JOIN users u ON r.user_id = u.id
      WHERE r.id = ?
    `;

    const transRes = await db.queryOne(transactionQuery, [id]);
    
    if (!transRes.success || !transRes.data) {
      return res.status(404).json({ success: false, error: "Transaction not found" });
    }

    console.log("✅ Transaction fetched successfully");
    res.json({
      success: true,
      data: transRes.data,
    });
  } catch (error) {
    console.error("❌ Error:", error);
    res.status(500).json({ success: false, error: error.message });
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
  async (req, res) => {
    try {
      console.log("📊 Fetching transaction summary...");

      const summaryQuery = `
      SELECT 
        COUNT(*) as total_transactions,
        COALESCE(SUM(r.total_amount), 0) as total_revenue,
        COALESCE(AVG(r.total_amount), 0) as avg_transaction_value,
        COUNT(DISTINCT r.user_id) as unique_users
      FROM reservations r
      `;

      const summRes = await db.queryOne(summaryQuery, []);
      
      if (!summRes.success) {
        throw new Error("Failed to fetch transaction summary");
      }

      console.log("✅ Summary fetched successfully");
      res.json({
        success: true,
        data: summRes.data,
      });
    } catch (error) {
      console.error("❌ Error:", error);
      res.status(500).json({ success: false, error: error.message });
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
  async (req, res) => {
    try {
      const { startDate, endDate, location_id } = req.query;

      console.log("📥 Exporting transactions to CSV...");

      let exportQuery = `
      SELECT 
        r.id as transaction_id,
        u.full_name as user_name,
        pl.name as location_name,
        r.start_time as check_in,
        r.end_time as check_out,
        r.total_amount as fee,
        r.status,
        r.created_at
      FROM reservations r
      LEFT JOIN parking_locations pl ON r.location_id = pl.id
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

      const exportRes = await db.query(exportQuery, params);
      
      if (!exportRes.success || exportRes.data.length === 0) {
        return res.status(404).json({ success: false, error: "No transactions to export" });
      }

      // Convert to CSV
      const headers = Object.keys(exportRes.data[0]);
      const csv = [headers.join(",")];

      exportRes.data.forEach((row) => {
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
    } catch (error) {
      console.error("❌ Error:", error);
      res.status(500).json({ success: false, error: error.message });
    }
  }
);

module.exports = router;
