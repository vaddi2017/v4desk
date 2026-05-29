# V4Desk – Employee Time Tracking & Workforce Management Platform

## Overview

V4Desk is a full-stack workforce management application designed to streamline employee attendance tracking, timesheet management, and administrative operations. The platform provides secure authentication, employee lifecycle management, automated work-hour calculations, timesheet approvals, and reporting capabilities.

The system is built with a modern web architecture using React, Node.js, Express.js, PostgreSQL, Supabase, Render, and Vercel.

---

## Features

### Authentication & Security

* Employee Login
* Admin Login
* JWT-based Authentication
* Role-Based Access Control
* Password Reset Functionality

### Employee Management

* Create Employee Accounts
* Edit Employee Information
* Activate Employees
* Deactivate Employees
* Employee Status Tracking

### Attendance Tracking

* Clock In
* Clock Out
* Work Session Tracking
* Automatic Work Hour Calculation

### Timesheet Management

* Weekly Timesheet Submission
* Duplicate Timesheet Prevention
* Automatic Hour Calculation from Clock Records
* Timesheet History Tracking

### Admin Operations

* Approve Timesheets
* Reject Timesheets
* Admin Comments
* Dashboard Statistics
* Employee Monitoring

### Reporting & Exports

* Employee CSV Export
* Timesheet CSV Export
* Clock Records CSV Export

### Dashboard Analytics

* Total Employees
* Active Employees
* Inactive Employees
* Pending Timesheets
* Approved Timesheets
* Rejected Timesheets

---

## Technology Stack

### Frontend

* React.js
* JavaScript
* Tailwind CSS
* Vite

### Backend

* Node.js
* Express.js
* JWT Authentication
* bcryptjs

### Database

* PostgreSQL
* Supabase

### Deployment

* Vercel (Frontend)
* Render (Backend)

---

## System Architecture

```text
Frontend (React + Vercel)
            │
            ▼
Backend API (Node.js + Express + Render)
            │
            ▼
PostgreSQL Database (Supabase)
```

---

## Project Structure

```text
V4Desk
│
├── frontend
│   ├── src
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── components
│   │
│   └── package.json
│
├── backend
│   ├── routes
│   │   ├── authRoutes.js
│   │   ├── adminRoutes.js
│   │   ├── clockRoutes.js
│   │   └── timesheetRoutes.js
│   │
│   ├── db
│   │   └── db.js
│   │
│   ├── server.js
│   └── package.json
│
└── README.md
```

---

## Database Tables

### Employees

```sql
employees
```

| Column      | Description        |
| ----------- | ------------------ |
| id          | Primary Key        |
| employee_id | Employee Number    |
| full_name   | Employee Name      |
| email       | Employee Email     |
| password    | Encrypted Password |
| role        | employee/admin     |
| status      | active/inactive    |
| created_at  | Created Date       |

---

### Admins

```sql
admins
```

| Column     | Description        |
| ---------- | ------------------ |
| id         | Primary Key        |
| admin_name | Administrator Name |
| email      | Admin Email        |
| password   | Encrypted Password |

---

### Clock Records

```sql
clock_records
```

| Column      | Description  |
| ----------- | ------------ |
| id          | Primary Key  |
| employee_id | Employee ID  |
| clock_in    | Login Time   |
| clock_out   | Logout Time  |
| total_hours | Worked Hours |
| created_at  | Timestamp    |

---

### Timesheets

```sql
timesheets
```

| Column        | Description                 |
| ------------- | --------------------------- |
| id            | Primary Key                 |
| employee_id   | Employee ID                 |
| week_start    | Week Start Date             |
| week_end      | Week End Date               |
| total_hours   | Hours Worked                |
| status        | submitted/approved/rejected |
| admin_comment | Approval Comments           |
| submitted_at  | Submission Date             |

---

## API Endpoints

### Authentication

```http
POST /api/auth/employee-login
POST /api/auth/admin-login
POST /api/auth/register-employee
```

### Clock Tracking

```http
POST /api/clock/clock-in
POST /api/clock/clock-out
```

### Timesheets

```http
POST /api/timesheets/submit
POST /api/timesheets/calculate-hours
GET  /api/timesheets/:employee_id
```

### Employee Management

```http
GET  /api/admin/employees
PUT  /api/admin/employees/:id
PUT  /api/admin/employees/:id/deactivate
PUT  /api/admin/employees/:id/reactivate
PUT  /api/admin/employees/:id/reset-password
```

### Timesheet Administration

```http
GET  /api/admin/timesheets
PUT  /api/admin/timesheets/:id/approve
PUT  /api/admin/timesheets/:id/reject
```

### Dashboard

```http
GET /api/admin/dashboard-stats
```

### Clock Records

```http
GET /api/admin/clock-records
```

---

## Key Business Workflow

### Employee Workflow

```text
Employee Login
      ↓
Clock In
      ↓
Perform Work
      ↓
Clock Out
      ↓
Calculate Hours
      ↓
Submit Weekly Timesheet
      ↓
Await Approval
```

---

### Admin Workflow

```text
Admin Login
      ↓
View Dashboard
      ↓
Review Timesheets
      ↓
Approve / Reject
      ↓
Monitor Employees
      ↓
Export Reports
```

---

## Deployment

### Backend

Render Deployment

```text
https://v4desk-api.onrender.com
```

### Frontend

Vercel Deployment

```text
https://v4desk.vercel.app
```

---

## Future Enhancements

* Multi-Role Permissions
* Audit Logging
* Email Notifications
* Payroll Integration
* Project Assignment Tracking
* Advanced Reporting
* Mobile Application
* Employee Profile Management
* Document Management
* Notification Center

---

## Author

**Pavan Kishore Vaddi**


---

### Project Status

✅ Production Ready MVP

Version: **V4Desk v1.0**

Built using React, Node.js, Express.js, PostgreSQL, Supabase, Render, and Vercel. 🚀
