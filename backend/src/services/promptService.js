import prompts from '../data/prompts.json' with { type: 'json' };
import mockEmails from '../data/mockEmails.json' with { type: 'json' };


// Utility function to get the email content
const getEmailById = (emailId) => {
  // Finds the email by ID, ensuring the ID is treated as a number
  const numericId = parseInt(emailId, 10);
  return mockEmails.find(email => email.id === numericId);
};

// Function to select the base prompt based on intent
const getBasePromptKey = (userInstruction) => {
  const lowerInstruction = userInstruction.toLowerCase();
  
  if (lowerInstruction.includes('summarize') || lowerInstruction.includes('summary')) {
    return 'summarize';
  }
  if (lowerInstruction.includes('reply') || lowerInstruction.includes('draft')) {
    return 'draft_reply';
  }
  if (lowerInstruction.includes('task') || lowerInstruction.includes('action item') || lowerInstruction.includes('actions')) {
    return 'action_item';
  }
  
  // Default general prompt if intent is unclear
  return 'draft_reply'; 
};

/**
 * Creates the final, combined prompt string for the LLM.
 * This implements the core logic: Email + Stored Prompt + User Query.
 */
export const createLLMPrompt = (emailId, userInstruction) => {
  const email = getEmailById(emailId);
  
  if (!email) {
    // Return a structured error message for the LLM to process if possible, 
    // or just throw if the email is not found locally.
    console.error(`Email with ID ${emailId} not found.`);
    return `Error: Could not locate email content for ID ${emailId}. The LLM request cannot be constructed.`;
  }

  // 1. Fetch the relevant prompt template
  const basePromptKey = getBasePromptKey(userInstruction);
  const relevantPrompt = prompts[basePromptKey];

  if (!relevantPrompt) {
      return "Error: Relevant prompt template not found in the 'Agent Brain'.";
  }

  // 2. Combine all elements into the final instruction
  const fullPrompt = `
    --- AGENT INSTRUCTION (The Rule/Prompt Template) ---
    ${relevantPrompt}

    --- EMAIL CONTEXT ---
    Sender: ${email.sender}
    Subject: ${email.subject}
    Content:
    """
    ${email.body}
    """

    --- USER COMMAND (The Specific Instruction/Variable) ---
    User is asking to: "${userInstruction}"

    --- FINAL RESPONSE ---
    Generate the required output now.
  `;

  return fullPrompt.trim();
};