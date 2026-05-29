import { useState } from "react";

const API_URL = "https://v4desk-api.onrender.com";

function App() {
  const [loginType, setLoginType] = useState("employee");

  const [employeeId, setEmployeeId] = useState("EMP-1001");
  const [password, setPassword] = useState("Test1234");
  const [employee, setEmployee] = useState(null);

  const [adminEmail, setAdminEmail] = useState("admin@v4desk.com");
  const [adminPassword, setAdminPassword] = useState("Admin1234");
  const [admin, setAdmin] = useState(null);

  const [message, setMessage] = useState("");

  const [employees, setEmployees] = useState([]);
  const [clockRecords, setClockRecords] = useState([]);
  const [timesheets, setTimesheets] = useState([]);
  const [dashboardStats, setDashboardStats] = useState({
    totalEmployees: 0,
    activeEmployees: 0,
    inactiveEmployees: 0,
    pendingTimesheets: 0,
    approvedTimesheets: 0,
    rejectedTimesheets: 0,
  });

  const [weekStart, setWeekStart] = useState("2026-05-25");
  const [weekEnd, setWeekEnd] = useState("2026-05-31");
  const [totalHours, setTotalHours] = useState("40");

  const [newEmployeeId, setNewEmployeeId] = useState("EMP-1003");
  const [newFullName, setNewFullName] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [newPassword, setNewPassword] = useState("Test1234");
  const [resetPasswords, setResetPasswords] = useState({});

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

  const fetchDashboardStats = async () => {
    const res = await fetch(`${API_URL}/api/admin/dashboard-stats`);
    const data = await res.json();
    setDashboardStats(data);
  };

  const loadAdminData = () => {
    fetchDashboardStats();
    fetchEmployees();
    fetchClockRecords();
    fetchTimesheets();
  };

  const handleEmployeeLogin = async (e) => {
    e.preventDefault();

    try {
      const res = await fetch(`${API_URL}/api/auth/employee-login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ employee_id: employeeId, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setMessage(data.message || "Employee login failed");
        return;
      }

      localStorage.setItem("v4desk_token", data.token);
      setEmployee(data.employee);
      setAdmin(null);
      setMessage("Employee login successful");

      fetchClockRecords();
      fetchTimesheets();
    } catch {
      setMessage("Backend connection failed");
    }
  };

  const handleAdminLogin = async (e) => {
    e.preventDefault();

    try {
      const res = await fetch(`${API_URL}/api/auth/admin-login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: adminEmail, password: adminPassword }),
      });

      const data = await res.json();

      if (!res.ok) {
        setMessage(data.message || "Admin login failed");
        return;
      }

      localStorage.setItem("v4desk_token", data.token);
      setAdmin(data.admin);
      setEmployee(null);
      setMessage("Admin login successful");

      loadAdminData();
    } catch {
      setMessage("Backend connection failed");
    }
  };

  const handleCreateEmployee = async () => {
    const res = await fetch(`${API_URL}/api/auth/register-employee`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        employee_id: newEmployeeId,
        full_name: newFullName,
        email: newEmail,
        password: newPassword,
      }),
    });

    const data = await res.json();
    setMessage(data.message);

    if (res.ok) {
      setNewEmployeeId("");
      setNewFullName("");
      setNewEmail("");
      setNewPassword("Test1234");
      fetchEmployees();
      fetchDashboardStats();
    }
  };

  const handleDeactivateEmployee = async (id) => {
    const res = await fetch(`${API_URL}/api/admin/employees/${id}/deactivate`, {
      method: "PUT",
    });

    const data = await res.json();
    setMessage(data.message);
    fetchEmployees();
    fetchDashboardStats();
  };

  const handleReactivateEmployee = async (id) => {
    const res = await fetch(`${API_URL}/api/admin/employees/${id}/reactivate`, {
      method: "PUT",
    });

    const data = await res.json();
    setMessage(data.message);
    fetchEmployees();
    fetchDashboardStats();
  };

  const handleResetPassword = async (id) => {
    const newPass = resetPasswords[id];

    if (!newPass || newPass.length < 6) {
      setMessage("Password must be at least 6 characters");
      return;
    }

    const res = await fetch(`${API_URL}/api/admin/employees/${id}/reset-password`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ newPassword: newPass }),
    });

    const data = await res.json();
    setMessage(data.message);

    if (res.ok) {
      setResetPasswords({ ...resetPasswords, [id]: "" });
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
    const res = await fetch(`${API_URL}/api/admin/timesheets/${id}/approve`, {
      method: "PUT",
    });

    const data = await res.json();
    setMessage(data.message);
    fetchTimesheets();
    fetchDashboardStats();
  };

  const handleRejectTimesheet = async (id) => {
    const res = await fetch(`${API_URL}/api/admin/timesheets/${id}/reject`, {
      method: "PUT",
    });

    const data = await res.json();
    setMessage(data.message);
    fetchTimesheets();
    fetchDashboardStats();
  };

  const handleLogout = () => {
    localStorage.removeItem("v4desk_token");
    setEmployee(null);
    setAdmin(null);
    setMessage("");
    setEmployees([]);
    setClockRecords([]);
    setTimesheets([]);
  };

  const filteredEmployeeClockRecords = employee
    ? clockRecords.filter((record) => record.employee_id === employee.employee_id)
    : [];

  const filteredEmployeeTimesheets = employee
    ? timesheets.filter((sheet) => sheet.employee_id === employee.employee_id)
    : [];

  const StatCard = ({ title, value }) => (
    <div className="rounded-3xl bg-white p-6 shadow-lg">
      <p className="text-sm font-medium text-slate-500">{title}</p>
      <h3 className="mt-2 text-4xl font-bold text-slate-900">{value}</h3>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-100 p-8">
      {!employee && !admin ? (
        <div className="mx-auto mt-20 w-full max-w-md rounded-3xl bg-white p-8 shadow-lg">
          <h1 className="text-4xl font-bold text-slate-900">V4Desk</h1>
          <p className="mt-2 text-slate-600">Employee Timesheet Platform</p>

          <div className="mt-8 grid grid-cols-2 gap-3 rounded-2xl bg-slate-100 p-2">
            <button type="button" onClick={() => setLoginType("employee")} className={`rounded-xl p-3 font-semibold ${loginType === "employee" ? "bg-slate-900 text-white" : "text-slate-700"}`}>Employee</button>
            <button type="button" onClick={() => setLoginType("admin")} className={`rounded-xl p-3 font-semibold ${loginType === "admin" ? "bg-slate-900 text-white" : "text-slate-700"}`}>Admin</button>
          </div>

          {loginType === "employee" ? (
            <form onSubmit={handleEmployeeLogin} className="mt-8 space-y-5">
              <input className="w-full rounded-xl border border-slate-300 p-3" value={employeeId} onChange={(e) => setEmployeeId(e.target.value)} />
              <input type="password" className="w-full rounded-xl border border-slate-300 p-3" value={password} onChange={(e) => setPassword(e.target.value)} />
              <button className="w-full rounded-xl bg-slate-900 p-3 font-semibold text-white">Employee Login</button>
            </form>
          ) : (
            <form onSubmit={handleAdminLogin} className="mt-8 space-y-5">
              <input className="w-full rounded-xl border border-slate-300 p-3" value={adminEmail} onChange={(e) => setAdminEmail(e.target.value)} />
              <input type="password" className="w-full rounded-xl border border-slate-300 p-3" value={adminPassword} onChange={(e) => setAdminPassword(e.target.value)} />
              <button className="w-full rounded-xl bg-slate-900 p-3 font-semibold text-white">Admin Login</button>
            </form>
          )}

          {message && <div className="mt-5 rounded-2xl bg-slate-100 p-4 text-sm">{message}</div>}
        </div>
      ) : employee ? (
        <div>
          <div className="rounded-3xl bg-white p-8 shadow-lg">
            <h1 className="text-4xl font-bold text-slate-900">Employee Dashboard</h1>
            <p className="mt-2 text-slate-600">Welcome {employee.full_name}</p>
            <p className="text-slate-600">Employee ID: {employee.employee_id}</p>
            <p className="text-slate-600">Email: {employee.email}</p>

            <div className="mt-8 flex flex-wrap gap-4">
              <button onClick={handleClockIn} className="rounded-2xl bg-green-600 px-6 py-3 font-semibold text-white">Clock In</button>
              <button onClick={handleClockOut} className="rounded-2xl bg-red-600 px-6 py-3 font-semibold text-white">Clock Out</button>
              <button onClick={handleLogout} className="rounded-2xl bg-slate-900 px-6 py-3 font-semibold text-white">Logout</button>
            </div>

            {message && <div className="mt-6 rounded-2xl bg-slate-100 p-4 text-sm">{message}</div>}
          </div>

          <div className="mt-10 rounded-3xl bg-white p-8 shadow-lg">
            <h2 className="text-3xl font-bold text-slate-900">Submit Weekly Timesheet</h2>
            <div className="mt-6 grid gap-4 md:grid-cols-3">
              <input type="date" className="rounded-xl border border-slate-300 p-3" value={weekStart} onChange={(e) => setWeekStart(e.target.value)} />
              <input type="date" className="rounded-xl border border-slate-300 p-3" value={weekEnd} onChange={(e) => setWeekEnd(e.target.value)} />
              <input type="number" className="rounded-xl border border-slate-300 p-3" value={totalHours} onChange={(e) => setTotalHours(e.target.value)} />
            </div>
            <button onClick={handleSubmitTimesheet} className="mt-6 rounded-2xl bg-blue-600 px-6 py-3 font-semibold text-white">Submit Timesheet</button>
          </div>

          <div className="mt-10 rounded-3xl bg-white p-8 shadow-lg">
            <h2 className="text-3xl font-bold text-slate-900">My Timesheets</h2>
            <div className="mt-8 overflow-x-auto">
              <table className="w-full border-collapse">
                <thead><tr className="border-b bg-slate-50"><th className="p-4 text-left">Week Start</th><th className="p-4 text-left">Week End</th><th className="p-4 text-left">Hours</th><th className="p-4 text-left">Status</th></tr></thead>
                <tbody>
                  {filteredEmployeeTimesheets.map((sheet) => (
                    <tr key={sheet.id} className="border-b">
                      <td className="p-4">{new Date(sheet.week_start).toLocaleDateString()}</td>
                      <td className="p-4">{new Date(sheet.week_end).toLocaleDateString()}</td>
                      <td className="p-4">{sheet.total_hours}</td>
                      <td className="p-4">{sheet.status}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="mt-10 rounded-3xl bg-white p-8 shadow-lg">
            <h2 className="text-3xl font-bold text-slate-900">My Clock Records</h2>
            <div className="mt-8 overflow-x-auto">
              <table className="w-full border-collapse">
                <thead><tr className="border-b bg-slate-50"><th className="p-4 text-left">Clock In</th><th className="p-4 text-left">Clock Out</th><th className="p-4 text-left">Total Hours</th></tr></thead>
                <tbody>
                  {filteredEmployeeClockRecords.map((record) => (
                    <tr key={record.id} className="border-b">
                      <td className="p-4">{record.clock_in ? new Date(record.clock_in).toLocaleString() : "-"}</td>
                      <td className="p-4">{record.clock_out ? new Date(record.clock_out).toLocaleString() : "Still Clocked In"}</td>
                      <td className="p-4">{record.total_hours ? Number(record.total_hours).toFixed(2) : "-"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      ) : (
        <div>
          <div className="rounded-3xl bg-white p-8 shadow-lg">
            <h1 className="text-4xl font-bold text-slate-900">Admin Dashboard</h1>
            <p className="mt-2 text-slate-600">Welcome {admin.admin_name}</p>
            <p className="text-slate-600">Email: {admin.email}</p>
            <div className="mt-8 flex flex-wrap gap-4">
              <button onClick={loadAdminData} className="rounded-2xl bg-blue-600 px-6 py-3 font-semibold text-white">Refresh Dashboard</button>
              <button onClick={handleLogout} className="rounded-2xl bg-slate-900 px-6 py-3 font-semibold text-white">Logout</button>
            </div>
            {message && <div className="mt-6 rounded-2xl bg-slate-100 p-4 text-sm">{message}</div>}
          </div>

          <div className="mt-10 grid gap-6 md:grid-cols-3">
            <StatCard title="Total Employees" value={dashboardStats.totalEmployees} />
            <StatCard title="Active Employees" value={dashboardStats.activeEmployees} />
            <StatCard title="Inactive Employees" value={dashboardStats.inactiveEmployees} />
            <StatCard title="Pending Timesheets" value={dashboardStats.pendingTimesheets} />
            <StatCard title="Approved Timesheets" value={dashboardStats.approvedTimesheets} />
            <StatCard title="Rejected Timesheets" value={dashboardStats.rejectedTimesheets} />
          </div>

          <div className="mt-10 rounded-3xl bg-white p-8 shadow-lg">
            <h2 className="text-3xl font-bold text-slate-900">Add Employee</h2>
            <div className="mt-6 grid gap-4 md:grid-cols-4">
              <input className="rounded-xl border border-slate-300 p-3" value={newEmployeeId} onChange={(e) => setNewEmployeeId(e.target.value)} placeholder="Employee ID" />
              <input className="rounded-xl border border-slate-300 p-3" value={newFullName} onChange={(e) => setNewFullName(e.target.value)} placeholder="Full Name" />
              <input className="rounded-xl border border-slate-300 p-3" value={newEmail} onChange={(e) => setNewEmail(e.target.value)} placeholder="Email" />
              <input className="rounded-xl border border-slate-300 p-3" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder="Password" />
            </div>
            <button onClick={handleCreateEmployee} className="mt-6 rounded-2xl bg-green-600 px-6 py-3 font-semibold text-white">Create Employee</button>
          </div>

          <div className="mt-10 rounded-3xl bg-white p-8 shadow-lg">
            <h2 className="text-3xl font-bold text-slate-900">Employees</h2>
            <div className="mt-8 overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b bg-slate-50">
                    <th className="p-4 text-left">Employee ID</th><th className="p-4 text-left">Full Name</th><th className="p-4 text-left">Email</th><th className="p-4 text-left">Role</th><th className="p-4 text-left">Status</th><th className="p-4 text-left">Actions</th><th className="p-4 text-left">Reset Password</th>
                  </tr>
                </thead>
                <tbody>
                  {employees.map((emp) => (
                    <tr key={emp.id} className="border-b">
                      <td className="p-4">{emp.employee_id}</td>
                      <td className="p-4">{emp.full_name}</td>
                      <td className="p-4">{emp.email}</td>
                      <td className="p-4">{emp.role}</td>
                      <td className="p-4"><span className={`rounded-xl px-3 py-1 text-white ${emp.status === "inactive" ? "bg-red-600" : "bg-green-600"}`}>{emp.status || "active"}</span></td>
                      <td className="p-4">{emp.status === "inactive" ? <button onClick={() => handleReactivateEmployee(emp.id)} className="rounded-xl bg-green-600 px-4 py-2 text-white">Reactivate</button> : <button onClick={() => handleDeactivateEmployee(emp.id)} className="rounded-xl bg-red-600 px-4 py-2 text-white">Deactivate</button>}</td>
                      <td className="p-4">
                        <div className="flex gap-2">
                          <input type="text" placeholder="New password" className="rounded-xl border border-slate-300 p-2" value={resetPasswords[emp.id] || ""} onChange={(e) => setResetPasswords({ ...resetPasswords, [emp.id]: e.target.value })} />
                          <button onClick={() => handleResetPassword(emp.id)} className="rounded-xl bg-blue-600 px-4 py-2 text-white">Save</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="mt-10 rounded-3xl bg-white p-8 shadow-lg">
            <h2 className="text-3xl font-bold text-slate-900">Timesheet Management</h2>
            <div className="mt-8 overflow-x-auto">
              <table className="w-full border-collapse">
                <thead><tr className="border-b bg-slate-50"><th className="p-4 text-left">Employee ID</th><th className="p-4 text-left">Week Start</th><th className="p-4 text-left">Week End</th><th className="p-4 text-left">Hours</th><th className="p-4 text-left">Status</th><th className="p-4 text-left">Actions</th></tr></thead>
                <tbody>
                  {timesheets.map((sheet) => (
                    <tr key={sheet.id} className="border-b">
                      <td className="p-4">{sheet.employee_id}</td>
                      <td className="p-4">{new Date(sheet.week_start).toLocaleDateString()}</td>
                      <td className="p-4">{new Date(sheet.week_end).toLocaleDateString()}</td>
                      <td className="p-4">{sheet.total_hours}</td>
                      <td className="p-4">{sheet.status}</td>
                      <td className="p-4"><div className="flex gap-2"><button onClick={() => handleApproveTimesheet(sheet.id)} className="rounded-xl bg-green-600 px-4 py-2 text-white">Approve</button><button onClick={() => handleRejectTimesheet(sheet.id)} className="rounded-xl bg-red-600 px-4 py-2 text-white">Reject</button></div></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="mt-10 rounded-3xl bg-white p-8 shadow-lg">
            <h2 className="text-3xl font-bold text-slate-900">All Clock Records</h2>
            <div className="mt-8 overflow-x-auto">
              <table className="w-full border-collapse">
                <thead><tr className="border-b bg-slate-50"><th className="p-4 text-left">Employee ID</th><th className="p-4 text-left">Clock In</th><th className="p-4 text-left">Clock Out</th><th className="p-4 text-left">Total Hours</th></tr></thead>
                <tbody>
                  {clockRecords.map((record) => (
                    <tr key={record.id} className="border-b">
                      <td className="p-4">{record.employee_id}</td>
                      <td className="p-4">{record.clock_in ? new Date(record.clock_in).toLocaleString() : "-"}</td>
                      <td className="p-4">{record.clock_out ? new Date(record.clock_out).toLocaleString() : "Still Clocked In"}</td>
                      <td className="p-4">{record.total_hours ? Number(record.total_hours).toFixed(2) : "-"}</td>
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