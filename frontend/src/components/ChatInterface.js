import React, { useState } from 'react';
import axios from 'axios';

// Assuming selectedEmailId is passed from the EmailList component when an email is clicked
function ChatInterface({ selectedEmailId }) {
  const [input, setInput] = useState('');
  const [chatHistory, setChatHistory] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!input.trim() || !selectedEmailId) return;

    const userInstruction = input;
    setChatHistory(prev => [...prev, { sender: 'user', message: userInstruction }]);
    setInput('');
    setLoading(true);

    try {
      // Calls the Express backend
      const response = await axios.post('http://localhost:3001/api/agent-query', {
        emailId: selectedEmailId,
        userInstruction: userInstruction,
      });

      // Add the LLM response to history
      setChatHistory(prev => [...prev, { sender: 'agent', message: response.data.response }]);

    } catch (error) {
      setChatHistory(prev => [...prev, { sender: 'agent', message: 'Error: Could not reach agent backend.' }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="chat-container">
      <h3>Agent Chat (Email ID: {selectedEmailId || 'None'})</h3>
      {/* ... Display chat history ... */}
      <form onSubmit={handleSubmit}>
        <input 
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask about the email..."
          disabled={!selectedEmailId || loading}
        />
        <button type="submit" disabled={!selectedEmailId || loading}>Send</button>
      </form>
    </div>
  );
}

export default ChatInterface;