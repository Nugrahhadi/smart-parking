const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const router = express.Router();

// Get database connection from app.js
const mysql = require("mysql2");
const db = mysql.createConnection({
  host: process.env.DB_HOST || "localhost",
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "",
  database: process.env.DB_NAME || "parking_system",
});

// Register endpoint
router.post("/register", async (req, res) => {
  console.log("📥 === REGISTER REQUEST RECEIVED ===");
  console.log("Request body:", req.body);
  console.log("Body type:", typeof req.body);
  console.log(
    "Is body object?",
    req.body !== null && typeof req.body === "object"
  );

  try {
    const { name, email, password, phone } = req.body;

    console.log("📋 Extracted fields:");
    console.log("  - name:", name);
    console.log("  - email:", email);
    console.log("  - password:", password ? "***" : undefined);
    console.log("  - phone:", phone);

    // Validation
    if (!name || !email || !password) {
      console.log("❌ Validation failed: Missing required fields");
      return res
        .status(400)
        .json({ message: "Name, email, and password are required" });
    }

    console.log("✅ Validation passed");
    console.log("🔍 Checking if user exists...");

    // Check if user already exists
    db.query(
      "SELECT * FROM users WHERE email = ?",
      [email],
      async (err, results) => {
        if (err) {
          console.error("❌ Database error during user check:", err);
          console.error("   SQL Message:", err.sqlMessage);
          console.error("   SQL State:", err.sqlState);
          console.error("   Error Code:", err.code);
          return res.status(500).json({
            message: "Database error",
            error: err.message,
            sqlMessage: err.sqlMessage,
          });
        }

        console.log("📊 User check result:", results.length, "users found");

        if (results.length > 0) {
          console.log("❌ User already exists with email:", email);
          return res
            .status(400)
            .json({ message: "User already exists with this email" });
        }

        console.log("✅ Email is available");

        try {
          console.log("🔐 Hashing password...");
          // Hash password
          const saltRounds = 10;
          const hashedPassword = await bcrypt.hash(password, saltRounds);
          console.log("✅ Password hashed successfully");

          console.log("💾 Inserting new user into database...");
          console.log("   Insert values:", {
            email,
            password: "***",
            name: name,
            phone: phone || null,
            role: "user",
          });

          // Insert new user - matching ACTUAL database schema
          // Database has: id, name, email, password, phone, role, created_at, updated_at
          db.query(
            "INSERT INTO users (email, password, name, phone, role) VALUES (?, ?, ?, ?, ?)",
            [email, hashedPassword, name, phone || null, "user"],
            (err, result) => {
              if (err) {
                console.error("❌ === DATABASE INSERT ERROR ===");
                console.error("Error object:", err);
                console.error("SQL Message:", err.sqlMessage);
                console.error("SQL State:", err.sqlState);
                console.error("Error Code:", err.code);
                console.error("Error Number:", err.errno);
                console.error("Field Count:", err.fieldCount);
                return res.status(500).json({
                  message: "Error creating user",
                  error: err.message,
                  sqlMessage: err.sqlMessage,
                  code: err.code,
                });
              }

              console.log("✅ User inserted successfully!");
              console.log("   User ID:", result.insertId);

              console.log("🔑 Generating JWT token...");
              // Generate JWT token
              const token = jwt.sign(
                { userId: result.insertId, email, role: "user" },
                process.env.JWT_SECRET,
                { expiresIn: "7d" }
              );
              console.log("✅ JWT token generated successfully");

              console.log("📤 Sending success response to client");
              res.status(201).json({
                message: "User registered successfully",
                token,
                user: {
                  id: result.insertId,
                  name,
                  email,
                  phone: phone || null,
                  role: "user",
                },
              });
              console.log("✅ === REGISTRATION COMPLETED SUCCESSFULLY ===\n");
            }
          );
        } catch (hashError) {
          console.error("❌ === PASSWORD HASHING ERROR ===");
          console.error("Hash error object:", hashError);
          console.error("Stack trace:", hashError.stack);
          return res.status(500).json({
            message: "Error processing password",
            error: hashError.message,
          });
        }
      }
    );
  } catch (error) {
    console.error("❌ === OUTER CATCH - REGISTER ERROR ===");
    console.error("Error object:", error);
    console.error("Stack trace:", error.stack);
    res.status(500).json({
      message: "Internal server error",
      error: error.message,
    });
  }
});

