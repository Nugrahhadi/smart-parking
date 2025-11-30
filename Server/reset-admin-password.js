const mysql = require("mysql2/promise");
const bcrypt = require("bcryptjs");

async function resetAdminPassword() {
  let connection;
  try {
    // Create connection
    connection = await mysql.createConnection({
      host: "localhost",
      user: "root",
      password: "1234",
      database: "parking_system",
    });

    // Generate hash for password 'admin123'
    const newPassword = "admin123";
    const hashedPassword = bcrypt.hashSync(newPassword, 10);

    console.log("🔐 Generating password hash...");
    console.log(`   Original password: ${newPassword}`);
    console.log(`   Hashed password: ${hashedPassword}`);
    console.log("");

    // Update admin password
    const query = "UPDATE users SET password = ? WHERE email = ?";
    const [result] = await connection.execute(query, [
      hashedPassword,
      "admin@parking.com",
    ]);

    console.log("✅ Password updated successfully!");
    console.log(`   Updated rows: ${result.affectedRows}`);
    console.log("");
    console.log("📧 Admin credentials:");
    console.log(`   Email: admin@parking.com`);
    console.log(`   Password: ${newPassword}`);
    console.log("");

    // Verify the update
    const [rows] = await connection.execute(
      "SELECT id, email, role FROM users WHERE email = ?",
      ["admin@parking.com"]
    );

    if (rows.length > 0) {
      console.log("✅ Admin user verified:");
      console.table(rows);
    }

    await connection.end();
  } catch (error) {
    console.error("❌ Error:", error.message);
    if (connection) await connection.end();
    process.exit(1);
  }
}

resetAdminPassword();
