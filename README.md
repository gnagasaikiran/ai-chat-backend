## AI Chat Backend

Node.js + Express backend for an AI chat application.

### Features

- /health API for service checks
- /chat API to process user messages
- Input validation & error handling
- CORS enabled for frontend integration

### Tech Stack

- Node.js
- Express
- CORS

### Run Locally

npm install  
node index.js

### API

POST /chat  
Body:
{
"message": "Hello"
}

## AI Prompt Design

The backend uses a system prompt to control AI behavior and ensure:

- predictable responses
- structured output
- enterprise‑friendly communication

Current implementation uses a mock AI, but the architecture is ready for real LLM integration.

## Guardrails & Reliability

The `/chat` endpoint implements basic enterprise-friendly guardrails:

- **Input validation**
  - Rejects non-string inputs (`400 INPUT_INVALID_TYPE`)
  - Rejects empty messages (`400 INPUT_EMPTY`)
  - Rejects over-long inputs (default: 500 chars, `413 INPUT_TOO_LONG`)
- **Rate limiting**
  - Simple in-memory dev limiter: 5 requests per 15 seconds per IP (`429 RATE_LIMIT`)
- **Consistent error shape**
  - Errors returned as `{ "error": { "code": "...", "message": "..." } }`
- **Safe logging**
  - Server logs unexpected failures with minimal data; avoid secrets/PII

This provides a baseline for production hygiene and can be replaced with
Redis-backed rate limiters, centralized logging, and stricter CORS in real deployments.

## Security & Production Hygiene

- **Secure headers** via `helmet` (XSS/clickjacking mitigations).
- **Strict CORS**: allowed origins are configured via `ALLOWED_ORIGINS`
  (comma-separated), e.g. `https://app.vercel.app,http://localhost:5173`.
  Requests with no `Origin` header (curl/Postman) are allowed for testing.
- **Request correlation**: every request includes a UUID-based request id
  logged through `morgan` for traceability.
- **Centralized error handler**: all errors return a consistent shape
  `{ "error": { "code", "message" } }`; server logs avoid sensitive data.
- **Env validation**: `config.js` validates `PORT` and parses `ALLOWED_ORIGINS`.
- **Body size limit**: `express.json({ limit: "1mb" })` to avoid large payloads.
- **Rate limiting**: a simple in-memory limiter for demos;
  replace with Redis-backed limiter for multi-instance setups in production.
