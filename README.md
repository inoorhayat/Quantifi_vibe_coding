# AI Chat Assistant

A full-stack AI chat application with real-time streaming responses, conversation history, a tone selector, and support for stopping and regenerating replies. The frontend is built with React and Tailwind CSS, the backend with Node.js and Express, and conversations are stored in MongoDB. Replies come from the Anthropic Claude API.

---

## Features

### Core features

- **Chat interface:** A scrollable conversation view with separate bubbles for the user and the assistant.
- **Real-time streaming:** Replies appear token by token as the model generates them, using Server-Sent Events (SSE). The text is not faked with a timer.
- **Conversation history:** A sidebar lists past conversations, sorted by most recent activity. Selecting one reloads its full message history.
- **Persistence:** Every conversation is saved to MongoDB with its messages, timestamps, and the tone used for each message.
- **Tone toggle:** Choose **Professional**, **Casual**, or **Concise**. The selected tone is sent to the backend as a system instruction, so the next reply changes style immediately.
- **New chat and delete:** Start a fresh conversation or remove an old one from the sidebar.

### Additional features

- **Stop generation:** While a reply is streaming, the send button becomes a Stop button. Pressing it cancels the request in the browser and aborts the upstream call to the LLM on the server. The partial reply is saved, so nothing generated so far is lost.
- **Regenerate response:** After a reply finishes, a Regenerate button appears under it. It asks the same question again using the currently selected tone and replaces the previous answer. The conversation keeps the same number of messages.
- **Markdown rendering:** Replies support bold text, bullet and numbered lists, headings, and links.
- **Code blocks with copy button:** Fenced code blocks are displayed on a dark background. A copy button appears on hover and confirms when the code has been copied.
- **Inline code styling:** Short code snippets inside a sentence are highlighted separately from full code blocks.
- **Animated UI:** Message bubbles animate in, and the tone toggle uses a sliding highlight.
- **Dark mode:** The interface follows the system color scheme.
- **Error handling:** Failed requests show a friendly message in the chat instead of breaking the page. The server logs the full error for debugging.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React, Vite, Tailwind CSS, Framer Motion, react-markdown, Lucide icons |
| Backend | Node.js, Express |
| Database | MongoDB with Mongoose |
| AI provider | Anthropic Claude API (`@anthropic-ai/sdk`) |
| Streaming | Server-Sent Events (SSE) |

---

## Architecture

```
React (Vite + Tailwind)
   │  fetch + SSE stream
   ▼
Express API ──► Controller ──► LLM Service (provider adapter)
   │                               │
   ▼                               ▼
MongoDB (Mongoose)           Claude API
```

**Design decisions:**

- **Stateless API:** No session data is kept in server memory, so several instances can run behind a load balancer.
- **Provider adapter:** Controllers don't import the AI SDK directly. To switch models or add OpenAI, only the `services/llm` folder changes.
- **Real streaming:** Tokens are forwarded to the browser as they arrive from the model.
- **Layered backend:** Routes, controllers, services, and models are separate, which makes each layer easier to test and change.
- **Secrets stay on the server:** The API key is read from environment variables and is never sent to the browser.

---

## Project Structure

```
Quantifi_Vibe_coding/
├── server/
│   ├── .env.example
│   ├── package.json
│   └── src/
│       ├── config/
│       │   └── db.js                      # MongoDB connection
│       ├── models/
│       │   └── Conversation.js            # Conversation and message schema
│       ├── routes/
│       │   ├── chat.routes.js             # POST /api/chat/stream
│       │   └── conversation.routes.js     # History endpoints
│       ├── controllers/
│       │   ├── chat.controller.js         # Streaming, stop, and regenerate logic
│       │   └── conversation.controller.js # List, fetch, and delete
│       ├── services/
│       │   ├── tone.js                    # Tone to system prompt mapping
│       │   └── llm/
│       │       ├── index.js               # Selects the active provider
│       │       └── anthropic.provider.js  # Claude streaming adapter
│       ├── middleware/
│       │   └── errorHandler.js
│       ├── app.js                         # Express app setup
│       └── server.js                      # Entry point
├── client/
│   ├── .env.example
│   ├── package.json
│   └── src/
│       ├── api/
│       │   └── chatApi.js                 # HTTP and SSE client
│       ├── hooks/
│       │   └── useChat.js                 # Chat state and streaming logic
│       ├── components/
│       │   ├── Sidebar.jsx                # New chat, history, delete
│       │   ├── ChatWindow.jsx             # Message list and regenerate button
│       │   ├── MessageBubble.jsx          # Markdown, code blocks, copy button
│       │   ├── ChatInput.jsx              # Input, send, and stop
│       │   └── ToneToggle.jsx             # Tone selector
│       ├── App.jsx
│       ├── main.jsx
│       └── index.css                    # Tailwind entry
├── .gitignore
└── README.md
```

---

## Prerequisites

