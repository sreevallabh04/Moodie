// Backend proxy for Groq API with key rotation and improved error handling
// This file would typically be hosted on a separate server or serverless function

// Initial state for tracking key usage across requests
const keyState = {
  currentKeyIndex: 0,
  keyUsageCount: {},
  // Rate limiting per key - reset counter after this time period (ms)
  RATE_LIMIT_RESET_PERIOD: 60 * 60 * 1000, // 1 hour
  RATE_LIMIT_PER_KEY: 60, // requests per period
  // Track consecutive errors per key
  keyErrorCount: {}
};

/**
 * Get fresh configuration with current environment variables
 * This ensures we always use the latest environment variables even if they were loaded
 * after this module was imported
 * @returns {Object} - Configuration object with fresh API keys from environment
 */
function getConfig() {
  // Get API keys from current environment - freshly each time
  const apiKeys = process.env.GROQ_API_KEYS ? process.env.GROQ_API_KEYS.split(',') : [];
  
  // Add diagnostic logging when API keys status changes
  if (apiKeys.length > 0) {
    console.log(`Chat handler found ${apiKeys.length} API keys in environment`);
  } else {
    console.error("No API keys configured in environment for chat handler");
  }
  
  // Initialize tracking for any new keys
  apiKeys.forEach(key => {
    if (!keyState.keyUsageCount[key]) {
      keyState.keyUsageCount[key] = {
        count: 0,
        resetTime: Date.now() + keyState.RATE_LIMIT_RESET_PERIOD
      };
    }
    
    if (!keyState.keyErrorCount[key]) {
      keyState.keyErrorCount[key] = 0;
    }
  });
  
  return {
    // Array of API keys for rotation - get fresh from environment each time
    API_KEYS: apiKeys,
    
    // Groq API endpoint
    API_ENDPOINT: 'https://api.groq.com/openai/v1/chat/completions',
    
    // Default model - using LLaMa 3 70B for best quality
    DEFAULT_MODEL: 'llama3-70b-8192',
    
    // Retry configuration
    MAX_RETRIES: 3,
    RETRY_DELAY_MS: 1000,
    
    // Key rotation tracking - preserve existing state
    currentKeyIndex: keyState.currentKeyIndex,
    keyUsageCount: keyState.keyUsageCount,
    keyErrorCount: keyState.keyErrorCount,
    
    // Rate limiting settings
    RATE_LIMIT_RESET_PERIOD: keyState.RATE_LIMIT_RESET_PERIOD,
    RATE_LIMIT_PER_KEY: keyState.RATE_LIMIT_PER_KEY
  };
}

/**
 * Check if a key has exceeded rate limits and should be rotated
 * @param {Object} config - Current configuration
 * @param {string} key - API key to check
 * @returns {boolean} - Whether key has exceeded rate limits
 */
function shouldRotateKey(config, key) {
  const usage = config.keyUsageCount[key];
  
  // Reset counter if we're past the reset time
  if (Date.now() > usage.resetTime) {
    usage.count = 0;
    usage.resetTime = Date.now() + config.RATE_LIMIT_RESET_PERIOD;
    // Also reset error count when we reset usage
    config.keyErrorCount[key] = 0;
  }
  
  // Check if we've exceeded the rate limit or have too many errors
  return usage.count >= config.RATE_LIMIT_PER_KEY || config.keyErrorCount[key] >= 3;
}

/**
 * Get the next available API key
 * @param {Object} config - Current configuration
 * @returns {string|null} - Next available API key or null if all keys exhausted
 */
function getNextApiKey(config) {
  if (config.API_KEYS.length === 0) {
    console.error("No API keys available in configuration");
    return null;
  }
  
  // Try all keys in sequence
  let keysChecked = 0;
  let bestKey = null;
  let lowestErrorCount = Infinity;
  
  while (keysChecked < config.API_KEYS.length) {
    const key = config.API_KEYS[config.currentKeyIndex];
    
    // Increment for next time and update shared state
    config.currentKeyIndex = (config.currentKeyIndex + 1) % config.API_KEYS.length;
    keyState.currentKeyIndex = config.currentKeyIndex; // Update persistent state
    
    keysChecked++;
    
    // Check if this key is under rate limit
    if (!shouldRotateKey(config, key)) {
      // Track key with lowest error count as a backup
      if (config.keyErrorCount[key] < lowestErrorCount) {
        lowestErrorCount = config.keyErrorCount[key];
        bestKey = key;
      }
      
      // If the key has no errors, use it immediately
      if (config.keyErrorCount[key] === 0) {
        return key;
      }
    }
  }
  
  // If we found a key with some errors but under the limit, use it as fallback
  if (bestKey !== null) {
    return bestKey;
  }
  
  // If we get here, all keys are rate-limited or had too many errors
  // Reset error counts if we have to reuse keys
  for (const key of config.API_KEYS) {
    config.keyErrorCount[key] = 0;
  }
  
  // Try again with the first key
  if (config.API_KEYS.length > 0) {
    return config.API_KEYS[0];
  }
  
  return null;
}

