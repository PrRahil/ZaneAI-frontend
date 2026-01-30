#!/usr/bin/env node

/**
 * Simple WebSocket server for testing the Zane.AI chat functionality
 * 
 * To run this server:
 * 1. Make sure you have Node.js installed
 * 2. Install ws package: npm install ws
 * 3. Run: node websocket-server-example.js
 * 4. The server will start on ws://localhost:8080/ws/chat
 */

const WebSocket = require('ws');

const wss = new WebSocket.Server({ 
  port: 8080,
  path: '/ws/chat'
});

console.log('🚀 WebSocket server started on ws://localhost:8080/ws/chat');

wss.on('connection', function connection(ws) {
  console.log('👤 New client connected');

  // Send welcome message
  ws.send(JSON.stringify({
    type: 'response',
    data: {
      content: 'Hello! I\'m connected via WebSocket. How can I help you today?',
      responseId: 'welcome_' + Date.now(),
      messageId: 'system',
      timestamp: new Date().toISOString()
    }
  }));

  ws.on('message', function message(data) {
    try {
      const parsed = JSON.parse(data);
      console.log('📨 Received message:', parsed);

      // Handle different message types
      switch (parsed.type) {
        case 'ping':
          // Respond to heartbeat
          ws.send(JSON.stringify({ type: 'pong' }));
          break;

        case 'message':
          // Simulate AI response with delay
          setTimeout(() => {
            const response = {
              type: 'response',
              data: {
                content: `I received your message: "${parsed.data.content}"\n\nThis is a simulated AI response from the WebSocket server. In a real implementation, this would process your query and provide intelligent insights about your data lineage.`,
                responseId: 'response_' + Date.now(),
                messageId: parsed.data.messageId,
                timestamp: new Date().toISOString()
              }
            };

            ws.send(JSON.stringify(response));
            console.log('📤 Sent response:', response);
          }, 1000 + Math.random() * 2000); // 1-3 second delay
          break;

        default:
          console.log('❓ Unknown message type:', parsed.type);
      }
    } catch (error) {
      console.error('❌ Error parsing message:', error);
      
      // Send error response
      ws.send(JSON.stringify({
        type: 'error',
        data: {
          message: 'Failed to parse message',
          timestamp: new Date().toISOString()
        }
      }));
    }
  });

  ws.on('close', function close() {
    console.log('👋 Client disconnected');
  });

  ws.on('error', function error(err) {
    console.error('❌ WebSocket error:', err);
  });
});

wss.on('error', function error(err) {
  console.error('❌ Server error:', err);
});

// Handle graceful shutdown
process.on('SIGINT', () => {
  console.log('\n🛑 Shutting down WebSocket server...');
  wss.close(() => {
    console.log('✅ WebSocket server closed');
    process.exit(0);
  });
});
