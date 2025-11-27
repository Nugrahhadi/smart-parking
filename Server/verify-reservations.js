const mysql = require("mysql");

const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "",
  database: "parking_system",
});

db.connect((err) => {
  if (err) {
    console.error("❌ Database connection failed:", err);
    process.exit(1);
  }
  console.log("✅ Connected to MySQL database\n");

  // Check reservations
  db.query("SELECT COUNT(*) as total FROM reservations", (err, result) => {
    if (err) {
      console.error("❌ Error counting reservations:", err);
      db.end();
      process.exit(1);
    }
    console.log("📊 Total Reservations:", result[0].total);

    // Get detailed reservations
    const query = `
      SELECT 
        r.id, 
        r.user_id,
        r.location_id,
        r.spot_id,
        r.status,
        r.total_amount,
        r.start_time,
        r.end_time,
        (SELECT COUNT(*) FROM payments WHERE reservation_id = r.id) as payment_count
      FROM reservations r
      ORDER BY r.id DESC
      LIMIT 5
    `;

    db.query(query, (err, reservations) => {
      if (err) {
        console.error("❌ Error fetching reservations:", err);
        db.end();
        process.exit(1);
      }

      console.log("\n📋 Last 5 Reservations:");
      console.log("=====================================");
      reservations.forEach((res) => {
        console.log(`
ID: ${res.id}
User ID: ${res.user_id}
Location ID: ${res.location_id}
Spot ID: ${res.spot_id}
Status: ${res.status}
Amount: Rp ${res.total_amount}
Start: ${res.start_time}
End: ${res.end_time}
Payment Records: ${res.payment_count}
-----`);
      });

      // Check payments
      db.query("SELECT COUNT(*) as total FROM payments", (err, payResult) => {
        console.log(`\n💰 Total Payment Records: ${payResult[0].total}`);

        // Check parking spots
        db.query(
          "SELECT COUNT(*) as total FROM parking_spots",
          (err, spotResult) => {
            console.log(`🅿️  Total Parking Spots: ${spotResult[0].total}`);

            db.end();
            console.log("\n✅ Verification complete");
          }
        );
      });
    });
  });
});