// Login endpoint
router.post("/login", (req, res) => {
  console.log("🔐 === LOGIN REQUEST RECEIVED ===");
  console.log("Request body:", req.body);

  try {
    const { email, password } = req.body;

    console.log("📋 Extracted fields:");
    console.log("  - email:", email);
    console.log("  - password:", password ? "***" : undefined);

    // Validation
    if (!email || !password) {
      console.log("❌ Validation failed: Missing email or password");
      return res
        .status(400)
        .json({ message: "Email and password are required" });
    }

    console.log("✅ Validation passed");
    console.log("🔍 Searching for user in database...");

    // Find user by email - matching ACTUAL database schema
    // Database has: id, name, email, password, phone, role
    db.query(
      "SELECT id, email, password, name, phone, role FROM users WHERE email = ?",
      [email],
      async (err, results) => {
        if (err) {
          console.error("❌ Database query error:", err);
          console.error("   SQL Message:", err.sqlMessage);
          console.error("   Error Code:", err.code);
          return res.status(500).json({
            message: "Database error",
            error: err.message,
            sqlMessage: err.sqlMessage,
          });
        }

        console.log("📊 Query result:", results.length, "user(s) found");

        if (results.length === 0) {
          console.log("❌ No user found with email:", email);
          return res.status(401).json({ message: "Invalid email or password" });
        }

        const user = results[0];
        console.log("✅ User found:", {
          id: user.id,
          email: user.email,
          role: user.role,
        });

        try {
          console.log("🔐 Comparing password...");
          // Check password
          const isPasswordValid = await bcrypt.compare(password, user.password);

          if (!isPasswordValid) {
            console.log("❌ Password does not match");
            return res
              .status(401)
              .json({ message: "Invalid email or password" });
          }

          console.log("✅ Password verified successfully");
          console.log("🔑 Generating JWT token...");

          // Generate JWT token
          const token = jwt.sign(
            { userId: user.id, email: user.email, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: "7d" }
          );

          console.log("✅ JWT token generated successfully");
          console.log("📤 Sending success response to client");

          res.json({
            message: "Login successful",
            token,
            user: {
              id: user.id,
              name: user.name,
              email: user.email,
              phone: user.phone,
              role: user.role,
            },
          });

          console.log("✅ === LOGIN COMPLETED SUCCESSFULLY ===\n");
        } catch (bcryptError) {
          console.error("❌ === PASSWORD COMPARISON ERROR ===");
          console.error("Error object:", bcryptError);
          console.error("Stack trace:", bcryptError.stack);
          return res.status(500).json({
            message: "Error verifying password",
            error: bcryptError.message,
          });
        }
      }
    );
  } catch (error) {
    console.error("❌ === OUTER CATCH - LOGIN ERROR ===");
    console.error("Error object:", error);
    console.error("Stack trace:", error.stack);
    res.status(500).json({
      message: "Internal server error",
      error: error.message,
    });
  }
});

// Verify token endpoint
router.get("/verify", (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ message: "No token provided" });
    }

    const token = authHeader.substring(7);

    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
      if (err) {
        return res.status(401).json({ message: "Invalid token" });
      }

      // Get fresh user data from database
      db.query(
        "SELECT user_id, username, email, full_name, phone_number, role FROM users WHERE user_id = ?",
        [decoded.userId],
        (err, results) => {
          if (err) {
            console.error("Database error:", err);
            return res.status(500).json({ message: "Database error" });
          }

          if (results.length === 0) {
            return res.status(401).json({ message: "User not found" });
          }

          const user = results[0];
          res.json({
            message: "Token valid",
            user: {
              id: user.user_id,
              name: user.full_name,
              email: user.email,
              phone: user.phone_number,
              role: user.role,
            },
          });
        }
      );
    });
  } catch (error) {
    console.error("Verify token error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

module.exports = router;
