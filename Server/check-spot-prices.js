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

  // Check spot prices by zone
  const query = `
    SELECT 
      zone_type,
      COUNT(*) as total_spots,
      MIN(price_per_hour) as min_price,
      MAX(price_per_hour) as max_price,
      AVG(price_per_hour) as avg_price
    FROM parking_spots
    GROUP BY zone_type
    ORDER BY zone_type
  `;

  db.query(query, (err, results) => {
    if (err) {
      console.error("Query error:", err);
      process.exit(1);
    }

    console.log("📊 Spot Prices by Zone:\n");
    results.forEach((row) => {
      console.log(`Zone: ${row.zone_type}`);
      console.log(`  Total Spots: ${row.total_spots}`);
      console.log(`  Price Range: Rp ${row.min_price} - Rp ${row.max_price}`);
      console.log(`  Average: Rp ${row.avg_price}`);
      console.log("");
    });

    // Check the specific spot used in reservation #45
    db.query(
      `
      SELECT 
        r.id,
        r.total_amount,
        r.start_time,
        r.end_time,
        ps.spot_number,
        ps.zone_type,
        ps.price_per_hour,
        TIMESTAMPDIFF(HOUR, r.start_time, r.end_time) as duration_hours
      FROM reservations r
      JOIN parking_spots ps ON r.spot_id = ps.id
      WHERE r.id = 45
    `,
      (err, res) => {
        if (err) {
          console.error("Error:", err);
          db.end();
          process.exit(1);
        }

        if (res.length > 0) {
          const reservation = res[0];
          console.log("🔍 Reservation #45 Details:\n");
          console.log(`  Spot: ${reservation.spot_number}`);
          console.log(`  Zone: ${reservation.zone_type}`);
          console.log(`  Price per hour (DB): Rp ${reservation.price_per_hour}`);
          console.log(`  Duration: ${reservation.duration_hours} hours`);
          console.log(
            `  Expected Total: Rp ${
              reservation.price_per_hour * reservation.duration_hours
            }`
          );
          console.log(`  Actual Total (DB): Rp ${reservation.total_amount}`);
          console.log(`  Start: ${reservation.start_time}`);
          console.log(`  End: ${reservation.end_time}`);
          console.log("");

          if (
            reservation.total_amount !==
            reservation.price_per_hour * reservation.duration_hours
          ) {
            console.log(
              "❌ MISMATCH! Total amount tidak sesuai dengan perhitungan!"
            );
          } else {
            console.log("✅ Total amount sudah benar");
          }
        }

        db.end();
      }
    );
  });
});
