require("dotenv").config();
const { pool } = require("./config/database");

async function checkZones() {
  try {
    console.log("🔍 Checking zone_type in database...\n");

    const [results] = await pool.query(
      "SELECT DISTINCT zone_type, COUNT(*) as count, SUM(CASE WHEN status='available' THEN 1 ELSE 0 END) as available FROM parking_spots GROUP BY zone_type"
    );

    console.log("📊 Zone Types in Database:");
    console.table(results);

    const [spots] = await pool.query(
      "SELECT id, spot_number, zone_type, status FROM parking_spots ORDER BY id LIMIT 30"
    );

    console.log("\n📋 Sample Parking Spots:");
    console.table(spots);

    await pool.end();
    process.exit(0);
  } catch (err) {
    console.error("❌ Error:", err);
    process.exit(1);
  }
}

checkZones();
