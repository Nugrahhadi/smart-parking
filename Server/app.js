const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const mysql = require("mysql2");

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// CORS Configuration - Allow all origins for development
const corsOptions = {
  origin: "*", // Allow all origins
  credentials: true,
  optionsSuccessStatus: 200,
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
};

// Middleware
app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Database connection
const db = mysql.createConnection({
  host: process.env.DB_HOST || "localhost",
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "",
  database: process.env.DB_NAME || "parking_system",
});

// Test database connection
db.connect((err) => {
  if (err) {
    console.error("Database connection failed:", err.message);
    return;
  }
  console.log("Connected to MySQL database");
});

// Initialize database connection
const { testConnection } = require("./config/database");
testConnection();

// Routes
app.get("/", (req, res) => {
  res.json({ message: "Smart Parking System API is running!" });
});

// API Health Check
app.get("/api/health", (req, res) => {
  res.json({
    status: "OK",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

// Import routes
app.use("/api/auth", require("./routes/auth"));
app.use("/api/users", require("./routes/user")); // ✅ NEW: User profile routes
app.use("/api/parking", require("./routes/parking"));
app.use("/api/reservation", require("./routes/reservation"));
app.use("/api/reservations", require("./routes/reservation")); // ✅ Added plural alias
app.use("/api/vehicles", require("./routes/vehicles"));
app.use("/api/payments", require("./routes/payment")); // ✅ NEW: Payment routes

// ✅ Admin Routes
app.use("/api/admin/dashboard", require("./routes/admin/dashboard"));
app.use("/api/admin/locations", require("./routes/admin/locations"));
app.use("/api/admin/users", require("./routes/admin/users"));
app.use("/api/admin/transactions", require("./routes/admin/transactions"));

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: "Something went wrong!" });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ message: "Route not found" });
});

// Global error handlers to prevent server crash
process.on("uncaughtException", (error) => {
  console.error("❌ Uncaught Exception:", error);
  console.error("Stack:", error.stack);
  // Don't exit - keep server running
});

process.on("unhandledRejection", (reason, promise) => {
  console.error("❌ Unhandled Rejection at:", promise);
  console.error("Reason:", reason);
  // Don't exit - keep server running
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || "development"}`);
  console.log(`API URL: http://localhost:${PORT}`);
});

module.exports = app;
