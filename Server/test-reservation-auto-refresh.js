const mysql = require("mysql");
const jwt = require("jsonwebtoken");

// Database connection
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

  // First, get a test user
  const userQuery = `SELECT id FROM users LIMIT 1`;

  db.query(userQuery, (err, users) => {
    if (err || users.length === 0) {
      console.error("❌ No test user found. Please create a user first.");
      db.end();
      process.exit(1);
    }

    const userId = users[0].id;
    console.log(`👤 Using test user ID: ${userId}\n`);

    // Get JWT token
    const token = jwt.sign(
      { userId: userId, username: "testuser" },
      process.env.JWT_SECRET || "your-secret-key",
      { expiresIn: "24h" }
    );

    console.log("🔐 Generated JWT token for API testing\n");

    // Get test location, vehicle, and available spot
    const testDataQuery = `
      SELECT 
        pl.id as location_id,
        v.id as vehicle_id,
        ps.id as spot_id,
        ps.zone_type
      FROM parking_locations pl
      CROSS JOIN vehicles v
      CROSS JOIN parking_spots ps
      WHERE v.user_id = ? AND ps.status = 'available'
      LIMIT 1
    `;

    db.query(testDataQuery, [userId], (err, testData) => {
      if (err || testData.length === 0) {
        console.error(
          "❌ Could not find test data (location, vehicle, or available spot)"
        );
        console.error("   Error:", err?.message);
        db.end();
        process.exit(1);
      }

      const { location_id, vehicle_id, spot_id, zone_type } = testData[0];

      console.log("📊 Test Data Found:");
      console.log(`  - Location ID: ${location_id}`);
      console.log(`  - Vehicle ID: ${vehicle_id}`);
      console.log(`  - Spot ID: ${spot_id}`);
      console.log(`  - Zone Type: ${zone_type}\n`);

      // Format datetime for MySQL
      const formatDateTimeForMySQL = (date) => {
        const d = new Date(date);
        const year = d.getFullYear();
        const month = String(d.getMonth() + 1).padStart(2, "0");
        const day = String(d.getDate()).padStart(2, "0");
        const hours = String(d.getHours()).padStart(2, "0");
        const minutes = String(d.getMinutes()).padStart(2, "0");
        const seconds = String(d.getSeconds()).padStart(2, "0");
        return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
      };

      const startTime = new Date();
      const endTime = new Date(Date.now() + 2 * 60 * 60 * 1000); // 2 hours

      console.log("📝 Creating test reservation...");
      console.log(`  - Start Time: ${formatDateTimeForMySQL(startTime)}`);
      console.log(`  - End Time: ${formatDateTimeForMySQL(endTime)}\n`);

      // Insert reservation directly via API simulation
      const reservationData = {
        locationId: location_id,
        spotId: spot_id,
        vehicleId: vehicle_id,
        startTime: formatDateTimeForMySQL(startTime),
        endTime: formatDateTimeForMySQL(endTime),
        totalPrice: 50000,
        duration: 2,
        zone: 0,
        zone_type: zone_type,
        paymentToken: `PAY-${Date.now()}-TEST`,
        payment_method: "ewallet",
      };

      console.log(
        "📤 Reservation Data:",
        JSON.stringify(reservationData, null, 2)
      );
      console.log("\n📋 Next Steps:");
      console.log(
        "1. Use this token to make API call to POST http://localhost:5000/api/reservations"
      );
      console.log(`   Header: Authorization: Bearer ${token}`);
      console.log(`   Body: ${JSON.stringify(reservationData)}`);
      console.log(
        "\n2. After reservation created, check ReservationTab in frontend"
      );
      console.log("3. Verify localStorage event is triggered");
      console.log("4. Check database for payment record auto-creation\n");

      // Alternative: Make the API call directly if server is running
      console.log("🔄 Making actual API call...\n");

      const http = require("http");
      const options = {
        hostname: "localhost",
        port: 5000,
        path: "/api/reservations",
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      };

      const req = http.request(options, (res) => {
        let data = "";

        res.on("data", (chunk) => {
          data += chunk;
        });

        res.on("end", () => {
          console.log("📥 API Response Status:", res.statusCode);
          if (res.statusCode === 201 || res.statusCode === 200) {
            const result = JSON.parse(data);
            console.log("✅ Reservation created successfully!");
            console.log("📋 Reservation ID:", result.reservation?.id);
            console.log("💰 Amount:", result.reservation?.total_amount);
            console.log("\n🎯 Now:");
            console.log("1. Open browser DevTools console (F12)");
            console.log(
              "2. Navigate to Book tab in mobile app and see if reservation appears"
            );
            console.log(
              "3. Check browser console for: '🔔 New reservation detected! Auto-refreshing...'"
            );
          } else {
            console.error("❌ Failed to create reservation");
            console.log("Response:", data);
          }
          db.end();
        });
      });

      req.on("error", (error) => {
        console.error("❌ API Call Error:", error.message);
        console.log("   Make sure server is running on port 5000");
        db.end();
      });

      req.write(JSON.stringify(reservationData));
      req.end();
    });
  });
});
