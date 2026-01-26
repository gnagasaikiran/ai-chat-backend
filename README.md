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
