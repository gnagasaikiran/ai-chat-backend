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
