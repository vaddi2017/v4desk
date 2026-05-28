const express = require("express");
const pool = require("../db/db");

const router = express.Router();

router.get("/employees", async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT id, employee_id, full_name, email, role, created_at FROM employees ORDER BY id DESC"
    );

    res.json({ employees: result.rows });
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch employees",
      error: error.message,
    });
  }
});

router.get("/clock-records", async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT * FROM clock_records ORDER BY created_at DESC"
    );

    res.json({ records: result.rows });
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch clock records",
      error: error.message,
    });
  }
});

router.get("/timesheets", async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT * FROM timesheets ORDER BY submitted_at DESC"
    );

    res.json({ timesheets: result.rows });
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
      "UPDATE timesheets SET status = 'approved' WHERE id = $1 RETURNING *",
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
      "UPDATE timesheets SET status = 'rejected' WHERE id = $1 RETURNING *",
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

module.exports = router;