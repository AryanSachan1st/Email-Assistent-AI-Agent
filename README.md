# 📧 Prompt-Driven Email Productivity Agent  
A full-stack intelligent **Email Productivity Agent** that processes inbox data, categorizes emails, extracts action items, and interacts with the user through a chat interface — all powered by **prompt-driven LLM logic**.

The agent’s entire reasoning behavior (categorization, tone, extraction rules, reply style) is controlled through editable JSON prompt files.  
No code changes required — just update the prompts.

---

## 🚀 Features

### 🧠 **Dynamic Prompt-Driven Logic**
- You define how the LLM behaves using prompts in `prompts.json`.
- Change rules, tones, or workflows instantly.

### 📨 **Phase 1 — Email Ingestion Pipeline**
- Batch-processes all mock emails.
- Automatically assigns:
  - **Category**
  - **Action Items**
- Runs offline using mock data to avoid API quota usage.

### 💬 **Phase 2 — Interactive Email Agent Chat**
- Chat with the agent about any selected email.
- Capabilities:
  - Summaries
  - Reply drafting
  - Action extraction
  - Custom user tasks
- Powered by the **OpenAI API**.

### 🖥️ **Full-Stack System**
- **Frontend:** React UI for email view + interactive chat.
- **Backend:** Node.js + Express with modular prompt + LLM service architecture.

---

## 📁 Project Structure
```bash
prompt-driven-agent/
├── backend/
│ ├── src/
│ │ ├── data/ # Mock inbox & prompts
│ │ └── services/ # LLM + prompt orchestration
│ ├── server.js # Express backend entrypoint
│
├── frontend/
│ ├── src/
│ │ └── App.js # Main UI (EmailList + ChatInterface)
│
├── .gitignore
└── README.md
```

---

## ⚙️ Setup Instructions

### **Prerequisites**
- Node.js v18+
- OpenAI API Key

---

## 🛠️ Backend Setup
```bash
cd backend
npm install
touch .env
```

Add environment variables:
```bash
OPENAI_API_KEY=YOUR_OPENAI_API_KEY
PORT=3001
```

Run the backend:
```bash
node server.js
```

You should see:
```bash
Backend Server running on http://localhost:3001
```

## 💻 Frontend Setup
```bash
cd ../frontend
npm install
touch .env
```

Add environment variables:
```bash
REACT_APP_BACKEND_PORT=3001
PORT=3000
```

Start the frontend:
```bash
npm start
```