
import dotenv from "dotenv";
import path from "node:path";
import { fileURLToPath } from "node:url";
import express from "express";
import { GoogleGenAI } from "@google/genai";

// Load the .env file from the backend folder
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const envPath = path.resolve(__dirname, "../../.env");

const envResult = dotenv.config({
  path: envPath,
});

console.log(
  "Loaded .env file:",
  envResult.parsed ? true : false
);

// Create Express router
const router = express.Router();

// Get Gemini API key
const apiKey = process.env.GEMINI_API_KEY;

console.log("Gemini API key loaded:", Boolean(apiKey));

if (!apiKey) {
  throw new Error("GEMINI_API_KEY is missing from .env");
}

// Initialize Gemini AI
const ai = new GoogleGenAI({
  apiKey: apiKey,
});

// Gemini Book Recommendation API
router.post("/recommend", async (req, res) => {
  try {
    const { interest } = req.body;

    if (!interest || typeof interest !== "string") {
      return res.status(400).json({
        message: "Please enter your book interest.",
      });
    }

    let response;

    // Retry Gemini request up to 3 times
    for (let attempt = 1; attempt <= 3; attempt++) {
      try {
        response = await ai.models.generateContent({
          model: "gemini-3.8-flash",
          contents: `
            You are an AI assistant for a library system.

            Recommend 5 books for a reader interested in:
            ${interest}

            For each book, provide:
            - Book title
            - Author
            - Short explanation

            Make the recommendations easy to understand.
          `,
        });

        // Request succeeded
        break;

      } catch (error) {
        console.error(
          `Gemini attempt ${attempt} failed:`,
          error.message
        );

        // Stop after 3 failed attempts
        if (attempt === 3) {
          throw error;
        }

        // Wait before retrying
        // Attempt 1: 2 seconds
        // Attempt 2: 4 seconds
        await new Promise((resolve) =>
          setTimeout(resolve, attempt * 2000)
        );
      }
    }

    // Send recommendations to frontend
    res.json({
      recommendation: response.text,
    });

  } catch (error) {
    console.error("Gemini Error:", error);

    res.status(500).json({
      message: error.message || "Gemini AI failed.",
    });
  }
});

export default router;
