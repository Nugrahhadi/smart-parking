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

  // Get payments table structure
  db.query("DESCRIBE payments", (err, results) => {
    if (err) {
      console.error("❌ Error:", err.message);
      db.end();
      return;
    }

    console.log("📊 PAYMENTS TABLE STRUCTURE:");
    console.log(
      "================================================================================"
    );
    console.table(results);

    console.log("\n📋 Column Names:");
    results.forEach((col) => {
      console.log(`  - ${col.Field} (${col.Type})`);
    });

    // Get sample data
    db.query("SELECT * FROM payments LIMIT 5", (err, payments) => {
      if (err) {
        console.error("Error getting payments:", err);
      } else {
        console.log(
          `\n📈 Total Payments: ${
            payments.length > 0 ? "Found " + payments.length : "No payments yet"
          }`
        );

        if (payments.length > 0) {
          console.log("\n📝 Sample Data:");
          console.table(payments);
        }
      }

      db.end();
    });
  });
});