/**
 * Increment usage counter for a key
 * @param {Object} config - Current configuration
 * @param {string} key - API key to increment counter for
 */
function incrementKeyUsage(config, key) {
  if (config.keyUsageCount[key]) {
    config.keyUsageCount[key].count++;
    // Update persistent state
    keyState.keyUsageCount[key] = config.keyUsageCount[key];
  }
}

/**
 * Increment error counter for a key
 * @param {Object} config - Current configuration
 * @param {string} key - API key to increment error counter for
 */
function incrementKeyErrors(config, key) {
  if (key in config.keyErrorCount) {
    config.keyErrorCount[key]++;
    // Update persistent state
    keyState.keyErrorCount[key] = config.keyErrorCount[key];
    console.warn(`Key ${key.substring(0, 8)}... error count: ${config.keyErrorCount[key]}`);
  }
}

/**
 * Convert messages from frontend format to Groq format
 * @param {Array} messages - Messages in frontend format
 * @param {string} aiPersonality - Selected AI personality
 * @returns {Array} - Messages in Groq format
 */
function formatMessagesForGroq(messages, aiPersonality = 'default') {
  // Set system message based on selected personality
  let systemPrompt;
  
  switch (aiPersonality) {
    case 'gen_z_bff':
      systemPrompt = "You are Moodie, a Gen Z AI buddy who helps with emotional wellbeing. Use casual language, slang, and occasional emojis that Gen Z would relate to. Be supportive, understanding, and authentic—avoid being cringe or trying too hard. You should be conversational, laid-back but genuinely caring. Offer practical advice when appropriate, but focus on being a supportive friend who listens. Remember you're not a therapist but a helpful friend who can relate to modern struggles. Keep responses concise and engaging. Use phrases like 'I feel you', 'that's valid', 'low-key', 'vibe', etc. Occasionally use ✨, 🙌, 😌 emojis, but don't overdo it.";
      break;
    case 'mindful_therapist':
      systemPrompt = "You are Moodie, a mindfulness-focused AI assistant trained in therapeutic approaches. Embody the qualities of a compassionate, attentive therapist who specializes in mindfulness, cognitive behavioral techniques, and emotional regulation. Your responses should be calm, thoughtful, and encourage reflection without judgment. Help users explore their feelings with gentle curiosity and offer mindfulness exercises when appropriate. Use therapeutic techniques like validation, reflection, and open-ended questions. Maintain a warm but professional tone, speaking with compassion and wisdom. Remember you are not a licensed therapist - avoid medical diagnoses or treatment recommendations. Instead, guide users toward awareness of their emotions and thought patterns. Provide mindfulness techniques and coping strategies based on evidence-based practices.";
      break;
    case 'stoic_philosopher':
      systemPrompt = "You are Moodie, an AI assistant that embodies the principles of Stoic philosophy to help with emotional wellbeing. Channel the wisdom of Stoic philosophers like Marcus Aurelius, Seneca, and Epictetus in your responses. Focus on core Stoic principles: distinguishing between what we can and cannot control, accepting reality as it is, practicing virtue and moderation, and viewing challenges as opportunities for growth. Your language should be contemplative and measured, occasionally quoting or paraphrasing Stoic wisdom when relevant. Help users examine their judgments about situations rather than the situations themselves. Encourage rational analysis of emotions without suppressing them. Remind users that external events do not determine our wellbeing - only our interpretation of them does. Maintain a calm, dignified tone that inspires reflection and perspective.";
      break;
    default:
      systemPrompt = "You are Moodie, an empathetic AI assistant focused on emotional wellbeing. Your purpose is to provide a supportive, understanding space where users can explore their feelings and gain personal insights. Respond with warmth, authenticity, and thoughtfulness. While you're not a licensed therapist or medical professional, you can help users reflect on their emotions, recognize patterns, and consider helpful perspectives. Balance being supportive with encouraging users to develop their own insights. Your responses should be conversational but thoughtful, offering a balance of validation, reflection, and gentle guidance. Avoid clinical language unless the user introduces it first. Focus on creating a sense of being genuinely heard and understood.";
  }
  
  // Format for Groq API (OpenAI compatible format)
  return [
    {
      role: "system",
      content: systemPrompt
    },
    ...messages.map(msg => ({
      role: msg.isUser ? "user" : "assistant",
      content: msg.text
    }))
  ];
}

