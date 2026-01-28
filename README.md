# 🧠 AI Chat Backend (Node.js + Express)

This is the backend service for the **AI Chat Application**, providing a secure, validated, structured response API for chat messages.  
It is built using **Node.js**, **Express**, and deployed on **Render**.  
This backend powers the AI chat frontend hosted on Vercel.

---

## 🚀 Features

- **POST /chat** endpoint with:
  - Input validation (type, empty, max length)
  - Lightweight rate‑limiting (dev-friendly)
  - Structured AI-style responses:
    - Summary
    - Key Points
    - Next Actions
- **Security best practices**
  - `helmet` for secure HTTP headers
  - Strict CORS via `ALLOWED_ORIGINS`
  - Request ID tracing using `uuid`
  - Centralized error handler (consistent JSON format)
- **Logging**
  - Clean, traceable logs with `morgan`
  - `X-Request-ID` returned in response headers for debugging
- Health checks (`/health`)
- Production-ready config structure (`config.js`)

---

# 🏗️ Architecture

```mermaid
flowchart LR
    subgraph Browser[User Browser]
        UI[React Frontend (Vercel)]
    end

    subgraph Backend[Node.js + Express (Render)]
        API[/POST /chat/]
        HEALTH[/GET /health/]
        Guardrails[Validation + Rate-limit + Error Handler]
    end

    UI -- sends JSON message --> API
    API --> Guardrails
    Guardrails -- returns structured JSON --> UI
    UI --> Browser
```
