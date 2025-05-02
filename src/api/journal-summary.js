// Backend API endpoint for journal summary generation using Groq API
// Uses the same API key rotation mechanism as chat.js

/**
 * Configuration for API key rotation
 * This is imported from the shared config in a real app
 */
const CONFIG = {
  // Array of API keys for rotation (loaded from environment variables)
  API_KEYS: process.env.GROQ_API_KEYS ? process.env.GROQ_API_KEYS.split(',') : [],
  
  // Groq API endpoint
  API_ENDPOINT: 'https://api.groq.com/openai/v1/chat/completions',
  
  // Default model
  DEFAULT_MODEL: 'llama3-70b-8192',
  
  // Retry configuration
  MAX_RETRIES: 3,
  RETRY_DELAY_MS: 1000,
  
  // Key rotation tracking
  currentKeyIndex: 0,
  keyUsageCount: {},
  
  // Rate limiting per key
  RATE_LIMIT_RESET_PERIOD: 60 * 60 * 1000, // 1 hour
  RATE_LIMIT_PER_KEY: 60, // requests per period
};

// Initialize key tracking
CONFIG.API_KEYS.forEach(key => {
  CONFIG.keyUsageCount[key] = {
    count: 0,
    resetTime: Date.now() + CONFIG.RATE_LIMIT_RESET_PERIOD
  };
});

/**
 * Check if a key has exceeded rate limits and should be rotated
 * @param {string} key - API key to check
 * @returns {boolean} - Whether key should be rotated
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
 * Format journal entries for Groq API
 * @param {Array} entries - Journal entries to analyze
 * @param {string} userName - User's name for personalization
 * @returns {Array} - Formatted messages for Groq
 */
function formatJournalRequestForGroq(entries, userName) {
  // Create a system prompt for journal analysis
  const systemPrompt = `You are an expert emotional wellness analyst and therapist. 
Analyze the following journal entries from ${userName || 'the user'} for the past week. 
Each entry includes the date, mood score (1-5 scale where 5 is best), and text content.

Provide the following:
1. A conversational, encouraging 3-4 sentence summary of their emotional journey this week
2. An analysis of mood trends (improving, declining, or stable)
3. 3-5 recurring themes or patterns in their thoughts
4. 2-3 specific insights based on their journal content
5. 2-3 personalized suggestions to help improve their wellbeing

Make your analysis thoughtful, empathetic and supportive. Be genuine and specific to their entries.
Format your response as a structured JSON object with the following fields:
{
  "summary": "...",
  "trend": "improving|declining|stable",
  "themes": ["theme1", "theme2", ...],
  "insights": ["insight1", "insight2", ...],
  "recommendations": ["recommendation1", "recommendation2", ...]
}
`;

  // Format entries as a nicely formatted text block
  const entriesText = entries.map(entry => 
    `Date: ${entry.date}\nMood: ${entry.mood}/5\nContent: ${entry.content}`
  ).join('\n\n');

  // Format for Groq OpenAI-compatible API (array of messages)
  return [
    {
      role: "system",
      content: systemPrompt
    },
    {
      role: "user",
      content: "JOURNAL ENTRIES:\n\n" + entriesText
    }
  ];
}

/**
 * Call Groq API with automatic key rotation
 * @param {Array} entries - Journal entries to analyze
 * @param {Object} options - Additional options
 * @returns {Promise<Object>} - Groq API response
 */
async function callGroqWithKeyRotation(entries, options = {}) {
  const { userName = 'User' } = options;
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
      // Format entries for Groq
      const messages = formatJournalRequestForGroq(entries, userName);
      
      // Create request body for Groq
      const requestBody = {
        model: CONFIG.DEFAULT_MODEL,
        messages: messages,
        temperature: 0.3, // Lower temperature for more structured response
        max_tokens: 1000
      };
      
      // Make the API request
      const response = await fetch(CONFIG.API_ENDPOINT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify(requestBody)
      });
      
      // Increment usage counter
      incrementKeyUsage(apiKey);
      
      // Handle HTTP error responses
      if (!response.ok) {
        const errorData = await response.json();
        
        // Check if this is a rate limit or quota error
        if (response.status === 429 || response.status === 403) {
          attempts++;
          lastError = `API key quota exceeded (${response.status}): ${errorData.error?.message || 'Unknown error'}`;
          continue; // Try next key
        }
        
        // Other API error
        return {
          success: false,
          error: `API error (${response.status}): ${errorData.error?.message || 'Unknown error'}`
        };
      }
      
      // Parse successful response
      const data = await response.json();
      
      if (!data.choices || !data.choices.length || !data.choices[0].message) {
        return {
          success: false,
          error: "Invalid response format from Groq API"
        };
      }
      
      // Extract JSON data from the text response
      const responseText = data.choices[0].message.content;
      let jsonData;
      
      try {
        // Try to extract JSON from the response
        // First attempt direct parsing
        try {
          jsonData = JSON.parse(responseText.trim());
        } catch (e) {
          // If direct parsing fails, try to find JSON in the text
          const jsonMatch = responseText.match(/\{[\s\S]*\}/);
          if (jsonMatch) {
            jsonData = JSON.parse(jsonMatch[0]);
          } else {
            throw new Error("Could not extract JSON from response");
          }
        }
        
        // Return successful response
        return {
          success: true,
          ...jsonData
        };
      } catch (jsonError) {
        console.error("Error parsing AI response as JSON:", jsonError);
        // Fallback response using raw text
        return {
          success: true,
          summary: responseText.substring(0, 300) + "...",
          trend: "stable",
          themes: ["Theme analysis unavailable"],
          insights: ["Could not parse structured insights"],
          recommendations: ["Journal more regularly for better insights"]
        };
      }
      
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
    error: lastError || "Failed to reach Groq API after multiple attempts",
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
    const { entries, userName } = req.body;
    
    // Validate request body
    if (!entries || !Array.isArray(entries) || entries.length === 0) {
      return res.status(400).json({ 
        error: 'Invalid request: array of journal entries required' 
      });
    }
    
    // Make request to Groq API with key rotation
    const result = await callGroqWithKeyRotation(entries, { userName });
    
    if (!result.success) {
      // If it's a fallback response, return 503
      if (result.fallbackResponse) {
        return res.status(503).json({ 
          error: result.error,
          fallbackMessage: "Weekly summary generation is temporarily unavailable. Please try again later."
        });
      }
      
      // Regular error
      return res.status(500).json({ error: result.error });
    }
    
    // Return successful response
    return res.status(200).json({
      summary: result.summary,
      trend: result.trend,
      themes: result.themes,
      insights: result.insights,
      recommendations: result.recommendations
    });
    
  } catch (error) {
    console.error('Error in journal summary API route:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

// Export as CommonJS module
module.exports = handler;