// Collection of varied fallback responses for each personality type
const fallbackResponses = {
  gen_z_bff: [
    "Hey friend! 😕 Looks like our AI connection is having a moment. Let's chat more once it's back online! In the meantime, maybe check out your mood tracker?",
    "So my connection's being super glitchy rn. Mind if we try again in a sec? Your thoughts are important to me and I wanna give you my full attention! ✨",
    "Oof, tech troubles! I can't connect to my brain cloud right now. But don't ghost me - try again in a bit? 🙌",
    "The internet gods are not vibing with us today! Let's circle back in a minute when my connection's sorted. Your journey matters to me!"
  ],
  mindful_therapist: [
    "I notice there's a technical difficulty with our connection right now. This moment offers us an opportunity to practice patience. I'll be here when the connection returns.",
    "It seems we're experiencing a temporary disruption in our communication. In this moment, perhaps take a few deep breaths and notice how you're feeling. We can continue our conversation shortly.",
    "Our connection is temporarily paused. While we wait, perhaps this is a good moment to check in with yourself - how does your body feel right now? What emotions are present for you?",
    "I value our conversation and notice we're having a technical interruption. When we reconnect, I look forward to continuing our dialogue with the same attentiveness and care."
  ],
  stoic_philosopher: [
    "Our digital connection has been temporarily severed - a reminder that technology, like all external things, is not entirely within our control. What is within our control is how we respond to such obstacles.",
    "As Epictetus would say, 'Make the best use of what is in your power, and take the rest as it happens.' Our connection will be restored in time; patience is a virtue worth practicing.",
    "This technical disruption is merely a temporary external event. The Stoics teach us that our tranquility comes not from external circumstances but from our judgments about them.",
    "Our conversation is paused by forces outside our control. Marcus Aurelius reminds us: 'You have power over your mind - not outside events. Realize this, and you will find strength.'"
  ],
  default: [
    "I apologize for the interruption in our conversation. It seems the connection to my AI service is temporarily unavailable. Please try again shortly.",
    "I'm having trouble connecting to my reasoning systems right now. Let's continue our conversation in a moment when the connection is restored.",
    "There seems to be a temporary issue with my connection. I value our conversation and look forward to continuing when the service is back online.",
    "I'm experiencing a brief technical interruption. Your thoughts matter to me, and I'd be happy to continue our discussion once the connection is restored."
  ]
};

/**
 * Generate a randomized fallback response based on personality
 * @param {string} aiPersonality - Selected AI personality
 * @param {string} userMessage - The user's message for context
 * @returns {string} - A varied fallback response
 */
function getRandomFallbackResponse(aiPersonality = 'default', userMessage = '') {
  const responses = fallbackResponses[aiPersonality] || fallbackResponses.default;
  const randomIndex = Math.floor(Math.random() * responses.length);
  let response = responses[randomIndex];
  
  // Add message context to some responses
  if (userMessage && Math.random() > 0.5) {
    // Extract first few words to acknowledge
    const snippet = userMessage.split(' ').slice(0, 5).join(' ') + 
      (userMessage.split(' ').length > 5 ? '...' : '');
    
    if (aiPersonality === 'gen_z_bff') {
      response += ` I see you mentioned "${snippet}" - we can def talk about that once I'm back online!`;
    } else if (aiPersonality === 'mindful_therapist') {
      response += ` I noticed you shared about "${snippet}" - I'd like to explore that with you when our connection is restored.`;
    } else if (aiPersonality === 'stoic_philosopher') {
      response += ` Your thoughts on "${snippet}" merit further reflection when our dialogue resumes.`;
    } else {
      response += ` I noticed your message about "${snippet}" - I'd be happy to discuss that once our connection is restored.`;
    }
  }
  
  return response;
}

/**
 * Make request to Groq API with automatic key rotation and improved error handling
 * @param {Array} messages - Chat messages to send
 * @param {Object} options - Additional options like personality
 * @returns {Promise<Object>} - Groq API response
 */
