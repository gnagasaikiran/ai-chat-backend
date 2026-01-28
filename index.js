import express from "express";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();

const app = express();

/* ---------- Middleware ---------- */
app.use(cors()); // Keep open during development; tighten later for production
app.use(express.json({ limit: "1mb" })); // basic body size limit

/* ---------- In-memory rate limit (simple dev guard) ---------- */
// NOTE: This resets on server restart and is per-process only.
// Good enough for development demos and basic protection.
const hits = new Map(); // ip -> [timestamps]

function rateLimit(req, res) {
  const ip =
    req.headers["x-forwarded-for"]?.toString().split(",")[0].trim() ||
    req.socket.remoteAddress ||
    "local";

  const now = Date.now();
  const windowMs = 15 * 1000; // 15 seconds window
  const maxReq = 5; // up to 5 requests per 15s

  const recent = (hits.get(ip) || []).filter((t) => now - t < windowMs);
  if (recent.length >= maxReq) {
    return {
      blocked: true,
      res: res
        .status(429)
        .json({
          error: {
            code: "RATE_LIMIT",
            message: "Too many requests, slow down.",
          },
        }),
    };
  }
  hits.set(ip, [...recent, now]);
  return { blocked: false };
}

/* ---------- Health ---------- */
app.get("/health", (_req, res) => {
  res.json({ status: "ok" });
});

/* ---------- Chat API with guardrails ---------- */
app.post("/chat", (req, res) => {
  try {
    // 0) Simple rate limit
    const rl = rateLimit(req, res);
    if (rl.blocked) return;

    // 1) Validate input early
    const { message } = req.body || {};
    if (typeof message !== "string") {
      return res
        .status(400)
        .json({
          error: {
            code: "INPUT_INVALID_TYPE",
            message: "`message` must be a string",
          },
        });
    }

    const trimmed = message.trim();
    if (trimmed.length === 0) {
      return res
        .status(400)
        .json({
          error: { code: "INPUT_EMPTY", message: "Message cannot be empty" },
        });
    }

    // 2) Length limits (client guard is helpful but never trust client)
    const MAX_LEN = 500; // keep it small for demo
    if (trimmed.length > MAX_LEN) {
      return res.status(413).json({
        error: {
          code: "INPUT_TOO_LONG",
          message: `Message too long (max ${MAX_LEN} chars)`,
        },
      });
    }

    // 3) (Optional) Very light normalization (you can expand later)
    const safeMessage = trimmed.replace(/\s+/g, " ").slice(0, MAX_LEN);

    // 4) Structured mock reply (kept from Day-8)
    const reply = {
      summary: "User sent a greeting message.",
      keyPoints: [
        "Message received successfully",
        "Backend API is functioning correctly",
      ],
      nextActions: ["Integrate real AI provider", "Enhance frontend rendering"],
      // Keep the original for traceability (useful when you integrate LLMs)
      _meta: { originalInputSample: safeMessage.slice(0, 50) },
    };

    // 5) Return consistent shape
    return res.json({ reply });
  } catch (err) {
    // 6) Safe server logging (never log secrets/PII in real apps)
    console.error("[/chat] error:", err?.message || err);
    return res
      .status(500)
      .json({
        error: { code: "SERVER_ERROR", message: "Unexpected server error" },
      });
  }
});

/* ---------- Start server ---------- */
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
});
