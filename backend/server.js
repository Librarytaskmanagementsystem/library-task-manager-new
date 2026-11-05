import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import dotenv from "dotenv";
import path from "path";
import dns from "dns";
import { fileURLToPath } from "url";

import geminiRoutes from "./src/routes/gemini.js";
import taskRoutes from "./src/routes/tasks.js";
import loanRoutes from "./src/routes/loans.js";

// Load the backend/.env file reliably, regardless of the terminal's current folder.
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, ".env") });

// Optional DNS override for networks where Node.js cannot resolve Atlas SRV records.
// Set MONGO_DNS_SERVERS=8.8.8.8,1.1.1.1 in backend/.env if needed.
const dnsServers = process.env.MONGO_DNS_SERVERS
  ?.split(",")
  .map((server) => server.trim())
  .filter(Boolean);

if (dnsServers?.length) {
  try {
    dns.setServers(dnsServers);
    console.log("Using configured DNS resolver(s) for MongoDB.");
  } catch (error) {
    console.error("Could not configure DNS resolver:", error.message);
    process.exit(1);
  }
}

const app = express();

app.use(
  cors({
    origin: ["http://localhost:5173", "http://localhost:5174"],
  })
);
app.use(express.json());

app.get("/api/health", (_req, res) => {
  res.json({
    status: "ok",
    service: "Library Task Manager API",
  });
});

app.use("/api/tasks", taskRoutes);
app.use("/api/loans", loanRoutes);
app.use("/api/gemini", geminiRoutes);

const port = Number(process.env.PORT) || 5000;
const mongoURI = process.env.MONGO_URI;

if (!mongoURI) {
  console.error("MongoDB connection failed: MONGO_URI is missing from backend/.env.");
  process.exit(1);
}

try {
  await mongoose.connect(mongoURI, {
    serverSelectionTimeoutMS: 15000,
  });

  console.log("MongoDB connected successfully");

  app.listen(port, () => {
    console.log(`API running at http://localhost:${port}`);
  });
} catch (error) {
  console.error("MongoDB connection failed:", error.message);

  if (error.code === "ECONNREFUSED" && error.syscall === "querySrv") {
    console.error(
      "Node.js could not resolve the Atlas SRV record. Verify the Atlas hostname, " +
      "try MONGO_DNS_SERVERS=8.8.8.8,1.1.1.1, or copy Atlas's Legacy URI (mongodb://) " +
      "from Connect > Drivers. Use the exact URI Atlas provides."
    );
  } else if (
    error.name === "MongoServerSelectionError" ||
    error.message?.toLowerCase().includes("timed out")
  ) {
    console.error(
      "Check Atlas Network Access and allow your current public IP address. " +
      "Also confirm the cluster is running."
    );
  } else if (error.message?.toLowerCase().includes("authentication failed")) {
    console.error(
      "Check the Atlas Database Access username/password. URL-encode special characters in the password."
    );
  }

  process.exit(1);
}
