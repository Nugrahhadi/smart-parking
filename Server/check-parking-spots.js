const mysql = require("mysql2/promise");
require("dotenv").config();

async function checkParkingSpotsTable() {
  let connection;

  try {
    connection = await mysql.createConnection({
      host: process.env.DB_HOST || "localhost",
      user: process.env.DB_USER || "root",
      password: process.env.DB_PASSWORD || "",
      database: process.env.DB_NAME || "parking_system",
    });

    console.log("✅ Connected to database\n");

    // Get table structure
    const [columns] = await connection.query("DESCRIBE parking_spots");

    console.log("📊 PARKING_SPOTS TABLE STRUCTURE:");
    console.log("=".repeat(80));
    console.table(columns);

    console.log("\n📋 Column Names:");
    columns.forEach((col) => {
      console.log(`  - ${col.Field} (${col.Type})`);
    });

    // Check sample data
    const [rows] = await connection.query(
      "SELECT COUNT(*) as total FROM parking_spots"
    );
    console.log("\n📈 Total Spots:", rows[0].total);

    if (rows[0].total > 0) {
      const [samples] = await connection.query(
        "SELECT * FROM parking_spots LIMIT 3"
      );
      console.log("\n📝 Sample Data:");
      console.table(samples);
    }

    await connection.end();
  } catch (error) {
    console.error("❌ Error:", error.message);
    if (connection) await connection.end();
    process.exit(1);
  }
}

checkParkingSpotsTable();
