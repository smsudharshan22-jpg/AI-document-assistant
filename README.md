# ⚡ AI-Document-assistant – AI PDF Search Copilot

A full-stack AI-powered app to upload PDFs and chat with them using Claude AI.

## Features
- 📄 Upload PDF & extract all text
- 🤖 Ask questions in natural language
- 💬 Multi-turn conversation with memory
- 🔍 Highlights relevant source sections in answers

## Project Structure
```
ai-search-copilot/
├── backend/
│   ├── app.py              # Flask API
│   └── requirements.txt
└── frontend/
    ├── src/
│   │   ├── App.jsx         # Main React component
│   │   ├── App.css         # Styles
│   │   └── main.jsx        # Entry point
    ├── index.html
    ├── package.json
    └── vite.config.js
```

## Setup & Run

### 1. Backend (Flask)
```bash
cd backend
pip install -r requirements.txt
export ANTHROPIC_API_KEY=your_api_key_here   # Windows: set ANTHROPIC_API_KEY=...
python app.py
# Runs on http://localhost:5000
```

### 2. Frontend (React)
```bash
cd frontend
npm install
npm run dev
# Runs on http://localhost:3000
```

### 3. Open in browser
Go to: **http://localhost:3000**

## API Endpoints
| Method | Endpoint  | Description                        |
|--------|-----------|------------------------------------|
| POST   | /upload   | Upload PDF, returns session_id     |
| POST   | /ask      | Ask a question, returns AI answer  |
| POST   | /clear    | Clear chat history for a session   |
| GET    | /health   | Health check                       |

## How It Works
1. User uploads a PDF → Flask extracts text using PyMuPDF
2. A `session_id` is created with the PDF text + chat history stored in memory
3. On each question, Flask sends PDF context + chat history to Claude API
4. Claude returns an answer with `<highlight>` tags around relevant quotes
5. React frontend renders highlights with a visual purple highlight style

## Tech Stack
- **Backend**: Python, Flask, PyMuPDF, Anthropic SDK
- **Frontend**: React 18, Vite, CSS Variables
- **AI**: Claude Sonnet (claude-sonnet-4-6)

## Notes
- Sessions are stored in-memory (restart clears all sessions)
- Max ~12,000 characters of PDF text sent per request (fits most docs)
- For production: use Redis/DB for session storage
