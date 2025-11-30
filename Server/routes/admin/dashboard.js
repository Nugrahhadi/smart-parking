const express = require("express");
const router = express.Router();
const { authenticateToken, authorizeRole } = require("../../middleware/auth");
const db = require("../../config/database");

/**
 * Dashboard Metrics Endpoint
 * GET /api/admin/dashboard/metrics
 * Returns: Total Revenue, Average Occupancy, Active Reservations, New Users
 */
router.get(
  "/metrics",
  authenticateToken,
  authorizeRole("admin"),
  (req, res) => {
    try {
      console.log("📊 Fetching dashboard metrics...");

      // Query 1: Total Revenue (from payments) with growth calculation
      const revenueQuery = `
      SELECT 
        COALESCE(SUM(CASE WHEN MONTH(created_at) = MONTH(NOW()) THEN p.amount ELSE 0 END), 0) as total_revenue,
        COUNT(DISTINCT p.reservation_id) as transaction_count,
        (SELECT COALESCE(SUM(amount), 0) FROM payments WHERE DATE(created_at) = CURDATE()) as today_revenue,
        COALESCE(SUM(CASE WHEN MONTH(created_at) = MONTH(DATE_SUB(NOW(), INTERVAL 1 MONTH)) 
                          AND YEAR(created_at) = YEAR(DATE_SUB(NOW(), INTERVAL 1 MONTH)) 
                          THEN p.amount ELSE 0 END), 0) as last_month_revenue
      FROM payments p
      WHERE p.payment_status = 'completed'
    `;

      // Query 2: Average Occupancy
      const occupancyQuery = `
      SELECT 
        ROUND(((SELECT COUNT(*) FROM parking_spots WHERE status = 'reserved') / 
                (SELECT COUNT(*) FROM parking_spots)) * 100, 1) as avg_occupancy,
        (SELECT COUNT(*) FROM parking_spots WHERE status = 'reserved') as occupied_count,
        (SELECT COUNT(*) FROM parking_spots WHERE status = 'available') as available_count,
        (SELECT COUNT(*) FROM parking_spots) as total_slots
    `;

      // Query 3: Active Reservations
      const activeReservationsQuery = `
      SELECT 
        COUNT(*) as active_count,
        (SELECT COUNT(*) FROM reservations WHERE status = 'pending') as pending_count
      FROM reservations 
      WHERE status = 'active' AND end_time > NOW()
    `;

      // Query 4: New Users (last 30 days) with growth calculation
      const newUsersQuery = `
      SELECT 
        COUNT(*) as new_users_count,
        COUNT(CASE WHEN DATE(created_at) = CURDATE() THEN 1 END) as today_new_users,
        (
          SELECT COUNT(*) 
          FROM users 
          WHERE role = 'user'
          AND created_at >= DATE_SUB(NOW(), INTERVAL 60 DAY)
          AND created_at < DATE_SUB(NOW(), INTERVAL 30 DAY)
        ) as previous_month_users
      FROM users 
      WHERE created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)
      AND role = 'user'
    `;

      let metrics = {};
      let completedQueries = 0;
      const totalQueries = 4;

      const checkComplete = () => {
        completedQueries++;
        if (completedQueries === totalQueries) {
          console.log("✅ Metrics fetched successfully");
          res.json({
            success: true,
            data: metrics,
          });
        }
      };

      db.query(revenueQuery, (err, results) => {
        if (err) {
          console.error("❌ Revenue query error:", err);
          return res.status(500).json({ error: "Failed to fetch revenue" });
        }
        const currentRevenue = results[0].total_revenue || 0;
        const lastMonthRevenue = results[0].last_month_revenue || 1;

        metrics.total_revenue = currentRevenue;
        metrics.total_transactions = results[0].transaction_count || 0;
        metrics.today_revenue = results[0].today_revenue || 0;
        metrics.revenue_growth =
          lastMonthRevenue > 0
            ? parseFloat(
                (
                  ((currentRevenue - lastMonthRevenue) / lastMonthRevenue) *
                  100
                ).toFixed(1)
              )
            : 0;
        checkComplete();
      });

      db.query(occupancyQuery, (err, results) => {
        if (err) {
          console.error("❌ Occupancy query error:", err);
          return res.status(500).json({ error: "Failed to fetch occupancy" });
        }
        metrics.avg_occupancy = results[0].avg_occupancy || 0;
        metrics.occupied_slots = results[0].occupied_count || 0;
        metrics.available_slots = results[0].available_count || 0;
        metrics.total_slots = results[0].total_slots || 0;
        // Occupancy growth set to 0 (no historical tracking)
        metrics.occupancy_growth = 0;
        checkComplete();
      });

      db.query(activeReservationsQuery, (err, results) => {
        if (err) {
          console.error("❌ Active reservations query error:", err);
          return res.status(500).json({
            error: "Failed to fetch active reservations",
          });
        }
        metrics.active_reservations = results[0].active_count || 0;
        metrics.pending_reservations = results[0].pending_count || 0;
        // Reservations growth set to 0 (no historical tracking)
        metrics.reservations_growth = 0;
        checkComplete();
      });

      db.query(newUsersQuery, (err, results) => {
        if (err) {
          console.error("❌ New users query error:", err);
          return res.status(500).json({ error: "Failed to fetch new users" });
        }
        const currentMonthUsers = results[0].new_users_count || 0;
        const previousMonthUsers = results[0].previous_month_users || 1;

        metrics.new_users = currentMonthUsers;
        metrics.today_new_users = results[0].today_new_users || 0;
        metrics.users_growth =
          previousMonthUsers > 0
            ? parseFloat(
                (
                  ((currentMonthUsers - previousMonthUsers) /
                    previousMonthUsers) *
                  100
                ).toFixed(1)
              )
            : 0;
        checkComplete();
      });
    } catch (error) {
      console.error("❌ Error in metrics endpoint:", error);
      res.status(500).json({ error: error.message });
    }
  }
);

