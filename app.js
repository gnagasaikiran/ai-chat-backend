// app.js
import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import { v4 as uuid } from "uuid";

// If you have config.js/env parsing, import it:
import dotenv from "dotenv";
dotenv.config();

const app = express();

// Request ID
app.use((req, _res, next) => {
  req.id = uuid();
  next();
});

// Basic security
app.use(helmet());
morgan.token("id", (req) => req.id);
app.use(
  morgan(":id :method :url :status :res[content-length] - :response-time ms"),
);

// JSON parser
app.use(express.json({ limit: "1mb" }));

// CORS (Lambda + API Gateway handles CORS too; keep permissive for now or tighten)
const allowed = new Set(
  (process.env.ALLOWED_ORIGINS || "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean),
);
app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin) return callback(null, true);
      if (allowed.size === 0) return callback(null, true); // dev-friendly; tighten later
      if (allowed.has(origin)) return callback(null, true);
      return callback(new Error("CORS_NOT_ALLOWED"), false);
    },
    methods: ["GET", "POST", "OPTIONS"],
  }),
);

// Health
app.get("/health", (_req, res) => {
  res.json({ status: "ok" });
});

// Root info
app.get("/", (_req, res) => {
  res.status(200).send("Backend is up. Try GET /health or POST /chat.");
});

// Simple in-memory rate limit (dev only)
const hits = new Map();
function rateLimit(req) {
  const ip =
    req.headers["x-forwarded-for"]?.toString().split(",")[0].trim() ||
    req.socket.remoteAddress ||
    "local";
  const now = Date.now();
  const windowMs = 15 * 1000;
  const maxReq = 5;
  const recent = (hits.get(ip) || []).filter((t) => now - t < windowMs);
  hits.set(ip, [...recent, now]);
  return recent.length >= maxReq;
}

// Chat (same guardrails from Day‑9/10)
app.post("/chat", (req, res) => {
  try {
    if (rateLimit(req)) {
      return res
        .status(429)
        .json({
          error: {
            code: "RATE_LIMIT",
            message: "Too many requests, slow down.",
          },
        });
    }
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
    if (!trimmed) {
      return res
        .status(400)
        .json({
          error: { code: "INPUT_EMPTY", message: "Message cannot be empty" },
        });
    }
    const MAX_LEN = 500;
    if (trimmed.length > MAX_LEN) {
      return res
        .status(413)
        .json({
          error: {
            code: "INPUT_TOO_LONG",
            message: `Message too long (max ${MAX_LEN} chars)`,
          },
        });
    }

    const safeMessage = trimmed.replace(/\s+/g, " ").slice(0, MAX_LEN);
    const reply = {
      summary: "User sent a greeting message.",
      keyPoints: [
        "Message received successfully",
        "Backend API is functioning correctly",
      ],
      nextActions: ["Integrate real AI provider", "Enhance frontend rendering"],
      _meta: { inputPreview: safeMessage.slice(0, 50) },
    };

    return res.json({ reply });
  } catch (e) {
    console.error("chat error:", e);
    return res
      .status(500)
      .json({
        error: { code: "SERVER_ERROR", message: "Unexpected server error" },
      });
  }
});

export default app;
