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
  async (req, res) => {
    try {
      console.log("📊 Fetching dashboard metrics...");

      const revenueQuery = `
        SELECT 
          COALESCE(SUM(CASE WHEN MONTH(created_at) = MONTH(NOW()) THEN amount ELSE 0 END), 0) as total_revenue,
          COALESCE(SUM(CASE WHEN MONTH(created_at) = MONTH(DATE_SUB(NOW(), INTERVAL 1 MONTH)) 
                            AND YEAR(created_at) = YEAR(DATE_SUB(NOW(), INTERVAL 1 MONTH)) 
                            THEN amount ELSE 0 END), 0) as last_month_revenue
        FROM payments WHERE payment_status = 'completed'
      `;

      const occupancyQuery = `
        SELECT 
          ROUND(IF((SELECT COUNT(*) FROM parking_locations) > 0,
                   (SELECT COALESCE(SUM(occupied_slots), 0) FROM parking_locations) / 
                   (SELECT COALESCE(SUM(total_slots), 0) FROM parking_locations) * 100, 0), 1) as avg_occupancy,
          (SELECT COALESCE(SUM(occupied_slots), 0) FROM parking_locations) as occupied_slots,
          (SELECT COALESCE(SUM(total_slots), 0) FROM parking_locations) as total_slots
      `;

      const reservationsQuery = `
        SELECT 
          COUNT(*) as active_reservations
        FROM reservations WHERE status = 'active' AND end_time > NOW()
      `;

      const usersQuery = `
        SELECT 
          COUNT(*) as new_users,
          (SELECT COUNT(*) FROM users WHERE role = 'user' 
            AND created_at >= DATE_SUB(NOW(), INTERVAL 60 DAY)
            AND created_at < DATE_SUB(NOW(), INTERVAL 30 DAY)) as prev_month_users
        FROM users WHERE created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY) AND role = 'user'
      `;

      // Execute all queries in parallel
      const [revenueRes, occupancyRes, reservationsRes, usersRes] = await Promise.all([
        db.query(revenueQuery),
        db.query(occupancyQuery),
        db.query(reservationsQuery),
        db.query(usersQuery),
      ]);

      if (!revenueRes.success || !occupancyRes.success || !reservationsRes.success || !usersRes.success) {
        throw new Error("Failed to fetch metrics");
      }

      const revenueData = revenueRes.data[0];
      const occupancyData = occupancyRes.data[0];
      const reservationsData = reservationsRes.data[0];
      const usersData = usersRes.data[0];

      const currentRevenue = revenueData.total_revenue || 0;
      const lastMonthRevenue = revenueData.last_month_revenue || 1;
      const currentUsers = usersData.new_users || 0;
      const prevMonthUsers = usersData.prev_month_users || 1;

      const metrics = {
        total_revenue: parseFloat(currentRevenue),
        avg_occupancy: parseFloat(occupancyData.avg_occupancy) || 0,
        active_reservations: parseInt(reservationsData.active_reservations) || 0,
        new_users: parseInt(currentUsers) || 0,
        revenue_growth: lastMonthRevenue > 0 
          ? parseFloat((((currentRevenue - lastMonthRevenue) / lastMonthRevenue) * 100).toFixed(1))
          : 0,
        occupancy_growth: 0,
        reservations_growth: 0,
        users_growth: prevMonthUsers > 0
          ? parseFloat((((currentUsers - prevMonthUsers) / prevMonthUsers) * 100).toFixed(1))
          : 0,
      };

      console.log("✅ Metrics fetched successfully", metrics);
      res.json({ success: true, data: metrics });
    } catch (error) {
      console.error("❌ Error in metrics endpoint:", error);
      res.status(500).json({ success: false, error: error.message });
    }
  }
);

/**
 * Dashboard Chart Data
 * GET /api/admin/dashboard/chart
 * Returns: Parking occupancy data for the chart (by time)
 */
router.get("/chart", authenticateToken, authorizeRole("admin"), async (req, res) => {
  try {
    console.log("📈 Fetching chart data...");

    const chartQuery = `
      SELECT 
        COALESCE(HOUR(start_time), 0) as hour,
        COUNT(*) as count,
        COUNT(CASE WHEN status = 'active' THEN 1 END) as active,
        COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed
      FROM reservations 
      WHERE DATE(start_time) >= DATE_SUB(CURDATE(), INTERVAL 7 DAY)
      GROUP BY HOUR(start_time)
      ORDER BY hour ASC
    `;

    const chartRes = await db.query(chartQuery);
    
    if (!chartRes.success) {
      throw new Error("Failed to fetch chart data");
    }

    // Format data for chart
    const chartData = chartRes.data.map(row => ({
      hour: row.hour || 0,
      count: row.count || 0,
      active: row.active || 0,
    }));

    console.log("✅ Chart data fetched successfully");
    res.json({ success: true, data: chartData });
  } catch (error) {
    console.error("❌ Error in chart endpoint:", error);
    res.status(500).json({ success: false, error: error.message });
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
  async (req, res) => {
    try {
      console.log("📋 Fetching overview data...");

      const overviewQuery = `
        SELECT 
          (SELECT COUNT(*) FROM parking_locations) as total_locations,
          (SELECT COALESCE(SUM(total_slots), 0) FROM parking_locations) as total_slots,
          (SELECT COALESCE(SUM(occupied_slots), 0) FROM parking_locations) as occupied_slots,
          (SELECT COALESCE(SUM(total_slots) - SUM(occupied_slots), 0) FROM parking_locations) as available_slots,
          (SELECT COUNT(*) FROM reservations WHERE status = 'active') as active_reservations
      `;

      const overviewRes = await db.query(overviewQuery);

      if (!overviewRes.success) {
        throw new Error("Failed to fetch overview");
      }

      const data = overviewRes.data[0];
      const totalSlots = data.total_slots || 1;
      const occupiedSlots = data.occupied_slots || 0;
      const availableSlots = data.available_slots || 0;

      const overview = {
        total_locations: parseInt(data.total_locations) || 0,
        total_slots: parseInt(totalSlots),
        occupied_slots: parseInt(occupiedSlots),
        available_slots: parseInt(availableSlots),
        active_reservations: parseInt(data.active_reservations) || 0,
        occupancy_percentage: totalSlots > 0 ? parseFloat(((occupiedSlots / totalSlots) * 100).toFixed(1)) : 0,
      };

      console.log("✅ Overview fetched successfully");
      res.json({ success: true, data: overview });
    } catch (error) {
      console.error("❌ Error in overview endpoint:", error);
      res.status(500).json({ success: false, error: error.message });
    }
  }
);

module.exports = router;

module.exports = router;
