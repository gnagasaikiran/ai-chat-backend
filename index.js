import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import { v4 as uuid } from "uuid";
import { config } from "./config.js";

/** ---------------- App setup ---------------- */
const app = express();

/** Security headers */
app.use(helmet()); // safe defaults

/** Request ID for tracing across logs */
app.use((req, _res, next) => {
  req.id = uuid();
  next();
});

/** Access logs (with request id) */
morgan.token("id", (req) => req.id);
app.use(
  morgan(":id :method :url :status :res[content-length] - :response-time ms"),
);

/** JSON parser (limit kept small) */
app.use(express.json({ limit: "1mb" }));

/** Strict CORS: allow known origins from env, allow no-origin tools (curl/Postman) */
const allowed = new Set(config.ALLOWED_ORIGINS);
app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin) return callback(null, true); // allow curl/Postman
      if (allowed.size === 0) return callback(null, false); // explicit block if empty
      if (allowed.has(origin)) return callback(null, true);
      return callback(new Error("CORS_NOT_ALLOWED"), false);
    },
    methods: ["GET", "POST", "OPTIONS"],
    credentials: false,
  }),
);

/** ---------------- Routes ---------------- */
app.get("/health", (_req, res) => {
  res.json({ status: "ok" });
});

const hits = new Map(); // (IP -> timestamps)
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

// Chat route with guardrails from Day 9, now with better error flow
app.post("/chat", (req, res, next) => {
  try {
    if (rateLimit(req)) {
      const err = new Error("Too many requests, slow down.");
      err.status = 429;
      err.code = "RATE_LIMIT";
      throw err;
    }

    const { message } = req.body || {};
    if (typeof message !== "string") {
      const err = new Error("`message` must be a string");
      err.status = 400;
      err.code = "INPUT_INVALID_TYPE";
      throw err;
    }
    const trimmed = message.trim();
    if (!trimmed) {
      const err = new Error("Message cannot be empty");
      err.status = 400;
      err.code = "INPUT_EMPTY";
      throw err;
    }
    const MAX_LEN = 500;
    if (trimmed.length > MAX_LEN) {
      const err = new Error(`Message too long (max ${MAX_LEN} chars)`);
      err.status = 413;
      err.code = "INPUT_TOO_LONG";
      throw err;
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
    next(e);
  }
});

/** ---------------- Central error handler ---------------- */
app.use((err, req, res, _next) => {
  // Map error to status/code safely
  const status = Number(err.status) || 500;
  const code = err.code || (status >= 500 ? "SERVER_ERROR" : "BAD_REQUEST");

  // Log minimal, avoid PII; include request id for tracing
  const log = {
    reqId: req.id,
    path: req.path,
    status,
    code,
    msg: err.message,
  };
  if (config.NODE_ENV !== "production") {
    // In non-prod, include stack for debugging
    log.stack = err.stack;
  }
  console.error("[ERROR]", JSON.stringify(log));

  // Consistent client shape
  res.status(status).json({
    error: { code, message: err.message || "Unexpected server error" },
  });
});

/** ---------------- Start server ---------------- */
app.listen(config.PORT, () => {
  console.log(
    `✅ Server ready on http://localhost:${config.PORT} | env=${config.NODE_ENV}`,
  );
});
