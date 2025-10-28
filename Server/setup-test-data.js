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
  console.log("🔧 Setting up test data...\n");

  // 1. Add Regular Parking spots if they don't exist
  db.query(
    `
    SELECT COUNT(*) as count 
    FROM parking_spots 
    WHERE zone_type = 'Regular Parking'
  `,
    (err, results) => {
      if (err) {
        console.error("Error:", err);
        db.end();
        return;
      }

      const regularCount = results[0].count;
      console.log(`📊 Current Regular Parking spots: ${regularCount}`);

      if (regularCount === 0) {
        console.log("➕ Adding Regular Parking spots...");

        db.query(
          `
        INSERT INTO parking_spots (location_id, spot_number, status, zone_type)
        VALUES 
          (1, 'R01', 'available', 'Regular Parking'),
          (1, 'R02', 'available', 'Regular Parking'),
          (1, 'R03', 'available', 'Regular Parking'),
          (1, 'R04', 'available', 'Regular Parking'),
          (1, 'R05', 'available', 'Regular Parking'),
          (2, 'R06', 'available', 'Regular Parking'),
          (2, 'R07', 'available', 'Regular Parking'),
          (3, 'R08', 'available', 'Regular Parking')
      `,
          (err, result) => {
            if (err) {
              console.error("Error adding spots:", err);
            } else {
              console.log(
                `✅ Added ${result.affectedRows} Regular Parking spots`
              );
            }
            continueSetup();
          }
        );
      } else {
        // Just make sure they're available
        db.query(
          `
        UPDATE parking_spots 
        SET status = 'available' 
        WHERE zone_type = 'Regular Parking'
          AND id NOT IN (
            SELECT DISTINCT spot_id 
            FROM reservations 
            WHERE status IN ('active', 'pending')
              AND spot_id IS NOT NULL
          )
      `,
          (err, result) => {
            if (err) {
              console.error("Error:", err);
            } else {
              console.log(
                `✅ Set ${result.affectedRows} Regular Parking spots to available`
              );
            }
            continueSetup();
          }
        );
      }
    }
  );

  function continueSetup() {
    // 2. Check if user Arga has a vehicle
    db.query(
      `
      SELECT * FROM vehicles WHERE user_id = 4
    `,
      (err, vehicles) => {
        if (err) {
          console.error("Error:", err);
          db.end();
          return;
        }

        console.log(`\n📋 User Arga's vehicles: ${vehicles.length}`);

        if (vehicles.length === 0) {
          console.log("➕ Adding vehicle for user Arga...");

          db.query(
            `
          INSERT INTO vehicles (user_id, license_plate, vehicle_type, brand, model, color, vehicle_name, is_default)
          VALUES (4, 'B 1234 XYZ', 'Sedan', 'Toyota', 'Camry', 'Silver', 'My Car', 1)
        `,
            (err, result) => {
              if (err) {
                console.error("Error adding vehicle:", err);
              } else {
                console.log(
                  `✅ Added vehicle for user Arga (ID: ${result.insertId})`
                );
              }
              showFinalStatus();
            }
          );
        } else {
          console.log("✅ User Arga already has vehicle(s)");
          console.table(vehicles);
          showFinalStatus();
        }
      }
    );
  }

  function showFinalStatus() {
    // Show final state
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
          console.log("\n📊 FINAL PARKING SPOTS STATUS:");
          console.table(results);
        }

        // Show available spots
        db.query(
          `
        SELECT 
          id, location_id, spot_number, zone_type, status
        FROM parking_spots
        WHERE zone_type = 'Regular Parking'
        ORDER BY id
        LIMIT 5
      `,
          (err, results) => {
            if (err) {
              console.error("Error:", err);
            } else {
              console.log("\n✅ SAMPLE REGULAR PARKING SPOTS:");
              console.table(results);
            }

            db.end();
            console.log("\n🎉 Setup complete! Ready to test.");
            console.log("\n📝 Next steps:");
            console.log("1. Start server: node app.js");
            console.log(
              "2. Open: http://localhost:5000/test-payment-flow.html"
            );
            console.log("3. Login: arga@gmail.com / Arga1234");
            console.log("4. Create reservation (will use Regular Parking)");
            console.log("5. Process payment");
          }
        );
      }
    );
  }
});
