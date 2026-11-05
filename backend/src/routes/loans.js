import { Router } from "express";
import mongoose from "mongoose";
import Loan from "../models/Loan.js";
import { GoogleGenAI } from "@google/genai";

const router = Router();
const isOverdue = loan => loan.status === "Borrowed" && new Date(loan.dueDate) < new Date();

router.get("/", async (_req, res) => {
  try {
    const loans = await Loan.find().sort({ createdAt: -1 }).lean();
    res.json(loans.map(loan => ({ ...loan, overdue: isOverdue(loan) })));
  } catch (error) { res.status(500).json({ message: error.message || "Unable to load book records." }); }
});

router.get("/summary", async (_req, res) => {
  try {
    const loans = await Loan.find().lean();
    const borrowed = loans.filter(x => x.status === "Borrowed");
    const returned = loans.filter(x => x.status === "Returned");
    const overdue = borrowed.filter(isOverdue);
    res.json({ totalLoans: loans.length, borrowed: borrowed.length, returned: returned.length, overdue: overdue.length, overdueRecords: overdue.map(x => ({ bookTitle: x.bookTitle, borrowerName: x.borrowerName, dueDate: x.dueDate })) });
  } catch (error) { res.status(500).json({ message: error.message || "Unable to create monitoring summary." }); }
});

router.post("/", async (req, res) => {
  try {
    const { bookTitle, bookCode, borrowerName, studentId, dueDate } = req.body;
    if (![bookTitle, borrowerName, studentId, dueDate].every(x => String(x || "").trim())) return res.status(400).json({ message: "Book title, borrower name, student ID, and due date are required." });
    if (Number.isNaN(new Date(dueDate).getTime())) return res.status(400).json({ message: "Please provide a valid due date." });
    const loan = await Loan.create({ bookTitle, bookCode, borrowerName, studentId, dueDate });
    res.status(201).json(loan);
  } catch (error) { res.status(400).json({ message: error.message || "Unable to record borrowing." }); }
});

router.patch("/:id/return", async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id)) return res.status(400).json({ message: "Invalid book record ID." });
  try {
    const loan = await Loan.findById(req.params.id);
    if (!loan) return res.status(404).json({ message: "Book record not found." });
    if (loan.status === "Returned") return res.status(400).json({ message: "This book has already been returned." });
    loan.status = "Returned";
    loan.returnedAt = new Date();
    await loan.save();
    res.json(loan);
  } catch (error) { res.status(500).json({ message: error.message || "Unable to record return." }); }
});

router.post("/ai-monitor", async (_req, res) => {
  try {
    const loans = await Loan.find().lean();
    const borrowed = loans.filter(x => x.status === "Borrowed");
    const overdue = borrowed.filter(isOverdue);
    const stats = { totalRecords: loans.length, currentlyBorrowed: borrowed.length, returned: loans.filter(x => x.status === "Returned").length, overdue: overdue.length, overdueBooks: overdue.map(x => `${x.bookTitle} — ${x.borrowerName}, due ${new Date(x.dueDate).toLocaleDateString()}`) };
    if (!process.env.GEMINI_API_KEY) return res.json({ report: `Monitoring summary: ${stats.currentlyBorrowed} currently borrowed, ${stats.returned} returned, and ${stats.overdue} overdue.`, stats, source: "records" });
    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    const result = await ai.models.generateContent({
      model: process.env.GEMINI_MODEL || "gemini-2.5-flash",
      contents: `You are a library circulation monitoring assistant. Summarize these verified database statistics in plain, concise language. Do not invent data. Mention overdue items and recommend librarian follow-up. Data: ${JSON.stringify(stats)}`
    });
    res.json({ report: result.text || "Monitoring summary is available.", stats, source: "gemini" });
  } catch (error) { res.status(500).json({ message: error.message || "AI monitoring failed. You can still view the book records." }); }
});

export default router;
