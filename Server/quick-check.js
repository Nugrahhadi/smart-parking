const mysql = require("mysql");

const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "1234",
  database: "parking_system",
});

db.connect((err) => {
  if (err) {
    console.error("Database error:", err);
    process.exit(1);
  }

  console.log("✅ Connected\n");

  // Check users
  db.query("SELECT COUNT(*) as total FROM users", (err, result) => {
    console.log("👤 Total Users:", result[0].total);
  });

  // Check vehicles
  db.query("SELECT COUNT(*) as total FROM vehicles", (err, result) => {
    console.log("🚗 Total Vehicles:", result[0].total);
  });

  // Check available spots
  db.query(
    "SELECT COUNT(*) as total FROM parking_spots WHERE status = 'available'",
    (err, result) => {
      console.log("🅿️  Available Spots:", result[0].total);
    }
  );

  // Check locations
  db.query("SELECT COUNT(*) as total FROM parking_locations", (err, result) => {
    console.log("📍 Total Locations:", result[0].total);
  });

  // Check reservations
  db.query("SELECT COUNT(*) as total FROM reservations", (err, result) => {
    console.log("📋 Total Reservations:", result[0].total);

    // Show latest 3
    db.query(
      `SELECT id, user_id, status, total_amount FROM reservations ORDER BY id DESC LIMIT 3`,
      (err, rows) => {
        if (rows && rows.length > 0) {
          console.log("\n📊 Latest Reservations:");
          rows.forEach((row) => {
            console.log(
              `  ID: ${row.id}, User: ${row.user_id}, Status: ${row.status}, Amount: ${row.total_amount}`
            );
          });
        }
        db.end();
      }
    );
  });
});
