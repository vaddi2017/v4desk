const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const pool = require("../db/db");

const router = express.Router();

router.post("/register-employee", async (req, res) => {
  try {
    const { employee_id, full_name, email, password } = req.body;

    const hashedPassword = await bcrypt.hash(password, 10);

    const result = await pool.query(
      "INSERT INTO employees (employee_id, full_name, email, password, status) VALUES ($1, $2, $3, $4, 'active') RETURNING id, employee_id, full_name, email, status",
      [employee_id, full_name, email, hashedPassword]
    );

    res.json({
      message: "Employee registered successfully",
      employee: result.rows[0],
    });
  } catch (error) {
    res.status(500).json({
      message: "Employee registration failed",
      error: error.message,
    });
  }
});

router.post("/employee-login", async (req, res) => {
  try {
    const { employee_id, password } = req.body;

    const result = await pool.query(
      "SELECT * FROM employees WHERE employee_id = $1",
      [employee_id]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({
        message: "Invalid employee ID or password",
      });
    }

    const employee = result.rows[0];

    if (employee.status === "inactive") {
      return res.status(403).json({
        message: "Your employee account is inactive. Please contact admin.",
      });
    }

    const isMatch = await bcrypt.compare(password, employee.password);

    if (!isMatch) {
      return res.status(401).json({
        message: "Invalid employee ID or password",
      });
    }

    const token = jwt.sign(
      {
        id: employee.id,
        employee_id: employee.employee_id,
        role: "employee",
      },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    res.json({
      message: "Employee login successful",
      token,
      userType: "employee",
      employee: {
        id: employee.id,
        employee_id: employee.employee_id,
        full_name: employee.full_name,
        email: employee.email,
        status: employee.status,
      },
    });
  } catch (error) {
    res.status(500).json({
      message: "Employee login failed",
      error: error.message,
    });
  }
});

router.post("/admin-login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const result = await pool.query("SELECT * FROM admins WHERE email = $1", [
      email,
    ]);

    if (result.rows.length === 0) {
      return res.status(401).json({
        message: "Invalid admin email or password",
      });
    }

    const admin = result.rows[0];

    if (password !== admin.password) {
      return res.status(401).json({
        message: "Invalid admin email or password",
      });
    }

    const token = jwt.sign(
      {
        id: admin.id,
        email: admin.email,
        role: "admin",
      },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    res.json({
      message: "Admin login successful",
      token,
      userType: "admin",
      admin: {
        id: admin.id,
        admin_name: admin.admin_name,
        email: admin.email,
      },
    });
  } catch (error) {
    res.status(500).json({
      message: "Admin login failed",
      error: error.message,
    });
  }
});

module.exports = router;