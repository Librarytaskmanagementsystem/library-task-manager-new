import mongoose from "mongoose";
import dotenv from "dotenv";
import Task from "./src/models/Task.js";
dotenv.config();

const mockTasks = [
  { title: "Catalog newly donated books", description: "Enter donations into the catalog and attach classification labels.", category: "Cataloging", priority: "High", status: "In Progress", dueDate: "2026-10-24", assignedTo: "Ana Reyes" },
  { title: "Shelve returned fiction books", description: "Sort returned novels by call number and return them to the correct shelves.", category: "Circulation", priority: "Medium", status: "Pending", dueDate: "2026-10-23", assignedTo: "Mark Santos" },
  { title: "Check overdue book list", description: "Review overdue items and prepare reminder notices.", category: "Circulation", priority: "High", status: "Pending", dueDate: "2026-10-22", assignedTo: "Library Staff" },
  { title: "Repair damaged book covers", description: "Inspect books and repair covers that can be safely fixed.", category: "Maintenance", priority: "Low", status: "Pending", dueDate: "2026-10-28", assignedTo: "Jo Cruz" },
  { title: "Update member records", description: "Check contact details and update incomplete library records.", category: "Administration", priority: "Medium", status: "Completed", dueDate: "2026-10-20", assignedTo: "Ana Reyes" },
  { title: "Prepare reading month display", description: "Choose featured books and prepare a display near the entrance.", category: "Events", priority: "Medium", status: "In Progress", dueDate: "2026-10-30", assignedTo: "Lia Garcia" },
  { title: "Audit reference section", description: "Verify reference books and arrange them by call number.", category: "Cataloging", priority: "High", status: "Pending", dueDate: "2026-10-27", assignedTo: "Mark Santos" },
  { title: "Clean study tables", description: "Check shared study spaces and coordinate routine cleaning.", category: "Maintenance", priority: "Low", status: "Completed", dueDate: "2026-10-21", assignedTo: "Library Staff" },
  { title: "Create weekly circulation report", description: "Summarize loans, returns, and renewals for the staff meeting.", category: "Administration", priority: "Medium", status: "Pending", dueDate: "2026-10-25", assignedTo: "Jo Cruz" },
  { title: "Label new shelf sections", description: "Print and attach shelf labels for updated nonfiction shelves.", category: "Cataloging", priority: "Low", status: "In Progress", dueDate: "2026-10-29", assignedTo: "Lia Garcia" },
  { title: "Organize children's story hour", description: "Select stories and arrange seating for the session.", category: "Events", priority: "High", status: "Pending", dueDate: "2026-10-26", assignedTo: "Ana Reyes" },
  { title: "Review library supply inventory", description: "Count barcode labels, book covers, and cataloging supplies.", category: "Administration", priority: "Low", status: "Completed", dueDate: "2026-10-19", assignedTo: "Mark Santos" }
];

async function seed() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    await Task.deleteMany({});
    const inserted = await Task.insertMany(mockTasks);
    console.log(`Seed complete: inserted ${inserted.length} mock tasks.`);
  } catch (error) {
    console.error("Seed failed:", error.message);
    process.exitCode = 1;
  } finally { await mongoose.disconnect(); }
}
seed();