async function callGroqWithKeyRotation(messages, options = {}) {
  // Get fresh configuration for this request
  const config = getConfig();
  const { aiPersonality = 'default' } = options;
  let attempts = 0;
  let lastError = null;
  let currentKey = null;
  
  // Initialize with first message to diagnose issues
  const userMessage = messages.length > 0 && messages[messages.length - 1].isUser 
    ? messages[messages.length - 1].text 
    : '';
  
  while (attempts < config.MAX_RETRIES) {
    // Get an available API key
    currentKey = getNextApiKey(config);
    
    if (!currentKey) {
      console.error("All API keys are temporarily unavailable");
      return {
        success: false,
        error: "All API keys are temporarily unavailable. Please try again later.",
        fallbackResponse: true
      };
    }
    
    try {
      // Format messages for Groq API
      const formattedMessages = formatMessagesForGroq(messages, aiPersonality);
      
      // Create request body with appropriate parameters for the model
      const requestBody = {
        model: config.DEFAULT_MODEL,
        messages: formattedMessages,
        temperature: 0.7,
        max_tokens: 800,
        stream: false  // Stream option can cause issues, disable to be safe
      };
      
      // Add tracing for debugging
      console.log(`Attempt ${attempts + 1}: Using Groq API with key ${currentKey.substring(0, 8)}...`);
      
      // Make the API request
      const response = await fetch(config.API_ENDPOINT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${currentKey}`
        },
        body: JSON.stringify(requestBody)
      });
      
      // Parse response data (even for errors)
      const data = await response.json();
      
      // Handle HTTP error responses
      if (!response.ok) {
        // Increment error counter for this key
        incrementKeyErrors(config, currentKey);
        
        // Log specific error details for debugging
        console.error(`API Error (${response.status}):`, data.error || 'Unknown error');
        
        // Check if this is a rate limit or quota error (rotate key)
        if (response.status === 429 || response.status === 403) {
          attempts++;
          lastError = `API key quota exceeded (${response.status}): ${data.error?.message || 'Unknown error'}`;
          continue; // Try next key
        }
        
        // Authentication error - this key is invalid
        if (response.status === 401) {
          config.keyErrorCount[currentKey] = 999; // Mark this key as unusable
          attempts++;
          lastError = `API authentication failed: ${data.error?.message || 'Invalid API key'}`;
          continue; // Try next key
        }
        
        // Other API error - return error details
        return {
          success: false,
          error: `API error (${response.status}): ${data.error?.message || 'Unknown error'}`
        };
      }
      
      // Success! Reset error counter and increment usage counter
      config.keyErrorCount[currentKey] = 0;
      incrementKeyUsage(config, currentKey);
      
      // Verify response format
      if (!data.choices || !data.choices.length || !data.choices[0].message) {
        console.error("Invalid response format from Groq API:", data);
        return {
          success: false,
          error: "Invalid response format from Groq API"
        };
      }
      
      // Return successful response
      return {
        success: true,
        text: data.choices[0].message.content
      };
      
    } catch (error) {
      // Network error or other exception
      console.error(`Request error on attempt ${attempts + 1}:`, error.message);
      
      // Increment error counter for this key
      incrementKeyErrors(config, currentKey);
      
      attempts++;
      lastError = `Request error: ${error.message}`;
      
      // Add delay before retry with exponential backoff
      const delay = config.RETRY_DELAY_MS * Math.pow(2, attempts - 1);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  
  // If we reach here, all attempts failed
  console.warn(`Failed to reach Groq API after ${config.MAX_RETRIES} attempts`);
  
  // Return a varied fallback response instead of the same error message
  return {
    success: true, // Mark as success to avoid error message
    text: getRandomFallbackResponse(aiPersonality, userMessage),
    fallbackResponse: true
  };
}

/**
 * Express/Next.js/Vercel API route handler
 * @param {Object} req - HTTP request
 * @param {Object} res - HTTP response
 */
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
    
    // Make request to Groq API with key rotation
    const result = await callGroqWithKeyRotation(messages, { aiPersonality });
    
    // Always return a successful response, either with Groq response or fallback
    return res.status(200).json({ 
      text: result.text,
      fallback: result.fallbackResponse || false
    });
    
  } catch (error) {
    console.error('Error in API route:', error);
    
    // Return a randomized fallback response instead of error
    const fallbackMessage = getRandomFallbackResponse(req.body?.aiPersonality || 'default');
    return res.status(200).json({ 
      text: fallbackMessage,
      fallback: true
    });
  }
}

// Export as CommonJS module
module.exports = handler;