const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const pool = require("./db/db");

const authRoutes = require("./routes/authRoutes");
const clockRoutes = require("./routes/clockRoutes");
const adminRoutes = require("./routes/adminRoutes");
const timesheetRoutes = require("./routes/timesheetRoutes");

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/clock", clockRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/timesheets", timesheetRoutes);
app.use("/api/auth", authRoutes);

app.get("/api/admin/test", (req, res) => {
  res.json({ message: "Admin route is connected" });
});

app.get("/api/admin/timesheets", async (req, res) => {
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

app.put("/api/admin/timesheets/:id/approve", async (req, res) => {
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

app.put("/api/admin/timesheets/:id/reject", async (req, res) => {
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

app.get("/", async (req, res) => {
  try {
    const result = await pool.query("SELECT NOW()");

    res.json({
      message: "V4Desk Backend Running",
      database: "Connected",
      time: result.rows[0],
    });
  } catch (error) {
    res.json({
      message: "Database connection failed",
      error: error.message,
    });
  }
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});