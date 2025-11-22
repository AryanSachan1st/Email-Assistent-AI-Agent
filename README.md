Prompt-Driven Email Productivity AgentThis project implements an intelligent, full-stack Email Productivity Agent capable of processing a mock inbox, categorizing emails, extracting action items, and interacting with the user via a chat interface, all guided by external, editable LLM prompts.

🚀 Key Features

Prompt-Driven Logic (Agent Brain): LLM behavior is governed by dynamic prompts, allowing user control over categorization rules and drafting tone.
Phase 1: Ingestion Pipeline: Automated batch processing to tag all emails with Category and Action Items upon request. (Uses local simulation to avoid quota issues for demo).
Phase 2: Email Agent Chat: Real-time interaction with a single, selected email (e.g., summarize, draft replies) using the OpenAI API.
Full-Stack Architecture: Built with a React frontend and a Node.js/Express backend.

📦 Project StructureThe application is split into two main directories:-

prompt-driven-agent/
├── backend/                  # Node.js / Express Server (API and LLM orchestration)
│   ├── src/
│   │   ├── data/             # Mock Inbox (mockEmails.json) and Prompts (prompts.json)
│   │   └── services/         # Core logic (promptService.js, llmService.js)
│   ├── server.js             # Main server setup and API routing
├── frontend/                 # React Application (UI and API calls)
│   ├── src/
│   │   └── App.js            # Consolidated UI components (EmailList, ChatInterface)
├── .gitignore                # Ensures sensitive files are not committed
└── README.md

⚙️ Setup Instructions-
Follow these steps to get both the backend and frontend servers running.
Prerequisites
Node.js: (v18 or higher)
OpenAI API Key: Required for the real-time chat agent.

1. Backend Setup-
The backend handles the API and LLM communication.

# Navigate to the backend directory
cd backend

# Install dependencies (express, cors, axios, dotenv)
npm install

# Create the environment file
touch .env

Configuration (backend/.env):Edit the .env file and add your OpenAI API Key and the server port:

# CRITICAL: Replace with your actual key (starts with sk-...)
OPENAI_API_KEY="YOUR_OPENAI_API_KEY_HERE"

# Port for the API server
PORT=3001
Run the Backend:

# Start the Express server
node server.js

# Output should confirm: "Backend Server running on http://localhost:3001"
2. Frontend SetupThe frontend hosts the user interface.

# Navigate to the frontend directory
cd ../frontend

# Install dependencies (react, react-dom, and necessary tooling)
npm install

# Create the environment file
touch .env
Configuration (frontend/.env):This file tells the React app where to find the running backend.

# Must match the PORT set in backend/.env
REACT_APP_BACKEND_PORT=3001
# The port the React development server runs on (usually 3000)
# This may be set by your tooling automatically, but is good practice:
PORT=3000 

Run the Frontend:
# Start the React development server
npm start
