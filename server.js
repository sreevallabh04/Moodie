const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const { createServer } = require('http');
const chatHandler = require('./src/api/chat.js');
const journalSummaryHandler = require('./src/api/journal-summary.js');

// Load environment variables
dotenv.config();

// Create Express app
const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors({
  origin: process.env.NODE_ENV === 'production'
    ? [process.env.FRONTEND_URL || 'https://moodie-app.vercel.app']
    : ['http://localhost:5173', 'http://localhost:5174', 'http://localhost:5175']
}));
app.use(express.json());

// Routes
app.post('/api/chat', async (req, res) => {
  try {
    // Pass request to chat handler
    await chatHandler(req, res);
  } catch (error) {
    console.error('Unhandled error in chat endpoint:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: error.message
    });
  }
});

// Journal summary endpoint
app.post('/api/journal-summary', async (req, res) => {
  try {
    // Pass request to journal summary handler
    await journalSummaryHandler(req, res);
  } catch (error) {
    console.error('Unhandled error in journal summary endpoint:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: error.message
    });
  }
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Create HTTP server
const server = createServer(app);

// Start server
server.listen(PORT, () => {
  console.log(`Moodie API server running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
});

// Handle graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully');
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('SIGINT received, shutting down gracefully');
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});

module.exports = server; // Export for testing