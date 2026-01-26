import express from "express";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();

const app = express();

/* ✅ CORS – keep it simple for now */
app.use(cors());

/* ✅ Middleware */
app.use(express.json());

/* ✅ Health check */
app.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

/* ✅ Chat API */
app.post("/chat", (req, res) => {
  try {
    const { message } = req.body;

    // Validate input FIRST
    if (!message || message.trim().length === 0) {
      return res.status(400).json({ error: "Message cannot be empty" });
    }

    // Structured AI-style response (mock)
    const reply = {
      summary: "User sent a greeting message.",
      keyPoints: [
        "Message received successfully",
        "Backend API is functioning correctly",
      ],
      nextActions: ["Integrate real AI provider", "Enhance frontend rendering"],
    };

    // Send response ONCE
    return res.json({ reply });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Server error" });
  }
});

/* ✅ Start server */
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
});
