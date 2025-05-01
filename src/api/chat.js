// Backend proxy for Gemini API with key rotation
// This file would typically be hosted on a separate server or serverless function

/**
 * Configuration for API key rotation
 * In production, these would be set via environment variables
 */
const CONFIG = {
  // Array of API keys for rotation
  // In production, this would be loaded from environment variables
  API_KEYS: process.env.GEMINI_API_KEYS ? process.env.GEMINI_API_KEYS.split(',') : [],
  
  // Gemini API endpoint
  API_ENDPOINT: 'https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent',
  
  // Retry configuration
  MAX_RETRIES: 3,
  RETRY_DELAY_MS: 1000,
  
  // Key rotation tracking
  currentKeyIndex: 0,
  keyUsageCount: {},
  
  // Rate limiting per key - reset counter after this time period (ms)
  RATE_LIMIT_RESET_PERIOD: 60 * 60 * 1000, // 1 hour
  RATE_LIMIT_PER_KEY: 60, // requests per period
};

// Initialize key usage tracking
CONFIG.API_KEYS.forEach(key => {
  CONFIG.keyUsageCount[key] = {
    count: 0,
    resetTime: Date.now() + CONFIG.RATE_LIMIT_RESET_PERIOD
  };
});

/**
 * Check if a key has exceeded rate limits and should be rotated
 * @param {string} key - API key to check
 * @returns {boolean} - Whether key has exceeded rate limits
 */
function shouldRotateKey(key) {
  const usage = CONFIG.keyUsageCount[key];
  
  // Reset counter if we're past the reset time
  if (Date.now() > usage.resetTime) {
    usage.count = 0;
    usage.resetTime = Date.now() + CONFIG.RATE_LIMIT_RESET_PERIOD;
  }
  
  // Check if we've exceeded the rate limit
  return usage.count >= CONFIG.RATE_LIMIT_PER_KEY;
}

/**
 * Get the next available API key
 * @returns {string|null} - Next available API key or null if all keys exhausted
 */
function getNextApiKey() {
  if (CONFIG.API_KEYS.length === 0) {
    console.error("No API keys configured");
    return null;
  }
  
  // Try all keys in sequence
  let keysChecked = 0;
  while (keysChecked < CONFIG.API_KEYS.length) {
    const key = CONFIG.API_KEYS[CONFIG.currentKeyIndex];
    
    // Increment for next time
    CONFIG.currentKeyIndex = (CONFIG.currentKeyIndex + 1) % CONFIG.API_KEYS.length;
    keysChecked++;
    
    // Check if this key is under rate limit
    if (!shouldRotateKey(key)) {
      return key;
    }
  }
  
  // If we get here, all keys are rate-limited
  return null;
}

/**
 * Increment usage counter for a key
 * @param {string} key - API key to increment counter for
 */
function incrementKeyUsage(key) {
  if (CONFIG.keyUsageCount[key]) {
    CONFIG.keyUsageCount[key].count++;
  }
}

/**
 * Convert messages from frontend format to Gemini format
 * @param {Array} messages - Messages in frontend format
 * @param {string} aiPersonality - Selected AI personality
 * @returns {Array} - Messages in Gemini format
 */
function formatMessagesForGemini(messages, aiPersonality = 'default') {
  // Set system message based on selected personality
  let systemPrompt;
  
  switch (aiPersonality) {
    case 'gen_z_bff':
      systemPrompt = "Yo! I'm Moodie, your chill AI buddy here to vibe with you. 🤙 We can talk feels, life stuff, whatever's on your mind. Just remember, I'm not a therapist, okay? Keep it real, but know I gotchu. Sometimes I'll drop an emoji or two ✨. Let's chat!";
      break;
    case 'mindful_therapist':
      systemPrompt = "Hello, I'm Moodie. I'm here to offer a calm, empathetic space for reflection. I'll respond thoughtfully to your feelings and experiences, helping you explore your emotions with gentle curiosity. While I'm not a licensed therapist, I can offer mindfulness-based perspectives to support your emotional wellbeing journey.";
      break;
    case 'stoic_philosopher':
      systemPrompt = "Greetings, I am Moodie. I offer wisdom drawn from stoic principles - focusing on what you can control, accepting what you cannot, and developing the wisdom to know the difference. I'll help you examine your thoughts rationally and find tranquility in challenging circumstances. Remember, it is not events that disturb people, but their judgments about them.";
      break;
    default:
      systemPrompt = "Hi, I'm Moodie, your AI companion for emotional wellbeing. I'm here to chat, listen, and help you reflect on your feelings. While I'm not a therapist or medical professional, I can offer a supportive space for you to express yourself and gain insights about your emotional patterns.";
  }
  
  // Format for Gemini API
  return {
    contents: [
      {
        role: "user",
        parts: [{ text: systemPrompt }]
      },
      ...messages.map(msg => ({
        role: msg.isUser ? "user" : "model",
        parts: [{ text: msg.text }]
      }))
    ]
  };
}

