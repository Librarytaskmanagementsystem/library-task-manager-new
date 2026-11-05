import mongoose from "mongoose";

const taskSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true, maxlength: 120 },
  description: { type: String, trim: true, default: "" },
  category: { type: String, enum: ["Cataloging", "Circulation", "Maintenance", "Administration", "Events", "Other"], default: "Other" },
  dueDate: { type: Date, default: null },
  priority: { type: String, enum: ["Low", "Medium", "High"], default: "Medium" },
  status: { type: String, enum: ["Pending", "In Progress", "Completed"], default: "Pending" },
  assignedTo: { type: String, trim: true, default: "Library Staff" }
}, { timestamps: true });

export default mongoose.model("Task", taskSchema);
