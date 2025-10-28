const mysql = require("mysql2");
require("dotenv").config();
const fs = require("fs");
const path = require("path");

const db = mysql.createConnection({
  host: process.env.DB_HOST || "localhost",
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "",
  database: process.env.DB_NAME || "parking_system",
  multipleStatements: true,
});

db.connect((err) => {
  if (err) {
    console.error("❌ Connection error:", err);
    process.exit(1);
  }

  console.log("✅ Connected to database\n");
  console.log("🔄 Running migration...\n");

  // Read SQL file
  const sqlFile = path.join(__dirname, "migrations", "fix_payment_schema.sql");
  const sql = fs.readFileSync(sqlFile, "utf8");

  // Execute migration
  db.query(sql, (err, results) => {
    if (err) {
      console.error("❌ Migration error:", err);
      db.end();
      process.exit(1);
    }

    console.log("✅ Migration completed successfully!\n");

    // Show results
    if (Array.isArray(results)) {
      results.forEach((result, index) => {
        if (result && result.length > 0) {
          console.log(`\n📊 Result Set ${index + 1}:`);
          console.table(result);
        }
      });
    }

    // Verify payments table
    db.query("DESCRIBE payments", (err, result) => {
      if (err) {
        console.error("Error checking payments table:", err);
      } else {
        console.log("\n📋 PAYMENTS TABLE STRUCTURE:");
        console.table(result);
      }

      // Check data
      db.query("SELECT * FROM payments", (err, payments) => {
        if (err) {
          console.error("Error fetching payments:", err);
        } else {
          console.log(`\n💳 Total payments in database: ${payments.length}`);
          if (payments.length > 0) {
            console.table(payments);
          }
        }

        // Check reservations with payments
        db.query(
          `
          SELECT 
            r.id,
            r.user_id,
            r.status,
            r.total_amount,
            p.id as payment_id,
            p.payment_status,
            p.payment_method
          FROM reservations r
          LEFT JOIN payments p ON r.id = p.reservation_id
          ORDER BY r.created_at DESC
          LIMIT 5
        `,
          (err, results) => {
            if (err) {
              console.error("Error:", err);
            } else {
              console.log("\n🔍 RESERVATIONS WITH PAYMENT STATUS:");
              console.table(results);
            }

            db.end();
            console.log("\n✅ Migration check complete!");
          }
        );
      });
    });
  });
});
