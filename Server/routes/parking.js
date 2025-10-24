const express = require("express");
const router = express.Router();
const mysql = require("mysql2");

// Database connection
const db = mysql.createConnection({
  host: process.env.DB_HOST || "localhost",
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "",
  database: process.env.DB_NAME || "parking_system",
});

// Get all parking locations
router.get("/locations", (req, res) => {
  const query = `
    SELECT 
      pl.*,
      COUNT(ps.id) as total_spots,
      COUNT(CASE WHEN ps.status = 'available' THEN 1 END) as available_spots
    FROM parking_locations pl
    LEFT JOIN parking_spots ps ON pl.id = ps.location_id
    WHERE pl.status = 'active'
    GROUP BY pl.id
    ORDER BY pl.name
  `;

  db.query(query, (err, results) => {
    if (err) {
      console.error("Database error:", err);
      return res.status(500).json({ message: "Database error" });
    }

    const locations = results.map((location) => ({
      id: location.id,
      name: location.name,
      address: location.address,
      totalSpots: location.total_spots || 0,
      availableSpots: location.available_spots || 0,
      pricePerHour: parseFloat(location.price_per_hour),
      latitude: location.latitude,
      longitude: location.longitude,
      imageUrl: location.image_url,
      status: location.status,
    }));

    res.json({ locations });
  });
});

// Get parking location details with spots
router.get("/locations/:id", (req, res) => {
  const locationId = req.params.id;

  // Get location details
  const locationQuery =
    'SELECT * FROM parking_locations WHERE id = ? AND status = "active"';

  db.query(locationQuery, [locationId], (err, locationResults) => {
    if (err) {
      console.error("Database error:", err);
      return res.status(500).json({ message: "Database error" });
    }

    if (locationResults.length === 0) {
      return res.status(404).json({ message: "Parking location not found" });
    }

    const location = locationResults[0];

    // Get all parking spots for this location
    const spotsQuery = `
      SELECT 
        ps.*,
        r.id as reservation_id,
        r.start_time,
        r.end_time,
        r.status as reservation_status,
        u.name as reserved_by
      FROM parking_spots ps
      LEFT JOIN reservations r ON ps.id = r.spot_id AND r.status IN ('active', 'pending')
      LEFT JOIN users u ON r.user_id = u.id
      WHERE ps.location_id = ?
      ORDER BY ps.spot_number
    `;

    db.query(spotsQuery, [locationId], (err, spotsResults) => {
      if (err) {
        console.error("Database error:", err);
        return res.status(500).json({ message: "Database error" });
      }

      const spots = spotsResults.map((spot) => ({
        id: spot.id,
        spotNumber: spot.spot_number,
        status: spot.status,
        sensorId: spot.sensor_id,
        reservation: spot.reservation_id
          ? {
              id: spot.reservation_id,
              startTime: spot.start_time,
              endTime: spot.end_time,
              status: spot.reservation_status,
              reservedBy: spot.reserved_by,
            }
          : null,
      }));

      const availableSpots = spots.filter(
        (spot) => spot.status === "available"
      ).length;

      res.json({
        location: {
          id: location.id,
          name: location.name,
          address: location.address,
          totalSpots: spots.length,
          availableSpots: availableSpots,
          pricePerHour: parseFloat(location.price_per_hour),
          latitude: location.latitude,
          longitude: location.longitude,
          imageUrl: location.image_url,
        },
        spots: spots,
      });
    });
  });
});

// Get available spots for reservation
router.get("/locations/:id/available-spots", (req, res) => {
  const locationId = req.params.id;
  const { startTime, endTime } = req.query;

  let query = `
    SELECT ps.* 
    FROM parking_spots ps
    WHERE ps.location_id = ? AND ps.status = 'available'
  `;

  let queryParams = [locationId];

  // If time range provided, check for conflicts
  if (startTime && endTime) {
    query += `
      AND ps.id NOT IN (
        SELECT DISTINCT r.spot_id 
        FROM reservations r 
        WHERE r.spot_id IS NOT NULL 
        AND r.status IN ('active', 'pending')
        AND (
          (r.start_time <= ? AND r.end_time > ?) OR
          (r.start_time < ? AND r.end_time >= ?) OR
          (r.start_time >= ? AND r.end_time <= ?)
        )
      )
    `;
    queryParams.push(
      startTime,
      startTime,
      endTime,
      endTime,
      startTime,
      endTime
    );
  }

  query += " ORDER BY ps.spot_number";

  db.query(query, queryParams, (err, results) => {
    if (err) {
      console.error("Database error:", err);
      return res.status(500).json({ message: "Database error" });
    }

    const availableSpots = results.map((spot) => ({
      id: spot.id,
      spotNumber: spot.spot_number,
      status: spot.status,
    }));

    res.json({ availableSpots });
  });
});

module.exports = router;
