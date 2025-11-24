import express from 'express';
import cors from 'cors';
import 'dotenv/config'; 
import { createLLMPrompt } from './src/services/promptService.js';
import { callLLMApi } from './src/services/llmService.js';
// Assuming mockEmails.json is in the data folder and contains the full inbox
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const mockEmailsPath = path.join(__dirname, 'src/data/mockEmails.json');
const mockEmails = JSON.parse(fs.readFileSync(mockEmailsPath, 'utf-8'));


const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// --- GET /api/emails ---
// 1. Initial Load: Returns the current state of the inbox to the frontend.
app.get('/api/emails', (req, res) => {
  res.json(mockEmails);
});

// --- POST /api/agent-query ---
// 2. Real-Time Chat: Uses the REAL LLM for single-email interaction (Phase 2).
app.post('/api/agent-query', async (req, res) => {
  const { emailId, userInstruction } = req.body;

  if (!emailId || !userInstruction) {
    return res.status(400).json({ error: 'Missing emailId or userInstruction' });
  }

  try {
    // Orchestrates the prompt: Email Content + Stored Prompt + User Instruction
    const fullPrompt = createLLMPrompt(emailId, userInstruction);
    if (fullPrompt.startsWith("Error:")) {
        return res.status(404).json({ error: fullPrompt });
    }
    
    // Call the real OpenAI API
    const llmResponse = await callLLMApi(fullPrompt); 
    res.json({ response: llmResponse });

  } catch (error) {
    console.error('Error processing agent query:', error);
    res.status(500).json({ error: error.message });
  }
});

// --- POST /api/batch-process ---
// 3. Simulated Ingestion Pipeline (Phase 1)
// Uses local keyword logic to categorize and extract actions, avoiding quota errors.
app.post('/api/batch-process', async (req, res) => {
    console.log("Starting Batch Ingestion Pipeline (Simulation Mode)...");

    const enrichedEmails = mockEmails.map(email => {
        let category = "General";
        let actionItems = [];
        // Combine subject and body for keyword matching
        const text = (email.subject + " " + email.body).toLowerCase();

        // 1. Simulated Categorization Logic
        if (text.includes("urgent") || text.includes("critical") || text.includes("deadline") || text.includes("outage")) {
            category = "Urgent";
        } else if (text.includes("meeting") || text.includes("schedule") || text.includes("invite") || text.includes("kickoff")) {
            category = "Meeting";
        } else if (text.includes("newsletter") || text.includes("digest") || text.includes("tips")) {
            category = "Newsletter";
        } else if (text.includes("payment") || text.includes("invoice") || text.includes("price") || text.includes("cost")) {
            category = "Financial";
        } else if (text.includes("hr") || text.includes("benefits") || text.includes("enrollment")) {
            category = "HR/Admin";
        } else if (text.includes("party") || text.includes("dinner") || text.includes("family")) {
            category = "Personal";
        }

        // 2. Simulated Action Item Extraction Logic
        if (text.includes("report") && text.includes("need")) actionItems.push({ task: "Prepare/Review Report" });
        if (text.includes("join") && text.includes("bridge")) actionItems.push({ task: "Join Meeting/Bridge" });
        if (text.includes("reply")) actionItems.push({ task: "Draft Reply" });
        if (text.includes("accept") && text.includes("invite")) actionItems.push({ task: "Update Calendar" });
        if (text.includes("review") && text.includes("peer")) actionItems.push({ task: "Complete Peer Review" });
        if (text.includes("log into") || text.includes("portal")) actionItems.push({ task: "Log into HR Portal" });

        // Update the object in memory 
        email.category = category;
        email.actionItems = actionItems;
        
        return email;
    });

    // Artificial delay to simulate processing time
    await new Promise(resolve => setTimeout(resolve, 1000));

    console.log("Batch Ingestion Complete. Emails updated locally.");
    // Return the updated list to the frontend
    res.json({ message: "Ingestion successful (Simulated)", data: enrichedEmails });
});

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Backend Server running on http://localhost:${PORT}`);
});