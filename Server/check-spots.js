const mysql = require("mysql2");

const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "1234",
  database: "parking_system",
});

// Check available spots
db.query(
  "SELECT id, spot_number, zone_type, status FROM parking_spots WHERE location_id = 1 AND status = ? LIMIT 10",
  ["available"],
  (err, results) => {
    if (err) {
      console.error("❌ Error:", err);
    } else {
      console.log("✅ Available spots:");
      console.table(results);
    }

    // Check reservations
    db.query(
      "SELECT r.id, r.spot_id, ps.spot_number, r.status, r.start_time, r.end_time FROM reservations r LEFT JOIN parking_spots ps ON r.spot_id = ps.id WHERE r.status IN (?, ?) ORDER BY r.id DESC LIMIT 5",
      ["active", "pending"],
      (err, results) => {
        if (err) {
          console.error("❌ Error:", err);
        } else {
          console.log("\n📋 Recent reservations:");
          console.table(results);
        }
        process.exit();
      }
    );
  }
);
