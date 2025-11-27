/**
 * Test Reservation Flow
 * Tests: Auth verify → Create reservation → Check DB for spot_id
 */

const http = require("http");

// Test config
const BASE_URL = "http://localhost:5000/api";
const USER_ID = 4; // Using existing user Arga
const TOKEN =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjQsImVtYWlsIjoiYXJnYUBleGFtcGxlLmNvbSIsInJvbGUiOiJ1c2VyIiwiaWF0IjoxNzMwMTExMzk4LCJleHAiOjE3MzA3MTYxOTh9.abc123";

function makeRequest(method, path, body = null, token = null) {
  return new Promise((resolve, reject) => {
    const url = new URL(BASE_URL + path);
    const options = {
      hostname: url.hostname,
      port: url.port,
      path: url.pathname + url.search,
      method: method,
      headers: {
        "Content-Type": "application/json",
      },
    };

    if (token) {
      options.headers.Authorization = `Bearer ${token}`;
    }

    const req = http.request(options, (res) => {
      let data = "";

      res.on("data", (chunk) => {
        data += chunk;
      });

      res.on("end", () => {
        try {
          resolve({
            status: res.statusCode,
            headers: res.headers,
            body: data ? JSON.parse(data) : null,
          });
        } catch (e) {
          resolve({
            status: res.statusCode,
            headers: res.headers,
            body: data,
          });
        }
      });
    });

    req.on("error", reject);

    if (body) {
      req.write(JSON.stringify(body));
    }

    req.end();
  });
}

async function testFlow() {
  console.log("🧪 === RESERVATION FLOW TEST ===\n");

  try {
    // Test 1: Get a valid token
    console.log("📝 STEP 1: Login to get valid token");
    console.log("   Endpoint: POST /auth/login");
    const loginRes = await makeRequest("POST", "/auth/login", {
      email: "arga@example.com",
      password: "password123",
    });
    console.log("   Status:", loginRes.status);
    console.log("   Response:", loginRes.body);

    if (loginRes.status !== 200) {
      console.error("❌ Login failed!");
      return;
    }

    const validToken = loginRes.body.token;
    console.log("✅ Got token:", validToken.substring(0, 20) + "...\n");

    // Test 2: Verify token
    console.log("📝 STEP 2: Verify token");
    console.log("   Endpoint: GET /auth/verify");
    const verifyRes = await makeRequest(
      "GET",
      "/auth/verify",
      null,
      validToken
    );
    console.log("   Status:", verifyRes.status);
    console.log("   Response:", verifyRes.body);

    if (verifyRes.status !== 200) {
      console.error(
        "❌ Token verification failed! This is the issue causing the 500 error."
      );
      console.error("   Make sure auth.js is using correct column names!");
      return;
    }
    console.log("✅ Token verified!\n");

    // Test 3: Create a reservation
    console.log("📝 STEP 3: Create reservation");
    console.log("   Endpoint: POST /reservations");
    const reservationData = {
      locationId: 1,
      zone_type: "Entertainment District",
      vehicleId: 3,
      startTime: new Date(Date.now() + 3600000)
        .toISOString()
        .slice(0, 19)
        .replace("T", " "),
      endTime: new Date(Date.now() + 7200000)
        .toISOString()
        .slice(0, 19)
        .replace("T", " "),
      totalPrice: 5000,
      duration: 1,
      zone: "entertainment",
    };

    console.log("   Payload:", reservationData);
    const reservationRes = await makeRequest(
      "POST",
      "/reservations",
      reservationData,
      validToken
    );
    console.log("   Status:", reservationRes.status);
    console.log("   Response:", reservationRes.body);

    if (reservationRes.status !== 201 && reservationRes.status !== 200) {
      console.error("❌ Reservation creation failed!");
      if (reservationRes.body?.details) {
        console.error("   Details:", reservationRes.body.details);
      }
      return;
    }

    const reservationId = reservationRes.body.reservation?.id;
    console.log("✅ Reservation created:", reservationId, "\n");

    // Test 4: Check database directly
    console.log("📝 STEP 4: Verify spot_id was saved to DB");
    console.log("   Expected: spot_id should NOT be NULL");

    const mysql = require("mysql2");
    const db = mysql.createConnection({
      host: "localhost",
      user: "root",
      password: "",
      database: "parking_system",
    });

    db.query(
      "SELECT id, user_id, location_id, spot_id, vehicle_id, status FROM reservations WHERE id = ?",
      [reservationId],
      (err, results) => {
        if (err) {
          console.error("❌ DB Query error:", err);
          db.end();
          return;
        }

        if (results.length === 0) {
          console.error("❌ Reservation not found in DB!");
          db.end();
          return;
        }

        const reservation = results[0];
        console.log("   Database record:", reservation);

        if (reservation.spot_id === null) {
          console.error(
            "❌ PROBLEM: spot_id is NULL! The spot was not assigned during reservation."
          );
          console.error(
            "   Root cause: Availability check not returning spot.id correctly"
          );
        } else {
          console.log(
            "✅ SUCCESS: spot_id is assigned correctly:",
            reservation.spot_id
          );
        }

        db.end();
      }
    );
  } catch (error) {
    console.error("❌ Test error:", error);
  }
}

// Run test
testFlow();
