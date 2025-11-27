require("dotenv").config();
const { pool } = require("./config/database");

async function resetTo3Zones() {
  try {
    console.log("🚀 Resetting to 3 zones with all available...\n");

    // Delete all parking spots
    await pool.query("DELETE FROM parking_spots");
    console.log("✅ Cleared existing parking spots");

    // Only 3 zones that match database
    const zones = [
      { name: "VIP Royal Zone", prefix: "V", count: 18 },
      { name: "Entertainment District", prefix: "E", count: 18 },
      { name: "Regular Parking", prefix: "R", count: 18 },
    ];

    let totalInserted = 0;

    // Get all locations
    const [locations] = await pool.query(
      "SELECT id, name FROM parking_locations"
    );
    console.log(`📍 Found ${locations.length} locations`);

    for (const location of locations) {
      console.log(`\n📌 Processing: ${location.name}`);

      for (const zone of zones) {
        for (let i = 1; i <= zone.count; i++) {
          const spotNumber = `${zone.prefix}${String(i).padStart(2, "0")}`;

          await pool.query(
            "INSERT INTO parking_spots (location_id, spot_number, zone_type, status) VALUES (?, ?, ?, 'available')",
            [location.id, spotNumber, zone.name]
          );

          totalInserted++;
        }
        console.log(`  ✅ ${zone.name}: ${zone.count} spots`);
      }
    }

    console.log(`\n✅ Total inserted: ${totalInserted} parking spots`);

    // Show summary
    const [summary] = await pool.query(
      "SELECT zone_type, COUNT(*) as count, SUM(CASE WHEN status='available' THEN 1 ELSE 0 END) as available FROM parking_spots GROUP BY zone_type"
    );

    console.log("\n📊 Parking Spots by Zone:");
    console.table(summary);

    // Update available_spots in locations
    const [locationUpdate] = await pool.query(
      "SELECT location_id, COUNT(*) as total FROM parking_spots WHERE status='available' GROUP BY location_id"
    );

    for (const loc of locationUpdate) {
      await pool.query(
        "UPDATE parking_locations SET available_spots = ? WHERE id = ?",
        [loc.total, loc.location_id]
      );
    }

    console.log("\n✅ Updated location available_spots");

    const [locationSummary] = await pool.query(
      "SELECT name, available_spots, total_spots FROM parking_locations"
    );
    console.table(locationSummary);

    await pool.end();
    console.log("\n🎉 Done! All zones populated with available spots");
    process.exit(0);
  } catch (err) {
    console.error("❌ Error:", err);
    process.exit(1);
  }
}

resetTo3Zones();
