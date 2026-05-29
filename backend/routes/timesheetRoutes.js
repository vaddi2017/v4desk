const express = require("express");
const pool = require("../db/db");

const router = express.Router();

router.post("/submit", async (req, res) => {
  try {
    const { employee_id, week_start, week_end, total_hours } = req.body;

    if (!employee_id || !week_start || !week_end || !total_hours) {
      return res.status(400).json({
        message: "Employee ID, week start, week end, and total hours are required",
      });
    }

    const existingTimesheet = await pool.query(
      `
      SELECT id
      FROM timesheets
      WHERE employee_id = $1
        AND week_start = $2
        AND week_end = $3
      `,
      [employee_id, week_start, week_end]
    );

    if (existingTimesheet.rows.length > 0) {
      return res.status(409).json({
        message: "Timesheet already submitted for this week",
      });
    }

    const result = await pool.query(
      `
      INSERT INTO timesheets
      (
        employee_id,
        week_start,
        week_end,
        total_hours,
        status
      )
      VALUES ($1, $2, $3, $4, 'submitted')
      RETURNING *
      `,
      [employee_id, week_start, week_end, total_hours]
    );

    res.json({
      message: "Timesheet submitted successfully",
      timesheet: result.rows[0],
    });
  } catch (error) {
    if (error.code === "23505") {
      return res.status(409).json({
        message: "Timesheet already submitted for this week",
      });
    }

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
      `
      SELECT *
      FROM timesheets
      WHERE employee_id = $1
      ORDER BY submitted_at DESC
      `,
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