const mysql = require("mysql2/promise");
require("dotenv").config();

async function checkUsersTable() {
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
    const [columns] = await connection.query("DESCRIBE users");

    console.log("📊 USERS TABLE STRUCTURE:");
    console.log("=".repeat(80));
    console.table(columns);

    console.log("\n📋 Column Names:");
    columns.forEach((col) => {
      console.log(`  - ${col.Field} (${col.Type})`);
    });

    await connection.end();
  } catch (error) {
    console.error("❌ Error:", error.message);
    if (connection) await connection.end();
    process.exit(1);
  }
}

checkUsersTable();
