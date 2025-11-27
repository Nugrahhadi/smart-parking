const mysql = require("mysql2/promise");
require("dotenv").config();

async function checkReservationsTable() {
  let connection;

  try {
    connection = await mysql.createConnection({
      host: process.env.DB_HOST || "localhost",
      user: process.env.DB_USER || "root",
      password: process.env.DB_PASSWORD || "",
      database: process.env.DB_NAME || "parking_system",
    });

    console.log("✅ Connected to database\n");

    // Check total reservations
    const [totalCount] = await connection.query(
      "SELECT COUNT(*) as total FROM reservations"
    );
    console.log("📊 Total Reservations:", totalCount[0].total);

    // Check by status
    const [byStatus] = await connection.query(
      "SELECT status, COUNT(*) as count FROM reservations GROUP BY status"
    );
    console.log("\n📊 By Status:");
    console.table(byStatus);

    // Check recent reservations with full details
    const [recent] = await connection.query(`
      SELECT 
        r.id,
        r.user_id,
        r.status,
        r.total_amount,
        DATE_FORMAT(r.start_time, '%Y-%m-%d %H:%i') as start_time,
        DATE_FORMAT(r.end_time, '%Y-%m-%d %H:%i') as end_time,
        DATE_FORMAT(r.created_at, '%Y-%m-%d %H:%i') as created_at,
        pl.name as location,
        ps.spot_number,
        ps.zone_type,
        v.license_plate,
        p.payment_status,
        p.transaction_id
      FROM reservations r
      LEFT JOIN parking_locations pl ON r.location_id = pl.id
      LEFT JOIN parking_spots ps ON r.spot_id = ps.id
      LEFT JOIN vehicles v ON r.vehicle_id = v.id
      LEFT JOIN payments p ON r.id = p.reservation_id
      ORDER BY r.created_at DESC
      LIMIT 10
    `);

    console.log("\n📋 Recent 10 Reservations:");
    console.table(recent);

    // Check payments
    const [paymentCount] = await connection.query(
      "SELECT COUNT(*) as total FROM payments"
    );
    console.log("\n💳 Total Payments:", paymentCount[0].total);

    await connection.end();
    process.exit(0);
  } catch (error) {
    console.error("❌ Error:", error.message);
    if (connection) await connection.end();
    process.exit(1);
  }
}

checkReservationsTable();
