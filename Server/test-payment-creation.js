const http = require("http");
const jwt = require("jsonwebtoken");

// Generate test token
const testUserId = 2; // Using existing user
const token = jwt.sign(
  { userId: testUserId, username: "testuser" },
  "parking_system_secret_key_2024",
  { expiresIn: "24h" }
);

console.log("🔐 Generated JWT token\n");

// Test data
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
const endTime = new Date(Date.now() + 2 * 60 * 60 * 1000);

const reservationData = {
  locationId: 1,
  spotId: 1,
  vehicleId: 1,
  startTime: formatDateTimeForMySQL(startTime),
  endTime: formatDateTimeForMySQL(endTime),
  totalPrice: 50000,
  duration: 2,
  zone: 0,
  zone_type: "VIP Royal Zone",
  paymentToken: `PAY-${Date.now()}-TEST`,
  payment_method: "ewallet",
};

console.log("📤 Sending reservation request...");
console.log("   Payment Method:", reservationData.payment_method);
console.log("   Payment Token:", reservationData.paymentToken);
console.log("   Total Amount: Rp", reservationData.totalPrice, "\n");

const postData = JSON.stringify(reservationData);

const options = {
  hostname: "localhost",
  port: 5000,
  path: "/api/reservations",
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    "Content-Length": Buffer.byteLength(postData),
    Authorization: `Bearer ${token}`,
  },
};

const req = http.request(options, (res) => {
  let data = "";

  res.on("data", (chunk) => {
    data += chunk;
  });

  res.on("end", () => {
    console.log("📥 Response Status:", res.statusCode, "\n");

    if (res.statusCode === 201) {
      try {
        const result = JSON.parse(data);
        console.log("✅ RESERVATION CREATED SUCCESSFULLY!");
        console.log("   ID:", result.reservation?.id);
        console.log("   Status:", result.reservation?.status);
        console.log("   Amount: Rp", result.reservation?.totalAmount);
        console.log("\n🎯 Next Steps:");
        console.log("1. Check database for payment record");
        console.log(
          "2. Open browser and check if reservation shows in Book tab"
        );
        console.log("3. Check browser console for auto-refresh message");
      } catch (e) {
        console.error("Error parsing response:", e);
        console.log("Raw response:", data);
      }
    } else {
      console.error("❌ Request failed with status:", res.statusCode);
      console.log("Response body:", data);
    }
    process.exit(0);
  });

  res.on("error", (error) => {
    console.error("❌ Response Error:", error.message);
    process.exit(1);
  });
});

req.on("error", (error) => {
  console.error("❌ Request Connection Error:", error.message);
  console.error("   Code:", error.code);
  console.error("   errno:", error.errno);
  console.error("\n   Make sure server is listening on http://localhost:5000");
  process.exit(1);
});

req.write(postData);
req.end();
