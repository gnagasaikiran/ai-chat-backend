import dotenv from "dotenv";
dotenv.config();

/**
 * Validate and normalize environment variables.
 * Keep this tiny and dependency-free.
 */
function parseAllowedOrigins(raw) {
  if (!raw) return [];
  return raw
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
}

const PORT = Number(process.env.PORT || 3000);
if (!Number.isFinite(PORT)) {
  throw new Error("ENV_INVALID: PORT must be a number");
}

const NODE_ENV = process.env.NODE_ENV || "development";
const ALLOWED_ORIGINS = parseAllowedOrigins(process.env.ALLOWED_ORIGINS || "");

export const config = {
  PORT,
  NODE_ENV,
  ALLOWED_ORIGINS, // [] means allow none (we can still allow no-origin tools like curl/Postman)
};
