const mysql = require("mysql");

const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "1234",
  database: "parking_system",
});

db.connect((err) => {
  if (err) {
    console.error("Database error:", err);
    process.exit(1);
  }

  console.log("✅ Connected\n");

  // Check for reservations and their payment records
  const query = `
    SELECT 
      r.id,
      r.user_id,
      r.status,
      r.total_amount,
      p.id as payment_id,
      p.payment_status,
      p.payment_method
    FROM reservations r
    LEFT JOIN payments p ON r.id = p.reservation_id
    ORDER BY r.id DESC
    LIMIT 10
  `;

  db.query(query, (err, results) => {
    if (err) {
      console.error("Query error:", err);
      process.exit(1);
    }

    console.log("📋 Reservations and Their Payment Records:\n");
    results.forEach((row) => {
      const paymentStatus = row.payment_id
        ? `✅ Payment: ${row.payment_status} (${row.payment_method})`
        : "❌ NO PAYMENT RECORD";
      console.log(
        `Reservation ID ${row.id} (User ${row.user_id}): ${row.status}, Rp ${row.total_amount} - ${paymentStatus}`
      );
    });

    // Summary
    const withPayments = results.filter((r) => r.payment_id).length;
    const withoutPayments = results.filter((r) => !r.payment_id).length;

    console.log(
      `\n📊 Summary: ${withPayments} with payments, ${withoutPayments} without payments`
    );

    db.end();
  });
});
