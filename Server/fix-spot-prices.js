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

  console.log("✅ Connected to database\n");

  // Update all VIP Royal Zone spots to correct price
  const updateVIP = `
    UPDATE parking_spots 
    SET price_per_hour = 25000 
    WHERE zone_type = 'VIP Royal Zone'
  `;

  db.query(updateVIP, (err, result) => {
    if (err) {
      console.error("Error updating VIP prices:", err);
      db.end();
      process.exit(1);
    }

    console.log(
      `✅ Updated ${result.affectedRows} VIP spots to Rp 25.000/hour\n`
    );

    // Update Entertainment District to correct price
    const updateEntertainment = `
      UPDATE parking_spots 
      SET price_per_hour = 15000 
      WHERE zone_type = 'Entertainment District'
    `;

    db.query(updateEntertainment, (err, result) => {
      if (err) {
        console.error("Error updating Entertainment prices:", err);
        db.end();
        process.exit(1);
      }

      console.log(
        `✅ Updated ${result.affectedRows} Entertainment spots to Rp 15.000/hour\n`
      );

      // Update Regular Parking to correct price
      const updateRegular = `
        UPDATE parking_spots 
        SET price_per_hour = 8000 
        WHERE zone_type = 'Regular Parking'
      `;

      db.query(updateRegular, (err, result) => {
        if (err) {
          console.error("Error updating Regular prices:", err);
          db.end();
          process.exit(1);
        }

        console.log(
          `✅ Updated ${result.affectedRows} Regular spots to Rp 8.000/hour\n`
        );

        // Verify the changes
        db.query(
          `
          SELECT 
            zone_type,
            COUNT(*) as total_spots,
            price_per_hour
          FROM parking_spots
          GROUP BY zone_type, price_per_hour
          ORDER BY zone_type
        `,
          (err, results) => {
            console.log("📊 Verification - Current Prices:\n");
            results.forEach((row) => {
              console.log(
                `  ${row.zone_type}: Rp ${row.price_per_hour}/hour (${row.total_spots} spots)`
              );
            });

            db.end();
            console.log("\n✅ All prices updated successfully!");
          }
        );
      });
    });
  });
});
