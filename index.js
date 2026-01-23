import express from "express";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

app.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

app.post("/chat", (req, res) => {
  try {
    const { message } = req.body;
    res.json({ reply: "Mock response" });

    if (!message || message.trim().length === 0) {
      return res.status(400).json({ error: "Message cannot be empty" });
    }

    // Mock AI response (temporary)
    const reply =
      `✅ AI Response (Mock)\n\n` +
      `You said: "${message}"\n\n` +
      `Next steps:\n1) Clarify goal\n2) Provide example\n3) Implement solution\n`;

    return res.json({ reply });
  } catch (err) {
    return res
      .status(500)
      .json({ error: "Server error", details: err.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () =>
  console.log(`✅ Server running on http://localhost:${PORT}`),
);
