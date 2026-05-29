const express = require("express");
const bcrypt = require("bcryptjs");
const pool = require("../db/db");

const router = express.Router();

/*
====================================
DASHBOARD STATS
====================================
*/

router.get("/dashboard-stats", async (req, res) => {
  try {
    const totalEmployees = await pool.query("SELECT COUNT(*) FROM employees");

    const activeEmployees = await pool.query(
      "SELECT COUNT(*) FROM employees WHERE status = 'active'"
    );

    const inactiveEmployees = await pool.query(
      "SELECT COUNT(*) FROM employees WHERE status = 'inactive'"
    );

    const pendingTimesheets = await pool.query(
      "SELECT COUNT(*) FROM timesheets WHERE status = 'submitted'"
    );

    const approvedTimesheets = await pool.query(
      "SELECT COUNT(*) FROM timesheets WHERE status = 'approved'"
    );

    const rejectedTimesheets = await pool.query(
      "SELECT COUNT(*) FROM timesheets WHERE status = 'rejected'"
    );

    res.json({
      totalEmployees: Number(totalEmployees.rows[0].count),
      activeEmployees: Number(activeEmployees.rows[0].count),
      inactiveEmployees: Number(inactiveEmployees.rows[0].count),
      pendingTimesheets: Number(pendingTimesheets.rows[0].count),
      approvedTimesheets: Number(approvedTimesheets.rows[0].count),
      rejectedTimesheets: Number(rejectedTimesheets.rows[0].count),
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to load dashboard stats",
      error: error.message,
    });
  }
});

/*
====================================
EMPLOYEES
====================================
*/

router.get("/employees", async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT id, employee_id, full_name, email, role, status, created_at FROM employees ORDER BY id DESC"
    );

    res.json({
      employees: result.rows,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch employees",
      error: error.message,
    });
  }
});

router.put("/employees/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { full_name, email } = req.body;

    if (!full_name || !email) {
      return res.status(400).json({
        message: "Full name and email are required",
      });
    }

    const result = await pool.query(
      `
      UPDATE employees
      SET full_name = $1,
          email = $2
      WHERE id = $3
      RETURNING id, employee_id, full_name, email, role, status
      `,
      [full_name, email, id]
    );

    res.json({
      message: "Employee updated successfully",
      employee: result.rows[0],
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to update employee",
      error: error.message,
    });
  }
});

router.put("/employees/:id/deactivate", async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      `
      UPDATE employees
      SET status = 'inactive'
      WHERE id = $1
      RETURNING id, employee_id, full_name, email, role, status
      `,
      [id]
    );

    res.json({
      message: "Employee deactivated successfully",
      employee: result.rows[0],
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to deactivate employee",
      error: error.message,
    });
  }
});

router.put("/employees/:id/reactivate", async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      `
      UPDATE employees
      SET status = 'active'
      WHERE id = $1
      RETURNING id, employee_id, full_name, email, role, status
      `,
      [id]
    );

    res.json({
      message: "Employee reactivated successfully",
      employee: result.rows[0],
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to reactivate employee",
      error: error.message,
    });
  }
});

router.put("/employees/:id/reset-password", async (req, res) => {
  try {
    const { id } = req.params;
    const { newPassword } = req.body;

    if (!newPassword || newPassword.length < 6) {
      return res.status(400).json({
        message: "Password must be at least 6 characters",
      });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    const result = await pool.query(
      `
      UPDATE employees
      SET password = $1
      WHERE id = $2
      RETURNING id, employee_id, full_name, email, role, status
      `,
      [hashedPassword, id]
    );

    res.json({
      message: "Employee password reset successfully",
      employee: result.rows[0],
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to reset employee password",
      error: error.message,
    });
  }
});

/*
====================================
CLOCK RECORDS
====================================
*/

router.get("/clock-records", async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT * FROM clock_records ORDER BY created_at DESC"
    );

    res.json({
      records: result.rows,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch clock records",
      error: error.message,
    });
  }
});

/*
====================================
TIMESHEETS
====================================
*/

router.get("/timesheets", async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT * FROM timesheets ORDER BY submitted_at DESC"
    );

    res.json({
      timesheets: result.rows,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch timesheets",
      error: error.message,
    });
  }
});

router.put("/timesheets/:id/approve", async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      `
      UPDATE timesheets
      SET status = 'approved'
      WHERE id = $1
      RETURNING *
      `,
      [id]
    );

    res.json({
      message: "Timesheet approved successfully",
      timesheet: result.rows[0],
    });
  } catch (error) {
    res.status(500).json({
      message: "Approval failed",
      error: error.message,
    });
  }
});

router.put("/timesheets/:id/reject", async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      `
      UPDATE timesheets
      SET status = 'rejected'
      WHERE id = $1
      RETURNING *
      `,
      [id]
    );

    res.json({
      message: "Timesheet rejected successfully",
      timesheet: result.rows[0],
    });
  } catch (error) {
    res.status(500).json({
      message: "Rejection failed",
      error: error.message,
    });
  }
});

/*
====================================
TEST ROUTE
====================================
*/

router.get("/test", (req, res) => {
  res.json({
    message: "Admin route is connected",
  });
});

module.exports = router;