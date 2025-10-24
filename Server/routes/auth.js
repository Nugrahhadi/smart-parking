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
  try {
    const { name, email, password, phone } = req.body;

    // Validation
    if (!name || !email || !password) {
      return res
        .status(400)
        .json({ message: "Name, email, and password are required" });
    }

    // Check if user already exists
    db.query(
      "SELECT * FROM users WHERE email = ?",
      [email],
      async (err, results) => {
        if (err) {
          console.error("Database error:", err);
          return res.status(500).json({ message: "Database error" });
        }

        if (results.length > 0) {
          return res
            .status(400)
            .json({ message: "User already exists with this email" });
        }

        try {
          // Hash password
          const saltRounds = 10;
          const hashedPassword = await bcrypt.hash(password, saltRounds);

          // Insert new user
          db.query(
            "INSERT INTO users (name, email, password, phone, role) VALUES (?, ?, ?, ?, ?)",
            [name, email, hashedPassword, phone || null, "user"],
            (err, result) => {
              if (err) {
                console.error("Database error:", err);
                return res.status(500).json({ message: "Error creating user" });
              }

              // Generate JWT token
              const token = jwt.sign(
                { userId: result.insertId, email, role: "user" },
                process.env.JWT_SECRET,
                { expiresIn: "7d" }
              );

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
            }
          );
        } catch (hashError) {
          console.error("Password hashing error:", hashError);
          return res.status(500).json({ message: "Error processing password" });
        }
      }
    );
  } catch (error) {
    console.error("Register error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Login endpoint
router.post("/login", (req, res) => {
  try {
    const { email, password } = req.body;

    // Validation
    if (!email || !password) {
      return res
        .status(400)
        .json({ message: "Email and password are required" });
    }

    // Find user by email
    db.query(
      "SELECT * FROM users WHERE email = ?",
      [email],
      async (err, results) => {
        if (err) {
          console.error("Database error:", err);
          return res.status(500).json({ message: "Database error" });
        }

        if (results.length === 0) {
          return res.status(401).json({ message: "Invalid email or password" });
        }

        const user = results[0];

        try {
          // Check password
          const isPasswordValid = await bcrypt.compare(password, user.password);

          if (!isPasswordValid) {
            return res
              .status(401)
              .json({ message: "Invalid email or password" });
          }

          // Generate JWT token
          const token = jwt.sign(
            { userId: user.id, email: user.email, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: "7d" }
          );

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
        } catch (bcryptError) {
          console.error("Password comparison error:", bcryptError);
          return res.status(500).json({ message: "Error verifying password" });
        }
      }
    );
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: "Internal server error" });
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
        "SELECT id, name, email, phone, role FROM users WHERE id = ?",
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
              id: user.id,
              name: user.name,
              email: user.email,
              phone: user.phone,
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
