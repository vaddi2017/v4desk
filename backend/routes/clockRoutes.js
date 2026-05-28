const express = require("express");
const pool = require("../db/db");

const router = express.Router();

router.post("/clock-in", async (req, res) => {
  try {
    const { employee_id } = req.body;

    const activeRecord = await pool.query(
      "SELECT * FROM clock_records WHERE employee_id = $1 AND clock_out IS NULL ORDER BY clock_in DESC LIMIT 1",
      [employee_id]
    );

    if (activeRecord.rows.length > 0) {
      return res.status(400).json({
        message: "You are already clocked in. Please clock out first.",
      });
    }

    const result = await pool.query(
      "INSERT INTO clock_records (employee_id, clock_in) VALUES ($1, NOW()) RETURNING *",
      [employee_id]
    );

    res.json({
      message: "Clocked in successfully",
      record: result.rows[0],
    });
  } catch (error) {
    res.status(500).json({
      message: "Clock in failed",
      error: error.message,
    });
  }
});

router.post("/clock-out", async (req, res) => {
  try {
    const { employee_id } = req.body;

    const result = await pool.query(
      `UPDATE clock_records
       SET clock_out = NOW(),
           total_hours = EXTRACT(EPOCH FROM (NOW() - clock_in)) / 3600
       WHERE id = (
         SELECT id FROM clock_records
         WHERE employee_id = $1 AND clock_out IS NULL
         ORDER BY clock_in DESC
         LIMIT 1
       )
       RETURNING *`,
      [employee_id]
    );

    if (result.rows.length === 0) {
      return res.status(400).json({
        message: "No active clock-in record found. Please clock in first.",
      });
    }

    res.json({
      message: "Clocked out successfully",
      record: result.rows[0],
    });
  } catch (error) {
    res.status(500).json({
      message: "Clock out failed",
      error: error.message,
    });
  }
});

module.exports = router;