/**
 * Dashboard Chart Data
 * GET /api/admin/dashboard/chart
 * Returns: Parking occupancy data for the chart (by time)
 */
router.get("/chart", authenticateToken, authorizeRole("admin"), (req, res) => {
  try {
    console.log("📈 Fetching chart data...");

    const chartQuery = `
      SELECT 
        HOUR(r.start_time) as hour,
        DATE_FORMAT(r.start_time, '%h %p') as time_label,
        COUNT(CASE WHEN r.status = 'active' THEN 1 END) as occupied,
        (SELECT COUNT(*) FROM parking_spots) - COUNT(CASE WHEN r.status = 'active' THEN 1 END) as available
      FROM reservations r
      WHERE DATE(r.start_time) = CURDATE()
      GROUP BY HOUR(r.start_time)
      ORDER BY hour ASC
    `;

    db.query(chartQuery, (err, results) => {
      if (err) {
        console.error("❌ Chart query error:", err);
        return res.status(500).json({ error: "Failed to fetch chart data" });
      }

      // Get total parking spots from database
      db.query(
        "SELECT COUNT(*) as total FROM parking_spots",
        (spotErr, spotResults) => {
          const totalSlots = spotErr ? 0 : spotResults[0]?.total || 0;

          // Ensure all time slots are represented
          const hourlyData = {};
          const hours = [
            "6 AM",
            "8 AM",
            "10 AM",
            "12 PM",
            "2 PM",
            "4 PM",
            "6 PM",
            "8 PM",
            "10 PM",
          ];
          const hoursMap = {
            6: "6 AM",
            8: "8 AM",
            10: "10 AM",
            12: "12 PM",
            14: "2 PM",
            16: "4 PM",
            18: "6 PM",
            20: "8 PM",
            22: "10 PM",
          };

          // Initialize with zeros (real data only)
          hours.forEach((hour) => {
            hourlyData[hour] = {
              name: hour,
              occupied: 0,
              available: totalSlots,
            };
          });

          // Fill with actual data from database
          results.forEach((row) => {
            if (hoursMap[row.hour]) {
              hourlyData[hoursMap[row.hour]] = {
                name: hoursMap[row.hour],
                occupied: row.occupied,
                available: row.available,
              };
            }
          });

          const chartData = Object.values(hourlyData);

          console.log("✅ Chart data fetched successfully");
          res.json({
            success: true,
            data: chartData,
          });
        }
      );
    });
  } catch (error) {
    console.error("❌ Error in chart endpoint:", error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * Dashboard Overview
 * GET /api/admin/dashboard/overview
 * Returns: Real-time overview of parking status
 */
router.get(
  "/overview",
  authenticateToken,
  authorizeRole("admin"),
  (req, res) => {
    try {
      console.log("📋 Fetching overview data...");

      const overviewQuery = `
      SELECT 
        (SELECT COUNT(*) FROM parking_spots) as total_slots,
        (SELECT COUNT(*) FROM parking_spots WHERE status = 'available') as available_slots,
        (SELECT COUNT(*) FROM parking_spots WHERE status = 'reserved') as occupied_slots,
        (SELECT COUNT(*) FROM reservations WHERE status = 'active') as reserved_count,
        (SELECT COUNT(*) FROM parking_locations) as total_locations,
        (SELECT COUNT(*) FROM parking_locations WHERE status = 'active') as active_locations
    `;

      db.query(overviewQuery, (err, results) => {
        if (err) {
          console.error("❌ Overview query error:", err);
          return res.status(500).json({ error: "Failed to fetch overview" });
        }

        const data = results[0];
        const totalSlots = data.total_slots || 1;
        const availableSlots = data.available_slots || 0;
        const occupiedSlots = data.occupied_slots || 0;

        const overview = {
          total_slots: totalSlots,
          available: {
            count: availableSlots,
            percentage: ((availableSlots / totalSlots) * 100).toFixed(1),
          },
          occupied: {
            count: occupiedSlots,
            percentage: ((occupiedSlots / totalSlots) * 100).toFixed(1),
          },
          reserved: {
            count: data.reserved_count || 0,
            percentage: ((data.reserved_count / totalSlots) * 100).toFixed(1),
          },
          total_locations: data.total_locations || 0,
          active_locations: data.active_locations || 0,
        };

        console.log("✅ Overview fetched successfully");
        res.json({
          success: true,
          data: overview,
        });
      });
    } catch (error) {
      console.error("❌ Error in overview endpoint:", error);
      res.status(500).json({ error: error.message });
    }
  }
);

module.exports = router;
