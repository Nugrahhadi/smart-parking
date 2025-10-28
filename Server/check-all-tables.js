const mysql = require("mysql2");
require("dotenv").config();

const db = mysql.createConnection({
  host: process.env.DB_HOST || "localhost",
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "",
  database: process.env.DB_NAME || "parking_system",
});

db.connect((err) => {
  if (err) {
    console.error("❌ Connection error:", err);
    process.exit(1);
  }

  console.log("✅ Connected to database\n");

  // Get parking_locations table structure
  db.query("DESCRIBE parking_locations", (err, results) => {
    if (err) {
      console.error("❌ Error:", err.message);
      db.end();
      return;
    }

    console.log("📊 PARKING_LOCATIONS TABLE STRUCTURE:");
    console.log(
      "================================================================================"
    );
    console.table(results);

    console.log("\n📋 Column Names:");
    results.forEach((col) => {
      console.log(`  - ${col.Field} (${col.Type})`);
    });

    // Get sample data
    db.query("SELECT * FROM parking_locations LIMIT 5", (err, locations) => {
      if (err) {
        console.error("Error getting locations:", err);
      } else {
        console.log(`\n📈 Total Locations: ${locations.length}`);

        if (locations.length > 0) {
          console.log("\n📝 Sample Data:");
          console.table(locations);
        }
      }

      // Also check payments table
      db.query("DESCRIBE payments", (err, results) => {
        if (err) {
          console.error("❌ Payments table error:", err.message);
        } else {
          console.log("\n\n📊 PAYMENTS TABLE STRUCTURE:");
          console.log(
            "================================================================================"
          );
          console.table(results);
        }

        // Check vehicles table
        db.query("DESCRIBE vehicles", (err, results) => {
          if (err) {
            console.error("❌ Vehicles table error:", err.message);
          } else {
            console.log("\n\n📊 VEHICLES TABLE STRUCTURE:");
            console.log(
              "================================================================================"
            );
            console.table(results);
          }

          db.end();
        });
      });
    });
  });
});
