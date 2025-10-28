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

  // 1. Check current parking spots status
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
        db.end();
        return;
      }

      console.log("📊 CURRENT PARKING SPOTS STATUS:");
      console.table(results);

      // 2. Reset some spots to available
      console.log("\n🔄 Resetting parking spots to available...\n");

      db.query(
        `
      UPDATE parking_spots 
      SET status = 'available' 
      WHERE zone_type IN ('Regular Parking', 'VIP Royal Zone', 'Shopping Paradise')
        AND id NOT IN (
          SELECT DISTINCT spot_id 
          FROM reservations 
          WHERE status IN ('active', 'pending')
            AND spot_id IS NOT NULL
        )
    `,
        (err, result) => {
          if (err) {
            console.error("Error updating spots:", err);
          } else {
            console.log(`✅ Updated ${result.affectedRows} spots to available`);
          }

          // 3. Check after update
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
                console.log("\n📊 AFTER UPDATE:");
                console.table(results);
              }

              // 4. Show available spots per zone
              db.query(
                `
          SELECT 
            zone_type,
            COUNT(*) as available_spots
          FROM parking_spots
          WHERE status = 'available'
          GROUP BY zone_type
        `,
                (err, results) => {
                  if (err) {
                    console.error("Error:", err);
                  } else {
                    console.log("\n✅ AVAILABLE SPOTS BY ZONE:");
                    console.table(results);
                  }

                  // 5. Show reservations
                  db.query(
                    `
            SELECT id, user_id, spot_id, status, created_at
            FROM reservations
            ORDER BY created_at DESC
          `,
                    (err, results) => {
                      if (err) {
                        console.error("Error:", err);
                      } else {
                        console.log("\n📋 ALL RESERVATIONS:");
                        console.table(results);
                      }

                      db.end();
                      console.log("\n✅ Database check complete!");
                    }
                  );
                }
              );
            }
          );
        }
      );
    }
  );
});
