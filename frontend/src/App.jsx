import { useState } from "react";
const API_URL = "https://v4desk-api.onrender.com";
function App() {
  const [employeeId, setEmployeeId] = useState("EMP-1001");
  const [password, setPassword] = useState("Test1234");
  const [message, setMessage] = useState("");
  const [employee, setEmployee] = useState(null);

  const [employees, setEmployees] = useState([]);
  const [clockRecords, setClockRecords] = useState([]);
  const [timesheets, setTimesheets] = useState([]);

  const [weekStart, setWeekStart] = useState("2026-05-25");
  const [weekEnd, setWeekEnd] = useState("2026-05-31");
  const [totalHours, setTotalHours] = useState("40");

  const fetchEmployees = async () => {
    const res = await fetch(`${API_URL}/api/admin/employees`);
    const data = await res.json();
    setEmployees(data.employees || []);
  };

  const fetchClockRecords = async () => {
    const res = await fetch(`${API_URL}/api/admin/clock-records`);
    const data = await res.json();
    setClockRecords(data.records || []);
  };

  const fetchTimesheets = async () => {
    const res = await fetch(`${API_URL}/api/admin/timesheets`);
    const data = await res.json();
    setTimesheets(data.timesheets || []);
  };

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      const res = await fetch(`${API_URL}/api/auth/employee-login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ employee_id: employeeId, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setMessage(data.message || "Login failed");
        return;
      }

      localStorage.setItem("v4desk_token", data.token);
      setEmployee(data.employee);
      setMessage("Login successful");

      fetchEmployees();
      fetchClockRecords();
      fetchTimesheets();
    } catch {
      setMessage("Backend connection failed");
    }
  };

  const handleClockIn = async () => {
    const res = await fetch(`${API_URL}/api/clock/clock-in`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ employee_id: employee.employee_id }),
    });

    const data = await res.json();
    setMessage(data.message);
    fetchClockRecords();
  };

  const handleClockOut = async () => {
    const res = await fetch(`${API_URL}/api/clock/clock-out`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ employee_id: employee.employee_id }),
    });

    const data = await res.json();
    setMessage(data.message);
    fetchClockRecords();
  };

  const handleSubmitTimesheet = async () => {
    const res = await fetch(`${API_URL}/api/timesheets/submit`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        employee_id: employee.employee_id,
        week_start: weekStart,
        week_end: weekEnd,
        total_hours: totalHours,
      }),
    });

    const data = await res.json();
    setMessage(data.message);
    fetchTimesheets();
  };

  const handleApproveTimesheet = async (id) => {
    const res = await fetch(
      `${API_URL}/api/admin/timesheets/${id}/approve`,
      { method: "PUT" }
    );

    const data = await res.json();
    setMessage(data.message);
    fetchTimesheets();
  };

  const handleRejectTimesheet = async (id) => {
    const res = await fetch(
      `${API_URL}/api/admin/timesheets/${id}/reject`,
      { method: "PUT" }
    );

    const data = await res.json();
    setMessage(data.message);
    fetchTimesheets();
  };

  const handleLogout = () => {
    localStorage.removeItem("v4desk_token");
    setEmployee(null);
    setMessage("");
    setEmployees([]);
    setClockRecords([]);
    setTimesheets([]);
  };

  return (
    <div className="min-h-screen bg-slate-100 p-8">
      {!employee ? (
        <div className="mx-auto mt-20 w-full max-w-md rounded-3xl bg-white p-8 shadow-lg">
          <h1 className="text-4xl font-bold text-slate-900">V4Desk</h1>
          <p className="mt-2 text-slate-600">Employee Timesheet Platform</p>

          <form onSubmit={handleLogin} className="mt-8 space-y-5">
            <div>
              <label className="text-sm font-medium text-slate-700">
                Employee ID
              </label>
              <input
                className="mt-2 w-full rounded-xl border border-slate-300 p-3"
                value={employeeId}
                onChange={(e) => setEmployeeId(e.target.value)}
              />
            </div>

            <div>
              <label className="text-sm font-medium text-slate-700">
                Password
              </label>
              <input
                type="password"
                className="mt-2 w-full rounded-xl border border-slate-300 p-3"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            <button className="w-full rounded-xl bg-slate-900 p-3 font-semibold text-white">
              Login
            </button>
          </form>

          {message && (
            <div className="mt-5 rounded-2xl bg-slate-100 p-4 text-sm">
              {message}
            </div>
          )}
        </div>
      ) : (
        <div>
          <div className="rounded-3xl bg-white p-8 shadow-lg">
            <h1 className="text-4xl font-bold text-slate-900">
              Welcome {employee.full_name}
            </h1>
            <p className="mt-2 text-slate-600">
              Employee ID: {employee.employee_id}
            </p>
            <p className="text-slate-600">Email: {employee.email}</p>

            <div className="mt-8 flex flex-wrap gap-4">
              <button
                onClick={handleClockIn}
                className="rounded-2xl bg-green-600 px-6 py-3 font-semibold text-white"
              >
                Clock In
              </button>

              <button
                onClick={handleClockOut}
                className="rounded-2xl bg-red-600 px-6 py-3 font-semibold text-white"
              >
                Clock Out
              </button>

              <button
                onClick={handleLogout}
                className="rounded-2xl bg-slate-900 px-6 py-3 font-semibold text-white"
              >
                Logout
              </button>
            </div>

            {message && (
              <div className="mt-6 rounded-2xl bg-slate-100 p-4 text-sm">
                {message}
              </div>
            )}
          </div>

          <div className="mt-10 rounded-3xl bg-white p-8 shadow-lg">
            <h2 className="text-3xl font-bold text-slate-900">
              Submit Weekly Timesheet
            </h2>

            <div className="mt-6 grid gap-4 md:grid-cols-3">
              <div>
                <label className="text-sm font-medium">Week Start</label>
                <input
                  type="date"
                  className="mt-2 w-full rounded-xl border border-slate-300 p-3"
                  value={weekStart}
                  onChange={(e) => setWeekStart(e.target.value)}
                />
              </div>

              <div>
                <label className="text-sm font-medium">Week End</label>
                <input
                  type="date"
                  className="mt-2 w-full rounded-xl border border-slate-300 p-3"
                  value={weekEnd}
                  onChange={(e) => setWeekEnd(e.target.value)}
                />
              </div>

              <div>
                <label className="text-sm font-medium">Total Hours</label>
                <input
                  type="number"
                  className="mt-2 w-full rounded-xl border border-slate-300 p-3"
                  value={totalHours}
                  onChange={(e) => setTotalHours(e.target.value)}
                />
              </div>
            </div>

            <button
              onClick={handleSubmitTimesheet}
              className="mt-6 rounded-2xl bg-blue-600 px-6 py-3 font-semibold text-white"
            >
              Submit Timesheet
            </button>
          </div>

          <div className="mt-10 rounded-3xl bg-white p-8 shadow-lg">
            <div className="flex items-center justify-between">
              <h2 className="text-3xl font-bold text-slate-900">
                Timesheet Management
              </h2>

              <button
                onClick={fetchTimesheets}
                className="rounded-xl bg-slate-900 px-5 py-2 text-white"
              >
                Refresh Timesheets
              </button>
            </div>

            <div className="mt-8 overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b bg-slate-50">
                    <th className="p-4 text-left">Employee ID</th>
                    <th className="p-4 text-left">Week Start</th>
                    <th className="p-4 text-left">Week End</th>
                    <th className="p-4 text-left">Hours</th>
                    <th className="p-4 text-left">Status</th>
                    <th className="p-4 text-left">Actions</th>
                  </tr>
                </thead>

                <tbody>
                  {timesheets.map((sheet) => (
                    <tr key={sheet.id} className="border-b">
                      <td className="p-4">{sheet.employee_id}</td>
                      <td className="p-4">
                        {new Date(sheet.week_start).toLocaleDateString()}
                      </td>
                      <td className="p-4">
                        {new Date(sheet.week_end).toLocaleDateString()}
                      </td>
                      <td className="p-4">{sheet.total_hours}</td>
                      <td className="p-4">
                        <span
                          className={`rounded-xl px-3 py-1 text-white ${
                            sheet.status === "approved"
                              ? "bg-green-600"
                              : sheet.status === "rejected"
                              ? "bg-red-600"
                              : "bg-yellow-500"
                          }`}
                        >
                          {sheet.status}
                        </span>
                      </td>
                      <td className="p-4">
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleApproveTimesheet(sheet.id)}
                            className="rounded-xl bg-green-600 px-4 py-2 text-white"
                          >
                            Approve
                          </button>
                          <button
                            onClick={() => handleRejectTimesheet(sheet.id)}
                            className="rounded-xl bg-red-600 px-4 py-2 text-white"
                          >
                            Reject
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}

                  {timesheets.length === 0 && (
                    <tr>
                      <td colSpan="6" className="p-4 text-center text-slate-500">
                        No timesheets found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          <div className="mt-10 rounded-3xl bg-white p-8 shadow-lg">
            <div className="flex items-center justify-between">
              <h2 className="text-3xl font-bold text-slate-900">
                Employee Dashboard
              </h2>

              <button
                onClick={fetchEmployees}
                className="rounded-xl bg-slate-900 px-5 py-2 text-white"
              >
                Refresh
              </button>
            </div>

            <div className="mt-8 overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b bg-slate-50">
                    <th className="p-4 text-left">Employee ID</th>
                    <th className="p-4 text-left">Full Name</th>
                    <th className="p-4 text-left">Email</th>
                    <th className="p-4 text-left">Role</th>
                  </tr>
                </thead>

                <tbody>
                  {employees.map((emp) => (
                    <tr key={emp.id} className="border-b">
                      <td className="p-4">{emp.employee_id}</td>
                      <td className="p-4">{emp.full_name}</td>
                      <td className="p-4">{emp.email}</td>
                      <td className="p-4">{emp.role}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="mt-10 rounded-3xl bg-white p-8 shadow-lg">
            <div className="flex items-center justify-between">
              <h2 className="text-3xl font-bold text-slate-900">
                Clock Records
              </h2>

              <button
                onClick={fetchClockRecords}
                className="rounded-xl bg-slate-900 px-5 py-2 text-white"
              >
                Refresh Records
              </button>
            </div>

            <div className="mt-8 overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b bg-slate-50">
                    <th className="p-4 text-left">Employee ID</th>
                    <th className="p-4 text-left">Clock In</th>
                    <th className="p-4 text-left">Clock Out</th>
                    <th className="p-4 text-left">Total Hours</th>
                  </tr>
                </thead>

                <tbody>
                  {clockRecords.map((record) => (
                    <tr key={record.id} className="border-b">
                      <td className="p-4">{record.employee_id}</td>
                      <td className="p-4">
                        {record.clock_in
                          ? new Date(record.clock_in).toLocaleString()
                          : "-"}
                      </td>
                      <td className="p-4">
                        {record.clock_out
                          ? new Date(record.clock_out).toLocaleString()
                          : "Still Clocked In"}
                      </td>
                      <td className="p-4">
                        {record.total_hours
                          ? Number(record.total_hours).toFixed(2)
                          : "-"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;