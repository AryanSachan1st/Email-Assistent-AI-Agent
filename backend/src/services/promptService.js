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
 * FIX: Dynamic Identity - Instructs LLM to find the user's name in the command.
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

  // 2. Combine all elements into the final instruction with EXPLICIT ROLES
  const fullPrompt = `
    --- AGENT ROLE & CONTEXT ---
    You are an intelligent email assistant acting on behalf of the user (the person giving you commands).
    You are processing an incoming email FROM: "${email.sender}".
    
    --- TASK INSTRUCTION (The Rule) ---
    ${relevantPrompt}

    --- INCOMING EMAIL CONTENT (This is what you are reading/replying to) ---
    Original Sender: ${email.sender}
    Subject: ${email.subject}
    Body:
    """
    ${email.body}
    """

    --- USER COMMAND ---
    The user wants you to: "${userInstruction}"

    --- OUTPUT GUIDELINES ---
    1. **Directionality:** You are writing *on behalf of the user* (the person issuing the command) *to* the original sender ("${email.sender}").
    2. **Recipient:** If drafting a reply, address it TO "${email.sender}".
    3. **Signature (Who is sending this reply?):** - Check the "USER COMMAND" above. If the user specified a name (e.g., "from Aryan", "sign as John", "my name is..."), use that name.
       - If NO name is explicitly provided in the command, use the placeholder "[Your Name]".
       - **CRITICAL:** NEVER sign the email using the name "${email.sender}". You are NOT ${email.sender}.

    Generate the output now.
  `;

  return fullPrompt.trim();
};