import mongoose from "mongoose";

const loanSchema = new mongoose.Schema({
  bookTitle: { type: String, required: true, trim: true },
  bookCode: { type: String, trim: true, default: "" },
  borrowerName: { type: String, required: true, trim: true },
  studentId: { type: String, required: true, trim: true },
  borrowedAt: { type: Date, default: Date.now },
  dueDate: { type: Date, required: true },
  returnedAt: { type: Date, default: null },
  status: { type: String, enum: ["Borrowed", "Returned"], default: "Borrowed" }
}, { timestamps: true });

loanSchema.index({ status:  1, dueDate: 1 });
export default mongoose.model("Loan", loanSchema);
