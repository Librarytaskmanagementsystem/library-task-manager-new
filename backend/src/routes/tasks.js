import { Router } from "express";
import mongoose from "mongoose";
import Task from "../models/Task.js";
const router = Router();

router.get("/", async (req, res) => {
  try {
    const search = String(req.query.search || "").trim();
    const filter = search ? { $or: [
      { title: { $regex: search, $options: "i" } },
      { description: { $regex: search, $options: "i" } },
      { category: { $regex: search, $options: "i" } },
      { assignedTo: { $regex: search, $options: "i" } }
    ] } : {};
    res.json(await Task.find(filter).sort({ createdAt: -1 }));
  } catch { res.status(500).json({ message: "Failed to retrieve tasks." }); }
});

router.get("/:id", async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id)) return res.status(400).json({ message: "Invalid task ID." });
  try {
    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ message: "Task not found." });
    res.json(task);
  } catch { res.status(500).json({ message: "Failed to retrieve task." }); }
});

router.post("/", async (req, res) => {
  try {
    const { title, description, category, dueDate, priority, status, assignedTo } = req.body;
    if (!String(title || "").trim()) return res.status(400).json({ message: "Task title is required." });
    const task = await Task.create({ title, description, category, dueDate: dueDate || null, priority, status, assignedTo });
    res.status(201).json(task);
  } catch (error) { res.status(400).json({ message: error.message || "Failed to create task." }); }
});

router.put("/:id", async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id)) return res.status(400).json({ message: "Invalid task ID." });
  try {
    const allowed = ["title", "description", "category", "dueDate", "priority", "status", "assignedTo"];
    const update = Object.fromEntries(Object.entries(req.body).filter(([key]) => allowed.includes(key)));
    if (update.title !== undefined && !String(update.title).trim()) return res.status(400).json({ message: "Task title cannot be empty." });
    const task = await Task.findByIdAndUpdate(req.params.id, update, { new: true, runValidators: true });
    if (!task) return res.status(404).json({ message: "Task not found." });
    res.json(task);
  } catch (error) { res.status(400).json({ message: error.message || "Failed to update task." }); }
});

router.delete("/:id", async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id)) return res.status(400).json({ message: "Invalid task ID." });
  try {
    const task = await Task.findByIdAndDelete(req.params.id);
    if (!task) return res.status(404).json({ message: "Task not found." });
    res.json({ message: "Task deleted successfully." });
  } catch { res.status(500).json({ message: "Failed to delete task." }); }
});
export default router;
