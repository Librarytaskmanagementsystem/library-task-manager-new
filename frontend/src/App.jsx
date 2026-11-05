import { useEffect, useMemo, useState } from "react";
import BookMonitor from "./BookMonitor.jsx";

const API = "http://localhost:5000/api/tasks";
const blank = { title: "", description: "", category: "Cataloging", dueDate: "", priority: "Medium", status: "Pending", assignedTo: "Library Staff" };
const categories = ["Cataloging", "Circulation", "Maintenance", "Administration", "Events", "Other"];
const statuses = ["Pending", "In Progress", "Completed"];
const priorities = ["Low", "Medium", "High"];
const toDateInput = v => v ? new Date(v).toISOString().slice(0, 10) : "";
const displayDate = v => v ? new Date(v).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" }) : "No due date";

export default function App() {
  const [tasks, setTasks] = useState([]);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("All");
  const [form, setForm] = useState(blank);
  const [editing, setEditing] = useState(null);
  const [formOpen, setFormOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [monitorMode, setMonitorMode] = useState(false);

  async function loadTasks() {
    setLoading(true);
    try {
      const response = await fetch(`${API}?search=${encodeURIComponent(search)}`);
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Unable to load tasks");
      setTasks(data); setError("");
    } catch (e) { setError(`${e.message}. Check that the backend and MongoDB are running.`); }
    finally { setLoading(false); }
  }
  useEffect(() => { const timer = setTimeout(loadTasks, 250); return () => clearTimeout(timer); }, [search]);

  const counts = useMemo(() => ({
    total: tasks.length,
    pending: tasks.filter(t => t.status === "Pending").length,
    progress: tasks.filter(t => t.status === "In Progress").length,
    completed: tasks.filter(t => t.status === "Completed").length
  }), [tasks]);
  const visible = useMemo(() => filter === "All" ? tasks : tasks.filter(t => t.status === filter), [tasks, filter]);

  function addTask() { setEditing(null); setForm(blank); setFormOpen(true); setNotice(""); setError(""); }
  function editTask(t) {
    setEditing(t._id);
    setForm({ title: t.title || "", description: t.description || "", category: t.category || "Other", dueDate: toDateInput(t.dueDate), priority: t.priority || "Medium", status: t.status || "Pending", assignedTo: t.assignedTo || "Library Staff" });
    setFormOpen(true); setNotice(""); setError(""); window.scrollTo({ top: 0, behavior: "smooth" });
  }
  async function saveTask(e) {
    e.preventDefault(); setError(""); setNotice("");
    try {
      const response = await fetch(editing ? `${API}/${editing}` : API, {
        method: editing ? "PUT" : "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, dueDate: form.dueDate || null })
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Unable to save task");
      setFormOpen(false); setEditing(null); setNotice(editing ? "Task updated successfully." : "Task added successfully.");
      await loadTasks();
    } catch (e) { setError(e.message); }
  }
  async function deleteTask(t) {
    if (!window.confirm(`Delete "${t.title}"? This cannot be undone.`)) return;
    try {
      const response = await fetch(`${API}/${t._id}`, { method: "DELETE" });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Unable to delete task");
      setNotice("Task deleted successfully."); setError(""); await loadTasks();
    } catch (e) { setError(e.message); }
  }
  async function setStatus(t, status) {
    try {
      const response = await fetch(`${API}/${t._id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ status }) });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Unable to update status");
      setNotice("Task status updated."); setError(""); await loadTasks();
    } catch (e) { setError(e.message); }
  }

  if (monitorMode) return <BookMonitor onBack={() => setMonitorMode(false)} />;

  return <div className="layout">
    <aside className="sidebar">
      <div className="brand"><div className="brand-mark">▤</div><div><strong>LibraTask</strong><small>LIBRARY WORKSPACE</small></div></div>
      <div className="nav-caption">WORKSPACE</div><div className="nav-link active">▦ &nbsp; Dashboard</div><button className="nav-link" onClick={() => setMonitorMode(true)}>▣ &nbsp; Book Monitoring</button>
      <div className="side-tip"><div className="tip-icon">✦</div><strong>One task at a time.</strong><p>Keep library work organized and moving forward.</p></div>
      <div className="profile"><div className="avatar">LS</div><div><strong>Library Staff</strong><small>Demo workspace</small></div></div>
    </aside>
    <main className="main">
      <header className="header"><div><div className="crumb">LIBRARY / WORKSPACE</div><h1>Task Dashboard</h1><p className="subheading">Plan, organize, and track your library's daily work.</p></div><button className="btn primary" onClick={addTask}>＋ Add New Task</button></header>
      <section className="hero"><div><div className="hero-label">YOUR LIBRARY, IN ORDER</div><h2>Make every task count.</h2><p>Stay on top of library operations, one task at a time.</p></div><div className="hero-graphic">▤<span>✦</span></div></section>
      <section className="stats">
        <div className="stat"><div className="stat-label">Total tasks <span className="stat-icon violet">▦</span></div><strong>{counts.total}</strong><small>Matching your search</small></div>
        <div className="stat"><div className="stat-label">Pending <span className="stat-icon amber">◷</span></div><strong>{counts.pending}</strong><small>Waiting to be started</small></div>
        <div className="stat"><div className="stat-label">In progress <span className="stat-icon blue">↻</span></div><strong>{counts.progress}</strong><small>Currently being handled</small></div>
        <div className="stat"><div className="stat-label">Completed <span className="stat-icon green">✓</span></div><strong>{counts.completed}</strong><small>Successfully finished</small></div>
      </section>
      {notice && <div className="message success">{notice}</div>}{error && <div className="message failure">{error}</div>}
      {formOpen && <section className="panel form-panel"><div className="panel-heading"><div><h2>{editing ? "Edit task" : "Create a task"}</h2><p>Fill in the task details below.</p></div><button className="close" onClick={() => setFormOpen(false)}>×</button></div>
        <form className="task-form" onSubmit={saveTask}>
          <label>Task title *<input required maxLength="120" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} placeholder="e.g. Organize returned books" /></label>
          <label>Description<textarea rows="3" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} placeholder="Describe what needs to be done..." /></label>
          <div className="form-grid">
            <label>Category<select value={form.category} onChange={e => setForm({ ...form, category: e.target.value })}>{categories.map(x => <option key={x}>{x}</option>)}</select></label>
            <label>Assigned to<input value={form.assignedTo} onChange={e => setForm({ ...form, assignedTo: e.target.value })} /></label>
            <label>Due date<input type="date" value={form.dueDate} onChange={e => setForm({ ...form, dueDate: e.target.value })} /></label>
            <label>Priority<select value={form.priority} onChange={e => setForm({ ...form, priority: e.target.value })}>{priorities.map(x => <option key={x}>{x}</option>)}</select></label>
            <label>Status<select value={form.status} onChange={e => setForm({ ...form, status: e.target.value })}>{statuses.map(x => <option key={x}>{x}</option>)}</select></label>
          </div>
          <div className="form-actions"><button type="button" className="btn secondary" onClick={() => setFormOpen(false)}>Cancel</button><button className="btn primary" type="submit">{editing ? "Save Changes" : "Create Task"}</button></div>
        </form>
      </section>}
      <section className="panel task-panel">
        <div className="panel-heading list-heading"><div><h2>Library tasks</h2><p>Manage and follow up on your library activities.</p></div><div className="search"><span>⌕</span><input aria-label="Search tasks" placeholder="Search title, description..." value={search} onChange={e => setSearch(e.target.value)} /></div></div>
        <div className="filters"><span>FILTER BY STATUS</span><div>{["All", ...statuses].map(s => <button key={s} className={`filter ${filter === s ? "selected" : ""}`} onClick={() => setFilter(s)}>{s}</button>)}</div></div>
        {loading ? <div className="empty">Loading tasks…</div> : visible.length === 0 ? <div className="empty"><div className="empty-art">☷</div><strong>{search || filter !== "All" ? "No matching tasks" : "No tasks yet"}</strong><p>{search || filter !== "All" ? "Try changing your search or filter." : "Run the seed script to load demo tasks."}</p>{!search && filter === "All" && <button className="btn primary" onClick={addTask}>＋ Add New Task</button>}</div> :
          <div className="task-list">{visible.map(t => <article className="task-row" key={t._id}>
            <div className={`task-symbol ${t.status === "Completed" ? "finished" : ""}`}>{t.status === "Completed" ? "✓" : "▤"}</div>
            <div className="task-info"><div className="task-title-line"><h3>{t.title}</h3><span className={`priority ${t.priority.toLowerCase()}`}>{t.priority}</span></div><p>{t.description || "No description provided."}</p><div className="metadata"><span>▦ {t.category}</span><span>◷ {displayDate(t.dueDate)}</span><span>♙ {t.assignedTo || "Library Staff"}</span></div></div>
            <div className="task-actions"><select aria-label={`Status for ${t.title}`} value={t.status} onChange={e => setStatus(t, e.target.value)}>{statuses.map(s => <option key={s}>{s}</option>)}</select><button className="edit-action" onClick={() => editTask(t)}>Edit</button><button className="delete-action" onClick={() => deleteTask(t)}>Delete</button></div>
          </article>)}</div>}
      </section>
      <footer>LibraTask · Library Task Management System <span>React · Express · MongoDB</span></footer>
    </main>
  </div>;
}
