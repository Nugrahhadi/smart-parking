const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const { authenticateToken, authorizeRole } = require("../../middleware/auth");
const db = require("../../config/database");

/**
 * GET /api/admin/users
 * Fetch all users with pagination and filtering
 */
router.get("/", authenticateToken, authorizeRole("admin"), async (req, res) => {
  try {
    const { page = 1, limit = 10, role, search } = req.query;
    const offset = (page - 1) * limit;

    console.log("👥 Fetching users...", { page, limit, role, search });

    let usersQuery = `
      SELECT 
        id,
        username,
        email,
        full_name,
        phone_number,
        role,
        created_at,
        updated_at
      FROM users
      WHERE 1=1
    `;

    const params = [];

    // Add role filter
    if (role) {
      usersQuery += ` AND role = ?`;
      params.push(role);
    }

    // Add search filter
    if (search) {
      usersQuery += ` AND (email LIKE ? OR full_name LIKE ? OR phone_number LIKE ?)`;
      params.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }

    usersQuery += ` ORDER BY created_at DESC LIMIT ? OFFSET ?`;
    params.push(parseInt(limit), offset);

    const [usersRes, countRes] = await Promise.all([
      db.query(usersQuery, params),
      db.query("SELECT COUNT(*) as total FROM users WHERE 1=1" + (role ? " AND role = ?" : "") + (search ? " AND (email LIKE ? OR full_name LIKE ? OR phone_number LIKE ?)" : ""), 
        role ? [role, ...(search ? [`%${search}%`, `%${search}%`, `%${search}%`] : [])] : (search ? [`%${search}%`, `%${search}%`, `%${search}%`] : [])
      ),
    ]);

    if (!usersRes.success || !countRes.success) {
      throw new Error("Failed to fetch users");
    }

    const total = countRes.data[0]?.total || 0;
    const totalPages = Math.ceil(total / limit);

    console.log("✅ Fetched", usersRes.data.length, "users");
    res.json({
      success: true,
      data: usersRes.data,
      pagination: {
        current_page: parseInt(page),
        per_page: parseInt(limit),
        total_pages: totalPages,
        total: total,
      },
    });
  } catch (error) {
    console.error("❌ Error:", error);
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * GET /api/admin/users/:id
 * Fetch single user details
 */
router.get("/:id", authenticateToken, authorizeRole("admin"), async (req, res) => {
  try {
    const { id } = req.params;
    console.log(`👥 Fetching user ${id}...`);

    const userQuery = `
      SELECT 
        id,
        username,
        email,
        full_name,
        phone_number,
        role,
        created_at,
        updated_at
      FROM users
      WHERE id = ?
    `;

    const userRes = await db.queryOne(userQuery, [id]);

    if (!userRes.success || !userRes.data) {
      return res.status(404).json({ success: false, error: "User not found" });
    }

    console.log("✅ User fetched successfully");
    res.json({
      success: true,
      data: userRes.data,
    });
  } catch (error) {
    console.error("❌ Error:", error);
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * POST /api/admin/users
 * Create new user (admin function)
 */
router.post("/", authenticateToken, authorizeRole("admin"), async (req, res) => {
  try {
    const { email, password, full_name, phone_number, role } = req.body;

    console.log("👥 Creating new user...", { email, full_name, role });

    // Validation
    if (!email || !password || !full_name) {
      return res
        .status(400)
        .json({ success: false, error: "Email, password, and full name are required" });
    }

    const validRoles = ["user", "staff", "admin"];
    if (!validRoles.includes(role)) {
      return res.status(400).json({ success: false, error: "Invalid role" });
    }

    // Hash password
    const hashedPassword = bcrypt.hashSync(password, 10);

    const createQuery = `
      INSERT INTO users (email, password, username, full_name, phone_number, role, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, NOW(), NOW())
    `;

    const username = email.split("@")[0]; // Generate username from email

    const result = await db.query(
      createQuery,
      [email, hashedPassword, username, full_name, phone_number || null, role]
    );

    if (!result.success) {
      throw new Error("Failed to create user");
    }

    console.log("✅ User created with ID:", result.insertId);
    res.status(201).json({
      success: true,
      message: "User created successfully",
      data: { id: result.insertId },
    });
  } catch (error) {
    console.error("❌ Error:", error);
    if (error.message && error.message.includes("DUP_ENTRY")) {
      return res.status(400).json({ success: false, error: "Email already exists" });
    }
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * PUT /api/admin/users/:id
 * Update user information
 */
router.put("/:id", authenticateToken, authorizeRole("admin"), async (req, res) => {
  try {
    const { id } = req.params;
    const { email, full_name, phone_number, role, password } = req.body;

    console.log(`👥 Updating user ${id}...`);

    if (!email || !full_name) {
      return res
        .status(400)
        .json({ success: false, error: "Email and full name are required" });
    }

    const validRoles = ["user", "staff", "admin"];
    if (role && !validRoles.includes(role)) {
      return res.status(400).json({ success: false, error: "Invalid role" });
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

    const result = await db.query(updateQuery, params);

    if (!result.success) {
      throw new Error("Failed to update user");
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, error: "User not found" });
    }

    console.log("✅ User updated successfully");
    res.json({
      success: true,
      message: "User updated successfully",
    });
  } catch (error) {
    console.error("❌ Error:", error);
    if (error.message && error.message.includes("DUP_ENTRY")) {
      return res.status(400).json({ success: false, error: "Email already exists" });
    }
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * DELETE /api/admin/users/:id
 * Delete user
 */
router.delete("/:id", authenticateToken, authorizeRole("admin"), async (req, res) => {
  try {
    const { id } = req.params;
    console.log(`👥 Deleting user ${id}...`);

    // Check if user exists and is not admin
    const checkQuery = `SELECT role FROM users WHERE id = ?`;
    const checkRes = await db.queryOne(checkQuery, [id]);

    if (!checkRes.success || !checkRes.data) {
      return res.status(404).json({ success: false, error: "User not found" });
    }

    if (checkRes.data.role === "admin") {
      return res.status(400).json({ success: false, error: "Cannot delete admin users" });
    }

    const deleteQuery = `DELETE FROM users WHERE id = ? AND role != 'admin'`;
    const result = await db.query(deleteQuery, [id]);

    if (!result.success) {
      throw new Error("Failed to delete user");
    }

    if (result.affectedRows === 0) {
      return res
        .status(404)
        .json({ success: false, error: "User not found or cannot be deleted" });
    }

    console.log("✅ User deleted successfully");
    res.json({
      success: true,
      message: "User deleted successfully",
    });
  } catch (error) {
    console.error("❌ Error:", error);
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;
