import { useEffect, useState } from "react";

const API = "http://localhost:5000/api/loans";
const today = new Date().toISOString().slice(0, 10);
const defaultDue = new Date(Date.now() + 14 * 86400000).toISOString().slice(0, 10);
const initial = { bookTitle: "", bookCode: "", borrowerName: "", studentId: "", dueDate: defaultDue };
const dateText = value => value ? new Date(value).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" }) : "—";

export default function BookMonitor({ onBack }) {
  const [records, setRecords] = useState([]);
  const [form, setForm] = useState(initial);
  const [summary, setSummary] = useState(null);
  const [report, setReport] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  async function load() {
    try {
      const [r, s] = await Promise.all([fetch(API), fetch(`${API}/summary`)]);
      const recordsData = await r.json(); const summaryData = await s.json();
      if (!r.ok) throw new Error(recordsData.message || "Could not load records");
      setRecords(recordsData); setSummary(summaryData); setError("");
    } catch (e) { setError(`${e.message}. Please make sure the backend and MongoDB are running.`); }
  }
  useEffect(() => { load(); }, []);

  async function borrow(e) {
    e.preventDefault(); setBusy(true); setError(""); setNotice("");
    try {
      const response = await fetch(API, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
      const data = await response.json(); if (!response.ok) throw new Error(data.message || "Could not save borrowing");
      setForm(initial); setNotice("Borrowing recorded successfully."); await load();
    } catch (e) { setError(e.message); } finally { setBusy(false); }
  }
  async function markReturned(record) {
    setBusy(true); setError(""); setNotice("");
    try {
      const response = await fetch(`${API}/${record._id}/return`, { method: "PATCH" });
      const data = await response.json(); if (!response.ok) throw new Error(data.message || "Could not record return");
      setNotice(`${record.bookTitle} marked as returned.`); await load();
    } catch (e) { setError(e.message); } finally { setBusy(false); }
  }
  async function runAI() {
    setBusy(true); setError(""); setReport("");
    try {
      const response = await fetch(`${API}/ai-monitor`, { method: "POST" });
      const data = await response.json(); if (!response.ok) throw new Error(data.message || "AI monitor failed");
      setReport(data.report);
    } catch (e) { setError(e.message); } finally { setBusy(false); }
  }

  return <div className="layout"><aside className="sidebar"><div className="brand"><div className="brand-mark">▤</div><div><strong>LibraTask</strong><small>LIBRARY WORKSPACE</small></div></div><div className="nav-caption">WORKSPACE</div><button className="nav-link" onClick={onBack}>▦ &nbsp; Dashboard</button><div className="nav-link active">▣ &nbsp; Book Monitoring</div><div className="side-tip"><div className="tip-icon">✦</div><strong>Track every book.</strong><p>Record borrowing and returns, and review overdue books.</p></div><div className="profile"><div className="avatar">LS</div><div><strong>Library Staff</strong><small>Demo workspace</small></div></div></aside>
    <main className="main"><header className="header"><div><div className="crumb">LIBRARY / CIRCULATION</div><h1>Book Monitoring</h1><p className="subheading">Record who borrowed books, track returns, and monitor overdue items.</p></div><button className="btn secondary" onClick={onBack}>← Dashboard</button></header>
      {error && <div className="message failure">{error}</div>}{notice && <div className="message success">{notice}</div>}
      <section className="stats"><div className="stat"><div className="stat-label">Total loan records</div><strong>{summary?.totalLoans ?? "—"}</strong><small>All borrowing activity</small></div><div className="stat"><div className="stat-label">Currently borrowed</div><strong>{summary?.borrowed ?? "—"}</strong><small>Not yet returned</small></div><div className="stat"><div className="stat-label">Returned</div><strong>{summary?.returned ?? "—"}</strong><small>Return recorded</small></div><div className="stat"><div className="stat-label">Overdue</div><strong>{summary?.overdue ?? "—"}</strong><small>Past due date</small></div></section>
      <section className="panel"><div className="panel-heading"><div><h2>Record a borrowed book</h2><p>Enter borrower and book details.</p></div></div><form className="task-form" onSubmit={borrow}><div className="form-grid"><label>Book title *<input required value={form.bookTitle} onChange={e => setForm({ ...form, bookTitle: e.target.value })} placeholder="Book title" /></label><label>Book code / ISBN<input value={form.bookCode} onChange={e => setForm({ ...form, bookCode: e.target.value })} placeholder="Optional" /></label><label>Borrower name *<input required value={form.borrowerName} onChange={e => setForm({ ...form, borrowerName: e.target.value })} placeholder="Student name" /></label><label>Student ID *<input required value={form.studentId} onChange={e => setForm({ ...form, studentId: e.target.value })} placeholder="Student ID" /></label><label>Due date *<input required type="date" min={today} value={form.dueDate} onChange={e => setForm({ ...form, dueDate: e.target.value })} /></label></div><div className="form-actions"><button className="btn primary" disabled={busy} type="submit">{busy ? "Please wait…" : "＋ Record Borrowing"}</button></div></form></section>
      <section className="panel"><div className="panel-heading"><div><h2>Borrowing and return records</h2><p>Click Return when a book is handed back to the library.</p></div><button className="btn primary" disabled={busy} onClick={runAI}>✦ AI Monitor</button></div>{report && <div className="message success" style={{ whiteSpace: "pre-wrap" }}><strong>AI monitoring report</strong><br />{report}</div>}{records.length === 0 ? <div className="empty">No book records yet. Record a borrowing above to begin.</div> : <div className="task-list">{records.map(r => <article className="task-row" key={r._id}><div className={`task-symbol ${r.status === "Returned" ? "finished" : ""}`}>{r.status === "Returned" ? "✓" : "▤"}</div><div className="task-info"><div className="task-title-line"><h3>{r.bookTitle}</h3><span className={`priority ${r.overdue ? "high" : r.status === "Returned" ? "low" : "medium"}`}>{r.overdue ? "Overdue" : r.status}</span></div><p>{r.borrowerName} · Student ID: {r.studentId}{r.bookCode ? ` · Code: ${r.bookCode}` : ""}</p><div className="metadata"><span>Borrowed: {dateText(r.borrowedAt)}</span><span>Due: {dateText(r.dueDate)}</span><span>Returned: {dateText(r.returnedAt)}</span></div></div>{r.status === "Borrowed" && <div className="task-actions"><button className="btn primary" disabled={busy} onClick={() => markReturned(r)}>Return Book</button></div>}</article>)}</div>}</section>
      <footer>LibraTask · Library Book Monitoring <span>React · Express · MongoDB · Gemini AI</span></footer>
    </main></div>;
}
