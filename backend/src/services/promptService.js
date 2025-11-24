import prompts from '../data/prompts.json' with { type: 'json' };
import mockEmails from '../data/mockEmails.json' with { type: 'json' };

// Utility function to get the email content
const getEmailById = (emailId) => {
  const numericId = parseInt(emailId, 10);
  return mockEmails.find(email => email.id === numericId);
};

// Function to select the base prompt based on intent
const getBasePromptKey = (userInstruction) => {
  const lowerInstruction = userInstruction.toLowerCase();
  
  if (lowerInstruction.includes('summarize') || lowerInstruction.includes('summary')) {
    return 'summarize';
  }
  if (lowerInstruction.includes('reply') || lowerInstruction.includes('draft') || lowerInstruction.includes('write')) {
    return 'draft_reply';
  }
  if (lowerInstruction.includes('task') || lowerInstruction.includes('action item') || lowerInstruction.includes('actions')) {
    return 'action_item';
  }
  
  return 'draft_reply'; 
};

/**
 * Creates the final, combined prompt string for the LLM.
 * FIX: Now explicitly defines the Sender/Receiver roles to prevent confusion.
 */
export const createLLMPrompt = (emailId, userInstruction) => {
  const email = getEmailById(emailId);
  
  if (!email) {
    console.error(`Email with ID ${emailId} not found.`);
    return `Error: Could not locate email content for ID ${emailId}.`;
  }

  // 1. Fetch the relevant prompt template
  const basePromptKey = getBasePromptKey(userInstruction);
  const relevantPrompt = prompts[basePromptKey];

  if (!relevantPrompt) {
      return "Error: Relevant prompt template not found.";
  }

  // 2. Define the User Identity (You can change this to a variable later)
  const MY_NAME = "Aryan Sachan";

  // 3. Combine all elements into the final instruction with EXPLICIT ROLES
  const fullPrompt = `
    --- AGENT ROLE & CONTEXT ---
    You are an intelligent email assistant acting on behalf of the user: "${MY_NAME}".
    You are processing an incoming email FROM: "${email.sender}".
    
    --- TASK INSTRUCTION (The Rule) ---
    ${relevantPrompt}

    --- INCOMING EMAIL CONTENT (Do not confuse this with your output) ---
    Sender: ${email.sender}
    Subject: ${email.subject}
    Body:
    """
    ${email.body}
    """

    --- USER COMMAND ---
    The user wants you to: "${userInstruction}"

    --- OUTPUT GUIDELINES ---
    1. If drafting a reply, the email must be addressed TO "${email.sender}".
    2. The email must be signed FROM "${MY_NAME}".
    3. Do not include placeholders like "[Your Name]"—use "${MY_NAME}".
    
    Generate the output now.
  `;

  return fullPrompt.trim();
};