const express = require("express");
const pool = require("../db/db");

const router = express.Router();

router.post("/submit", async (req, res) => {
  try {
    const { employee_id, week_start, week_end, total_hours } = req.body;

    const result = await pool.query(
      `INSERT INTO timesheets 
       (employee_id, week_start, week_end, total_hours, status)
       VALUES ($1, $2, $3, $4, 'submitted')
       RETURNING *`,
      [employee_id, week_start, week_end, total_hours]
    );

    res.json({
      message: "Timesheet submitted successfully",
      timesheet: result.rows[0],
    });
  } catch (error) {
    res.status(500).json({
      message: "Timesheet submission failed",
      error: error.message,
    });
  }
});

router.get("/:employee_id", async (req, res) => {
  try {
    const { employee_id } = req.params;

    const result = await pool.query(
      "SELECT * FROM timesheets WHERE employee_id = $1 ORDER BY submitted_at DESC",
      [employee_id]
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

module.exports = router;