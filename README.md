# Bruno AI Chatbot

Bruno is a local AI chatbot with a React and Vite frontend, a FastAPI backend, and an Ollama-hosted Llama 3.2 model. Model inference runs on the machine running Ollama; no hosted model API key is required.

## Features

- Conversational chat with per-session history
- Clear-chat action
- Request validation and user-facing backend errors
- Health endpoint for checking the API
- Locally hosted language model through Ollama

## Project structure

```text
Chatbot-project/
├── Project/
│   ├── chatbot.py
│   └── requirements.txt
└── chatbot-app/
    ├── package.json
    └── src/
```

## Requirements

- Python 3.10 or newer
- Node.js and npm
- [Ollama](https://ollama.com/download) installed and running
- The `llama3.2` model downloaded in Ollama

Download the model before starting the application:

```bash
ollama pull llama3.2
```

Keep Ollama running while using chat. If it is not already running as a background service, start it in a separate terminal with `ollama serve`.

## Run locally

Open two terminals from the repository root.

### 1. Start the FastAPI backend

```bash
cd Project
python3 -m venv venv
source venv/bin/activate
python -m pip install --upgrade pip
python -m pip install -r requirements.txt
python -m uvicorn chatbot:app --reload --host 127.0.0.1 --port 8000
```

On Windows PowerShell, activate the environment with:

```powershell
.\venv\Scripts\Activate.ps1
```

The API should now be available at `http://127.0.0.1:8000`. Check it at `http://127.0.0.1:8000/health`; interactive API documentation is at `http://127.0.0.1:8000/docs`.

### 2. Start the frontend

From the repository root, in a second terminal:

```bash
cd chatbot-app
npm ci
npm run dev
```

Open the local URL printed by Vite (usually `http://localhost:5173`).

## API overview

| Method | Endpoint | Purpose |
| --- | --- | --- |
| `GET` | `/health` | Returns the backend status and configured model name |
| `POST` | `/chat` | Sends a question and returns the answer and session ID |
| `POST` | `/clear` | Clears the conversation history for a session |

Example chat request:

```json
{
  "question": "Hello!",
  "session_id": ""
}
```

The `session_id` may be empty to start a session; the response includes the ID to use for later requests. Questions must contain 1-2000 characters. Conversation history is held in backend memory, limited to the most recent 10 exchanges per session, and is lost when the backend process stops.

## Troubleshooting

- **The frontend cannot reach the backend:** Confirm Uvicorn is running on `127.0.0.1:8000`, then open `/health`.
- **Chat returns a 503 error:** Confirm Ollama is running and `ollama list` shows `llama3.2`. If it is missing, run `ollama pull llama3.2`.
- **The frontend dependencies are missing:** Run `npm ci` inside `chatbot-app`.

## Development checks

Build the frontend:

```bash
cd chatbot-app
npm run build
```

Run the frontend linter:

```bash
npm run lint
```
