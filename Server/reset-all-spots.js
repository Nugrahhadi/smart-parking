const mysql = require("mysql2");
require("dotenv").config();

const db = mysql.createConnection({
  host: process.env.DB_HOST || "localhost",
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "",
  database: process.env.DB_NAME || "parking_system",
  multipleStatements: true,
});

console.log("🔄 RESETTING ALL PARKING SPOTS...\n");

db.connect((err) => {
  if (err) {
    console.error("❌ Connection error:", err);
    process.exit(1);
  }

  console.log("✅ Connected to database\n");

  // Execute all operations in sequence
  const operations = [
    {
      name: "Delete pending reservations payments",
      sql: `DELETE FROM payments WHERE reservation_id IN (
        SELECT id FROM reservations WHERE status = 'pending'
      )`,
    },
    {
      name: "Delete pending reservations",
      sql: `DELETE FROM reservations WHERE status = 'pending'`,
    },
    {
      name: "Reset all parking spots to available",
      sql: `UPDATE parking_spots SET status = 'available'`,
    },
    {
      name: "Update available spots count",
      sql: `UPDATE parking_locations pl
        SET available_spots = (
          SELECT COUNT(*) 
          FROM parking_spots ps 
          WHERE ps.location_id = pl.id 
            AND ps.status = 'available'
        )`,
    },
  ];

  let currentOp = 0;

  function runNextOperation() {
    if (currentOp >= operations.length) {
      // All done, show results
      showResults();
      return;
    }

    const op = operations[currentOp];
    console.log(`⏳ ${op.name}...`);

    db.query(op.sql, (err, result) => {
      if (err) {
        console.error(`❌ Error in ${op.name}:`, err.message);
      } else {
        const affected = result.affectedRows || 0;
        console.log(`✅ ${op.name}: ${affected} rows affected`);
      }

      currentOp++;
      runNextOperation();
    });
  }

  function showResults() {
    console.log("\n📊 FINAL STATUS:\n");

    // Show spots by status
    db.query(
      `
      SELECT 
        zone_type,
        status,
        COUNT(*) as count
      FROM parking_spots
      GROUP BY zone_type, status
      ORDER BY zone_type, status
    `,
      (err, results) => {
        if (err) {
          console.error("Error:", err);
        } else {
          console.log("🅿️ PARKING SPOTS BY ZONE:");
          console.table(results);
        }

        // Show locations
        db.query(
          `
        SELECT 
          id,
          name,
          total_spots,
          available_spots
        FROM parking_locations
      `,
          (err, results) => {
            if (err) {
              console.error("Error:", err);
            } else {
              console.log("\n📍 LOCATIONS:");
              console.table(results);
            }

            // Show active reservations count
            db.query(
              `
          SELECT 
            status,
            COUNT(*) as count
          FROM reservations
          GROUP BY status
        `,
              (err, results) => {
                if (err) {
                  console.error("Error:", err);
                } else {
                  console.log("\n📋 RESERVATIONS BY STATUS:");
                  console.table(results);
                }

                db.end();
                console.log("\n✅ RESET COMPLETE!");
                console.log("\n🎉 ALL PARKING SPOTS ARE NOW AVAILABLE!");
                console.log("\n📝 Ready for testing:");
                console.log('   - All spots status = "available"');
                console.log("   - No pending reservations");
                console.log("   - System ready for dynamic booking\n");
              }
            );
          }
        );
      }
    );
  }

  // Start executing operations
  runNextOperation();
});