- [Node.js](https://nodejs.org/) 18 or later
- [MongoDB](https://www.mongodb.com/) running locally, or a free [MongoDB Atlas](https://www.mongodb.com/atlas) cluster
- An [Anthropic API key](https://console.anthropic.com/)
- Git (optional, for version control)

---

## Getting Started

### 1. Clone the repository

```bash
git clone <your-repo-url>
cd Quantifi_Vibe_coding
```

### 2. Set up the backend

```bash
cd server
npm install
cp .env.example .env
```

Open `server/.env` and fill in your values (see [Environment Variables](#environment-variables)). Then start the server:

```bash
npm run dev
```

You should see:

```
MongoDB connected
Server running on port 5000
```

### 3. Set up the frontend

Open a second terminal:

```bash
cd client
npm install
cp .env.example .env
npm run dev
```

Open **http://localhost:5173** in your browser.

---

## Environment Variables

### Backend (`server/.env`)

| Variable | Example | Description |
|---|---|---|
| `PORT` | `5000` | Port the Express server listens on |
| `MONGO_URI` | `mongodb://127.0.0.1:27017/ai-chat` | MongoDB connection string |
| `CLIENT_URL` | `http://localhost:5173` | Allowed frontend origin for CORS |
| `ANTHROPIC_API_KEY` | `sk-ant-...` | Your Anthropic API key. Keep it secret. |
| `LLM_PROVIDER` | `anthropic` | Which provider adapter to use |
| `LLM_MODEL` | `claude-sonnet-5-5` | Model name passed to the provider |

### Frontend (`client/.env`)

| Variable | Example | Description |
|---|---|---|
| `VITE_API_URL` | `http://localhost:5000/api` | Base URL of the backend API |

> Only variables prefixed with `VITE_` are exposed to the browser. Never put the API key in a `VITE_` variable.

---

## API Reference

Base URL: `http://localhost:5000/api`

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/health` | Health check. Returns `{ "status": "ok" }`. |
| `POST` | `/chat/stream` | Sends a message and streams the reply (SSE) |
| `GET` | `/conversations?page=1` | Lists conversations, 30 per page, newest first |
| `GET` | `/conversations/:id` | Returns one conversation with all its messages |
| `DELETE` | `/conversations/:id` | Deletes a conversation |

### `POST /chat/stream`

Request body:

```json
{
  "conversationId": "optional, omit to start a new chat",
  "content": "Explain deadlocks",
  "tone": "professional | casual | concise",
  "regenerate": false
}
```

- Set `regenerate: true` to answer the last user message again. In this case `content` is not needed.
- If the browser closes the connection, the server cancels the LLM request and saves any partial reply.

The response is a stream of events, each sent as `data: {...}`:

| Event type | Payload | When |
|---|---|---|
| `meta` | `conversationId` | First event, once the conversation is known |
| `delta` | `text` | Each text chunk from the model |
| `done` | `conversationId`, `title` | The reply is complete and saved |
| `error` | `message` | Something failed |

---

## Tone Modes

| Tone | Behavior |
|---|---|
| Professional | Formal, precise, and well-structured |
| Casual | Friendly and conversational |
| Concise | Short sentences, no filler |

The tone is added to the system prompt on every request, so changing it affects the very next reply.

---

## Testing the Features

1. **Streaming:** Ask a question that needs a long answer, such as "Explain CPU scheduling algorithms". The text should appear gradually.
2. **Stop:** Press the Stop button during a long reply. Refresh the page and reopen the conversation. The partial reply should still be there.
3. **Regenerate:** After a reply finishes, click Regenerate. The answer changes, and the message count stays the same.
4. **Tone:** Ask the same question in all three tones and compare the length and style.
5. **Code:** Ask "write a Python function to reverse a string". Check that the code block has a copy button and that inline code like `len()` is styled differently.
6. **History:** Create two chats, switch between them, and delete one.

---

## Deployment

The frontend and backend are deployed separately.

| Part | Platform | Notes |
|---|---|---|
| Frontend (`client`) | Vercel or Render Static Site | Root directory `client`. Set `VITE_API_URL` before building. |
| Backend (`server`) | Render Web Service | Build command `npm install`, start command `npm start`. Set all backend variables. |
| Database | MongoDB Atlas | Allow network access for the Render service. |

After deploying, set `CLIENT_URL` on the backend to your frontend URL, without a trailing slash. Otherwise the browser will block requests because of CORS.

---

## Troubleshooting

| Problem | Solution |
|---|---|
| "Sorry, something went wrong" in the chat | Check the server terminal. Common causes are a wrong `MONGO_URI`, an invalid `ANTHROPIC_API_KEY`, or the server not running. |
| `404` on `/api/chat/stream` | Make sure `app.js` mounts the chat routes and the server was restarted after the change. |
| CORS error in the browser console | `CLIENT_URL` must match the frontend URL exactly. |
| Page has no styling | Confirm `index.css` contains `@import "tailwindcss";` and that `main.jsx` imports it. |
| Frontend calls `localhost` in production | `VITE_API_URL` was not set at build time. Set it and redeploy. |
| Module not found errors in `client` | Run `npm install` inside `client`, then restart `npm run dev`. |
| First request is slow on Render | The free tier sleeps when idle. The first request after a pause can take 30–60 seconds. |

---

## Possible Improvements

- User accounts with authentication (JWT or OAuth), so each user sees only their own conversations
- Rate limiting with `express-rate-limit` to protect the API key
- Rename conversations and export them as Markdown or PDF
- Dark mode toggle that is saved in local storage
- Image or file upload for multimodal questions
- Support for OpenAI as a second provider through the existing adapter

---

## License

This project is for educational purposes.