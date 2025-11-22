import React from 'react';

// This component handles the left-hand pane, displaying the list of emails
// and handling the click event to select an email for chat interaction.
const EmailList = ({ emails, selectedEmailId, onSelectEmail }) => (
    <div className="space-y-2 overflow-y-auto max-h-[calc(100vh-250px)]">
        {emails.length === 0 && <p className="text-gray-500 italic">No emails matching the filter.</p>}
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
                {/* Displaying LLM-assigned tags/categories and action counts */}
                <div className="mt-2 flex space-x-2">
                    <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-700">{email.category}</span>
                    {email.actionItems.length > 0 && (
                        <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-red-100 text-red-700">
                            {email.actionItems.length} Task(s)
                        </span>
                    )}
                </div>
            </div>
        ))}
    </div>
);

export default EmailList;