const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const { authenticateToken, authorizeRole } = require("../../middleware/auth");
const db = require("../../config/database");

/**
 * GET /api/admin/users
 * Fetch all users with pagination and filtering
 */
router.get("/", authenticateToken, authorizeRole("admin"), (req, res) => {
  try {
    const { page = 1, limit = 10, role, search } = req.query;
    const offset = (page - 1) * limit;

    console.log("👥 Fetching users...", { page, limit, role, search });

    let usersQuery = `
      SELECT 
        u.id,
        u.username,
        u.email,
        u.full_name,
        u.phone_number,
        u.role,
        u.created_at,
        u.updated_at,
        COUNT(DISTINCT v.id) as vehicles_count,
        COUNT(DISTINCT r.id) as reservations_count
      FROM users u
      LEFT JOIN vehicles v ON u.id = v.user_id
      LEFT JOIN reservations r ON u.id = r.user_id
      WHERE 1=1
    `;

    const params = [];

    // Add role filter
    if (role) {
      usersQuery += ` AND u.role = ?`;
      params.push(role);
    }

    // Add search filter
    if (search) {
      usersQuery += ` AND (u.email LIKE ? OR u.full_name LIKE ? OR u.phone_number LIKE ?)`;
      params.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }

    usersQuery += ` GROUP BY u.id
      ORDER BY u.created_at DESC
      LIMIT ? OFFSET ?`;

    params.push(parseInt(limit), offset);

    db.query(usersQuery, params, (err, results) => {
      if (err) {
        console.error("❌ Query error:", err);
        return res.status(500).json({ error: "Failed to fetch users" });
      }

      // Get total count
      let countQuery = `SELECT COUNT(*) as total FROM users WHERE 1=1`;
      let countParams = [];

      if (role) {
        countQuery += ` AND role = ?`;
        countParams.push(role);
      }

      if (search) {
        countQuery += ` AND (email LIKE ? OR full_name LIKE ? OR phone_number LIKE ?)`;
        countParams.push(`%${search}%`, `%${search}%`, `%${search}%`);
      }

      db.query(countQuery, countParams, (err, countResults) => {
        if (err) {
          console.error("❌ Count error:", err);
          return res.status(500).json({ error: "Failed to count users" });
        }

        const total = countResults[0].total;
        const totalPages = Math.ceil(total / limit);

        console.log("✅ Fetched", results.length, "users");
        res.json({
          success: true,
          data: results,
          pagination: {
            page: parseInt(page),
            limit: parseInt(limit),
            total,
            totalPages,
          },
        });
      });
    });
  } catch (error) {
    console.error("❌ Error:", error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/admin/users/:id
 * Fetch single user details
 */
router.get("/:id", authenticateToken, authorizeRole("admin"), (req, res) => {
  try {
    const { id } = req.params;
    console.log(`👥 Fetching user ${id}...`);

    const userQuery = `
      SELECT 
        u.*,
        COUNT(DISTINCT v.id) as vehicles_count,
        COUNT(DISTINCT r.id) as reservations_count
      FROM users u
      LEFT JOIN vehicles v ON u.id = v.user_id
      LEFT JOIN reservations r ON u.id = r.user_id
      WHERE u.id = ?
      GROUP BY u.id
    `;

    db.query(userQuery, [id], (err, results) => {
      if (err) {
        console.error("❌ Query error:", err);
        return res.status(500).json({ error: "Failed to fetch user" });
      }

      if (results.length === 0) {
        return res.status(404).json({ error: "User not found" });
      }

      // Remove password from response
      const user = results[0];
      delete user.password;

      console.log("✅ User fetched successfully");
      res.json({
        success: true,
        data: user,
      });
    });
  } catch (error) {
    console.error("❌ Error:", error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /api/admin/users
 * Create new user (admin function)
 */
router.post("/", authenticateToken, authorizeRole("admin"), (req, res) => {
  try {
    const { email, password, full_name, phone_number, role } = req.body;

    console.log("👥 Creating new user...", { email, full_name, role });

    // Validation
    if (!email || !password || !full_name) {
      return res
        .status(400)
        .json({ error: "Email, password, and full name are required" });
    }

    const validRoles = ["user", "staff", "admin"];
    if (!validRoles.includes(role)) {
      return res.status(400).json({ error: "Invalid role" });
    }

    // Hash password
    const hashedPassword = bcrypt.hashSync(password, 10);

    const createQuery = `
      INSERT INTO users (email, password, username, full_name, phone_number, role, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, NOW(), NOW())
    `;

    const username = email.split("@")[0]; // Generate username from email

    db.query(
      createQuery,
      [email, hashedPassword, username, full_name, phone_number || null, role],
      (err, result) => {
        if (err) {
          console.error("❌ Insert error:", err);
          if (err.code === "ER_DUP_ENTRY") {
            return res.status(400).json({ error: "Email already exists" });
          }
          return res.status(500).json({ error: "Failed to create user" });
        }

        console.log("✅ User created with ID:", result.insertId);
        res.status(201).json({
          success: true,
          message: "User created successfully",
          data: { id: result.insertId },
        });
      }
    );
  } catch (error) {
    console.error("❌ Error:", error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * PUT /api/admin/users/:id
 * Update user information
 */
router.put("/:id", authenticateToken, authorizeRole("admin"), (req, res) => {
  try {
    const { id } = req.params;
    const { email, full_name, phone_number, role, password } = req.body;

    console.log(`👥 Updating user ${id}...`);

    if (!email || !full_name) {
      return res
        .status(400)
        .json({ error: "Email and full name are required" });
    }

    const validRoles = ["user", "staff", "admin"];
    if (role && !validRoles.includes(role)) {
      return res.status(400).json({ error: "Invalid role" });
    }

    let updateQuery = `
      UPDATE users 
      SET email = ?, full_name = ?, phone_number = ?, role = ?, updated_at = NOW()
    `;
    const params = [email, full_name, phone_number || null, role || "user"];

    // Update password if provided
    if (password) {
      const hashedPassword = bcrypt.hashSync(password, 10);
      updateQuery = `
        UPDATE users 
        SET email = ?, full_name = ?, phone_number = ?, role = ?, password = ?, updated_at = NOW()
      `;
      params.splice(3, 0, hashedPassword); // Insert password before role
    }

    updateQuery += ` WHERE id = ?`;
    params.push(id);

    db.query(updateQuery, params, (err, result) => {
      if (err) {
        console.error("❌ Update error:", err);
        if (err.code === "ER_DUP_ENTRY") {
          return res.status(400).json({ error: "Email already exists" });
        }
        return res.status(500).json({ error: "Failed to update user" });
      }

      if (result.affectedRows === 0) {
        return res.status(404).json({ error: "User not found" });
      }

      console.log("✅ User updated successfully");
      res.json({
        success: true,
        message: "User updated successfully",
      });
    });
  } catch (error) {
    console.error("❌ Error:", error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * DELETE /api/admin/users/:id
 * Delete user
 */
router.delete("/:id", authenticateToken, authorizeRole("admin"), (req, res) => {
  try {
    const { id } = req.params;
    console.log(`👥 Deleting user ${id}...`);

    // Prevent deleting admin users
    const checkQuery = `SELECT role FROM users WHERE id = ?`;

    db.query(checkQuery, [id], (err, results) => {
      if (err) {
        console.error("❌ Check error:", err);
        return res.status(500).json({ error: "Failed to check user" });
      }

      if (results.length === 0) {
        return res.status(404).json({ error: "User not found" });
      }

      if (results[0].role === "admin") {
        return res.status(400).json({ error: "Cannot delete admin users" });
      }

      const deleteQuery = `DELETE FROM users WHERE id = ? AND role != 'admin'`;

      db.query(deleteQuery, [id], (err, result) => {
        if (err) {
          console.error("❌ Delete error:", err);
          return res.status(500).json({ error: "Failed to delete user" });
        }

        if (result.affectedRows === 0) {
          return res
            .status(404)
            .json({ error: "User not found or cannot be deleted" });
        }

        console.log("✅ User deleted successfully");
        res.json({
          success: true,
          message: "User deleted successfully",
        });
      });
    });
  } catch (error) {
    console.error("❌ Error:", error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
