// Database connection configuration
const mysql = require("mysql2/promise");
require("dotenv").config();

// Create connection pool for better performance
const pool = mysql.createPool({
  host: process.env.DB_HOST || "localhost",
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "1234",
  database: process.env.DB_NAME || "parking_system",
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  enableKeepAlive: true,
  keepAliveInitialDelay: 0,
});

// Test connection
const testConnection = async () => {
  try {
    const connection = await pool.getConnection();
    console.log("✅ Database connected successfully");
    console.log(`📊 Database: ${process.env.DB_NAME}`);
    connection.release();
    return true;
  } catch (error) {
    console.error("❌ Database connection failed:", error.message);
    return false;
  }
};

// Execute query helper
const query = async (sql, params = []) => {
  try {
    const [results] = await pool.execute(sql, params);
    return { success: true, data: results };
  } catch (error) {
    console.error("❌ Query error:", error.message);
    return { success: false, error: error.message };
  }
};

// Get single row
const queryOne = async (sql, params = []) => {
  try {
    const [results] = await pool.execute(sql, params);
    return { success: true, data: results[0] || null };
  } catch (error) {
    console.error("❌ Query error:", error.message);
    return { success: false, error: error.message };
  }
};

// Transaction support
const transaction = async (callback) => {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();
    const result = await callback(connection);
    await connection.commit();
    connection.release();
    return { success: true, data: result };
  } catch (error) {
    await connection.rollback();
    connection.release();
    console.error("❌ Transaction error:", error.message);
    return { success: false, error: error.message };
  }
};

module.exports = {
  pool,
  query,
  queryOne,
  transaction,
  testConnection,
};