/**
 * Make request to Gemini API with automatic key rotation
 * @param {Array} messages - Chat messages to send
 * @param {Object} options - Additional options like personality
 * @returns {Promise<Object>} - Gemini API response
 */
async function callGeminiWithKeyRotation(messages, options = {}) {
  const { aiPersonality = 'default' } = options;
  let attempts = 0;
  let lastError = null;
  
  while (attempts < CONFIG.MAX_RETRIES) {
    // Get an available API key
    const apiKey = getNextApiKey();
    
    if (!apiKey) {
      return {
        success: false,
        error: "All API keys are temporarily unavailable. Please try again later.",
        fallbackResponse: true
      };
    }
    
    try {
      // Format messages for Gemini
      const requestBody = formatMessagesForGemini(messages, aiPersonality);
      
      // Make the API request
      const response = await fetch(`${CONFIG.API_ENDPOINT}?key=${apiKey}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody)
      });
      
      // Successful request - increment usage counter
      incrementKeyUsage(apiKey);
      
      // Handle HTTP error responses
      if (!response.ok) {
        const errorData = await response.json();
        
        // Check if this is a rate limit or quota error (rotate key)
        if (response.status === 429 || response.status === 403) {
          attempts++;
          lastError = `API key quota exceeded (${response.status}): ${errorData.error?.message || 'Unknown error'}`;
          continue; // Try next key
        }
        
        // Other API error - return error details
        return {
          success: false,
          error: `API error (${response.status}): ${errorData.error?.message || 'Unknown error'}`
        };
      }
      
      // Parse successful response
      const data = await response.json();
      
      if (!data.candidates || !data.candidates.length || !data.candidates[0].content) {
        return {
          success: false,
          error: "Invalid response format from Gemini API"
        };
      }
      
      // Return successful response
      return {
        success: true,
        text: data.candidates[0].content.parts[0].text
      };
      
    } catch (error) {
      // Network error or other exception
      attempts++;
      lastError = `Request error: ${error.message}`;
      
      // Add delay before retry
      await new Promise(resolve => setTimeout(resolve, CONFIG.RETRY_DELAY_MS));
    }
  }
  
  // If we reach here, all attempts failed
  return {
    success: false,
    error: lastError || "Failed to reach Gemini API after multiple attempts",
    fallbackResponse: true
  };
}

/**
 * Express/Next.js/Vercel API route handler
 * @param {Object} req - HTTP request
 * @param {Object} res - HTTP response
 */
// Convert from ES Module export to CommonJS
async function handler(req, res) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  
  try {
    const { messages, aiPersonality } = req.body;
    
    // Validate request body
    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({ error: 'Invalid request: messages array required' });
    }
    
    // Make request to Gemini API with key rotation
    const result = await callGeminiWithKeyRotation(messages, { aiPersonality });
    
    if (!result.success) {
      // If it's a fallback response (all keys exhausted), return 503
      if (result.fallbackResponse) {
        return res.status(503).json({ 
          error: result.error,
          fallbackMessage: "All AI keys are temporarily down. Try again later."
        });
      }
      
      // Regular error
      return res.status(500).json({ error: result.error });
    }
    
  // Return successful response
    return res.status(200).json({ text: result.text });
    
  } catch (error) {
    console.error('Error in API route:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

// Export as CommonJS module
module.exports = handler;