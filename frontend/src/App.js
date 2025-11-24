import React, { useState, useEffect, useMemo } from 'react';

// Using environment variables for both ports
// Backend base URL (local + production)
const BACKEND_PORT = process.env.REACT_APP_BACKEND_PORT || 3001;
const API_BASE_URL =
  (process.env.REACT_APP_API_BASE || `http://localhost:${BACKEND_PORT}`) + '/api';

// Just for displaying UI origin in the footer (optional)
const UI_ORIGIN =
  typeof window !== 'undefined' ? window.location.origin : '';

// --- 1. EmailList Component (Consolidated) ---
const EmailList = ({ emails, selectedEmailId, onSelectEmail }) => (
    <div className="space-y-2 overflow-y-auto max-h-[60vh] md:max-h-[calc(100vh-250px)]">
        {emails.length === 0 && <p className="text-gray-500 italic text-center py-4">Loading emails...</p>}
        {emails.map((email) => (
            <div
                key={email.id}
                onClick={() => onSelectEmail(email.id)}
                className={`p-3 border rounded-lg cursor-pointer transition-all ${
                    selectedEmailId === email.id 
                        ? 'bg-blue-100 border-blue-500 shadow-md ring-2 ring-blue-400' 
                        : 'bg-gray-50 hover:bg-gray-100 border-gray-200'
                }`}
            >
                <div className="flex justify-between items-start">
                    <p className="font-semibold truncate text-sm">{email.subject}</p>
                    <span className="text-xs text-gray-500 min-w-max ml-2">{new Date(email.timestamp).toLocaleDateString()}</span>
                </div>
                <p className="text-xs text-gray-700 truncate mt-1">
                    <span className="font-medium">From:</span> {email.sender}
                </p>
                <div className="mt-2 flex flex-wrap gap-2">
                    {/* Logic to determine pill color based on category */}
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                        !email.category || email.category === 'General' ? 'bg-gray-100 text-gray-600' : 
                        email.category === 'Urgent' ? 'bg-red-100 text-red-800' : 
                        'bg-indigo-100 text-indigo-700'
                    }`}>
                        {email.category || 'Uncategorized'}
                    </span>
                    {email.actionItems && email.actionItems.length > 0 && (
                        <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-green-100 text-green-700">
                            {email.actionItems.length} Task(s)
                        </span>
                    )}
                </div>
            </div>
        ))}
    </div>
);


// --- 2. ChatInterface Component (Consolidated) ---
const ChatInterface = ({ selectedEmailId, apiBaseUrl }) => {
    const [input, setInput] = useState('');
    const [chatHistory, setChatHistory] = useState([]);
    const [loading, setLoading] = useState(false);

    // Clear history when switching emails
    useEffect(() => {
        setChatHistory([]);
    }, [selectedEmailId]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!input.trim() || !selectedEmailId) return;

        const userInstruction = input;
        setChatHistory(prev => [...prev, { sender: 'user', message: userInstruction }]);
        setInput('');
        setLoading(true);

        try {
            // Call the Backend's Chat Agent (Real LLM)
            const response = await fetch(`${apiBaseUrl}/agent-query`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    emailId: selectedEmailId,
                    userInstruction: userInstruction,
                }),
            });
            
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Backend request failed.');
            }

            const data = await response.json();
            setChatHistory(prev => [...prev, { sender: 'agent', message: data.response }]);

        } catch (error) {
            console.error('Error processing agent query:', error);
            setChatHistory(prev => [...prev, { sender: 'agent', message: `Error: ${error.message}` }]);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div>
            <h3 className="text-xl font-semibold mb-4 text-blue-900">
                Email Agent Chat <span className="text-sm font-normal text-gray-500">(Ask about the selected email)</span>
            </h3>

            <div className="chat-container">
                <div className="chat-messages">
                    {chatHistory.length === 0 && (
                        <p className="text-center text-gray-400 italic mt-10">
                            Select an email and ask me to summarize it, draft a reply, or extract tasks!
                        </p>
                    )}
                    {chatHistory.map((msg, index) => (
                        <div key={index} className={`message-bubble ${msg.sender}-message`}>
                            <p className="message-sender">{msg.sender === 'user' ? 'You' : 'Agent'}</p>
                            <p className="whitespace-pre-wrap text-sm">{msg.message}</p>
                        </div>
                    ))}
                    {loading && (
                        <div className="agent-message message-bubble">
                            <p className="message-sender">Agent</p>
                            <p className="text-sm italic animate-pulse">Thinking...</p>
                        </div>
                    )}
                </div>
                
                <form onSubmit={handleSubmit} className="p-4 border-t border-gray-200 bg-white flex flex-col sm:flex-row gap-2 sm:gap-0">
                    <input 
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder={selectedEmailId ? "Draft a reply asking about Tuesday..." : "Please select an email first."}
                        disabled={!selectedEmailId || loading}
                        className="flex-grow p-3 border border-gray-300 rounded-lg sm:rounded-r-none sm:rounded-l-lg focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-50"
                    />
                    <button 
                        type="submit" 
                        disabled={!selectedEmailId || loading}
                        className="px-6 py-3 bg-blue-600 text-white font-medium rounded-lg sm:rounded-l-none sm:rounded-r-lg hover:bg-blue-700 transition-colors disabled:bg-blue-300 w-full sm:w-auto"
                    >
                        Send
                    </button>
                </form>
            </div>
        </div>
    );
};


// --- 3. Main App Component ---
function App() {
  const [emails, setEmails] = useState([]); // Start empty, fetch later
  const [selectedEmailId, setSelectedEmailId] = useState(null);
  const [selectedEmail, setSelectedEmail] = useState(null);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState('');

  // 1. Fetch Emails from Backend on Mount
  useEffect(() => {
      const fetchEmails = async () => {
          try {
              const res = await fetch(`${API_BASE_URL}/emails`);
              if (!res.ok) throw new Error("Failed to load emails");
              const data = await res.json();
              setEmails(data);
          } catch (err) {
              console.error("Error fetching emails:", err);
          }
      };
      fetchEmails();
  }, []);

  // 2. Update Selected Email
  useEffect(() => {
    const email = emails.find(e => e.id === selectedEmailId);
    setSelectedEmail(email);
  }, [selectedEmailId, emails]);

  // 3. Filter Logic
  const filteredEmails = useMemo(() => {
    if (!filter) return emails;
    const lowerFilter = filter.toLowerCase();

    return emails.filter(email =>
      (email.category && email.category.toLowerCase().includes(lowerFilter)) ||
      email.subject.toLowerCase().includes(lowerFilter) ||
      (email.actionItems && email.actionItems.some(item => item.task.toLowerCase().includes(lowerFilter)))
    );
  }, [emails, filter]);

  // 4. INGESTION TRIGGER (Calls Backend Simulation)
  const runIngestionPipeline = async () => {
    setLoading(true);
    try {
        // Call the Backend's Batch Process endpoint
        const response = await fetch(`${API_BASE_URL}/batch-process`, { method: 'POST' });
        
        if (!response.ok) throw new Error("Ingestion failed");
        
        const result = await response.json();
        console.log(result.message);
        
        // Update the UI with the enriched emails from the backend simulation
        setEmails(result.data);
        
    } catch (error) {
        console.error("Pipeline Error:", error);
    } finally {
        setLoading(false);
    }
  };
  
  return (
    <div className="min-h-screen bg-gray-100 p-4 md:p-8 font-sans">
      <script src="https://cdn.tailwindcss.com"></script>
      <div className="max-w-7xl mx-auto">
        <h1 className="text-2xl md:text-3xl font-extrabold text-blue-900 mb-6 border-b-4 border-blue-400 pb-2">
          Prompt-Driven Email Productivity Agent
        </h1>

        {/* RESPONSIVE LAYOUT CHANGE: flex-col on mobile, flex-row on desktop (md) */}
        <div className="flex flex-col md:flex-row space-y-6 md:space-y-0 md:space-x-6">
          
          {/* LEFT PANE: Inbox List */}
          <div className="w-full md:w-1/3 bg-white rounded-xl shadow-lg p-4 border border-gray-200 order-2 md:order-1">
            <h2 className="text-xl font-semibold mb-4 text-gray-800">Inbox ({filteredEmails.length})</h2>
            <div className="flex justify-between items-center mb-4">
                <input
                    type="text"
                    placeholder="Filter by Category/Task..."
                    value={filter}
                    onChange={(e) => setFilter(e.target.value)}
                    className="p-2 border border-gray-300 rounded-lg w-full focus:ring-blue-500 focus:border-blue-500"
                />
            </div>
            <button
                onClick={runIngestionPipeline}
                disabled={loading}
                className={`w-full py-2 px-4 rounded-lg text-white font-medium mb-4 transition-all ${loading ? 'bg-gray-400' : 'bg-green-600 hover:bg-green-700'}`}
            >
                {loading ? 'Running Analysis...' : 'Run Ingestion Pipeline (Phase 1)'}
            </button>
            
            <EmailList 
              emails={filteredEmails} 
              selectedEmailId={selectedEmailId} 
              onSelectEmail={setSelectedEmailId} 
            />
            <p className="mt-4 text-xs text-gray-500">
                <span className="font-semibold">UI:</span> {UI_ORIGIN} | 
                <span className="font-semibold"> API:</span> {API_BASE_URL}
            </p>

          </div>

          {/* RIGHT PANE: Content & Chat */}
          <div className="w-full md:w-2/3 space-y-6 order-1 md:order-2">
            <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200 min-h-[150px]">
              <h2 className="text-xl font-semibold text-gray-800 mb-3 border-b pb-2">Selected Email Content</h2>
              {selectedEmail ? (
                <div>
                  <p className="text-sm text-gray-600 mb-1"><span className="font-bold">From:</span> {selectedEmail.sender}</p>
                  <p className="text-sm text-gray-600 mb-1"><span className="font-bold">Subject:</span> {selectedEmail.subject}</p>
                  <p className="text-xs text-gray-400 mb-4">Received: {new Date(selectedEmail.timestamp).toLocaleString()}</p>
                  <p className="text-gray-700 whitespace-pre-wrap">{selectedEmail.body}</p>
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <p className="text-sm font-semibold text-blue-700">Category: <span className="font-normal text-blue-600">{selectedEmail.category || 'Uncategorized'}</span></p>
                    <p className="text-sm font-semibold text-blue-700">Action Items:</p>
                    {selectedEmail.actionItems && selectedEmail.actionItems.length > 0 ? (
                        <ul className="list-disc list-inside text-sm text-gray-600 ml-4">
                            {selectedEmail.actionItems.map((item, index) => <li key={index}>{item.task}</li>)}
                        </ul>
                    ) : (
                        <p className="text-sm text-gray-600 ml-4">No specific action items extracted.</p>
                    )}
                  </div>
                </div>
              ) : (
                <p className="text-gray-500 italic">Select an email from the list to view its content and chat with the agent.</p>
              )}
            </div>

            <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
              <ChatInterface 
                selectedEmailId={selectedEmailId} 
                apiBaseUrl={API_BASE_URL} 
              />
            </div>
          </div>
        </div>
      </div>
      <style>{`
        body { font-family: 'Inter', sans-serif; }
        .chat-container { display: flex; flex-direction: column; height: 400px; border-radius: 0.75rem; border: 1px solid #e5e7eb; overflow: hidden; background-color: #f9fafb; }
        .chat-messages { flex-grow: 1; padding: 1rem; overflow-y: auto; display: flex; flex-direction: column; gap: 0.75rem; }
        .message-bubble { max-width: 80%; padding: 0.75rem; border-radius: 1rem; box-shadow: 0 1px 3px rgba(0,0,0,0.08); }
        .user-message { align-self: flex-end; background-color: #3b82f6; color: white; border-bottom-right-radius: 0.25rem; }
        .agent-message { align-self: flex-start; background-color: #e5e7eb; color: #1f2937; border-bottom-left-radius: 0.25rem; }
        .message-sender { font-weight: 600; margin-bottom: 0.25rem; font-size: 0.875rem; }
      `}</style>
    </div>
  );
}

export default App;