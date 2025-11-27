require("dotenv").config();
const { pool } = require("./config/database");

async function populateAllZones() {
  try {
    console.log("🚀 Populating all parking zones...\n");

    // Delete existing spots first
    await pool.query("DELETE FROM parking_spots");
    console.log("✅ Cleared existing parking spots");

    // All 6 zones from frontend
    const zones = [
      { name: "VIP Royal Zone", prefix: "V", count: 9 },
      { name: "Entertainment District", prefix: "E", count: 9 },
      { name: "Shopping Paradise", prefix: "S", count: 9 },
      { name: "Culinary Heaven", prefix: "D", count: 9 },
      { name: "Electric Vehicle Zone", prefix: "L", count: 9 },
      { name: "Regular Parking", prefix: "R", count: 9 },
    ];

    let totalInserted = 0;

    // Get all locations
    const [locations] = await pool.query("SELECT id FROM parking_locations");

    for (const location of locations) {
      for (const zone of zones) {
        for (let i = 1; i <= zone.count; i++) {
          const spotNumber = `${zone.prefix}${String(i).padStart(2, "0")}`;

          await pool.query(
            "INSERT INTO parking_spots (location_id, spot_number, zone_type, status) VALUES (?, ?, ?, 'available')",
            [location.id, spotNumber, zone.name]
          );

          totalInserted++;
        }
      }
    }

    console.log(`✅ Inserted ${totalInserted} parking spots`);

    // Show summary
    const [summary] = await pool.query(
      "SELECT zone_type, COUNT(*) as count FROM parking_spots GROUP BY zone_type"
    );

    console.log("\n📊 Parking Spots by Zone:");
    console.table(summary);

    // Update available_spots in locations
    const [locationUpdate] = await pool.query(
      "SELECT location_id, COUNT(*) as total FROM parking_spots GROUP BY location_id"
    );

    for (const loc of locationUpdate) {
      await pool.query(
        "UPDATE parking_locations SET available_spots = ? WHERE id = ?",
        [loc.total, loc.location_id]
      );
    }

    console.log("\n✅ Updated location available_spots");

    const [locationSummary] = await pool.query(
      "SELECT name, available_spots FROM parking_locations"
    );
    console.table(locationSummary);

    await pool.end();
    process.exit(0);
  } catch (err) {
    console.error("❌ Error:", err);
    process.exit(1);
  }
}

populateAllZones();
