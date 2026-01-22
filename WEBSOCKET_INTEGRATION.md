# WebSocket Chat Integration

This document explains how to use the WebSocket functionality in the Myzane AI chat page.

## Features

- ✅ Real-time bidirectional communication
- ✅ Automatic reconnection with exponential backoff
- ✅ Connection status indicator
- ✅ Heartbeat to keep connections alive
- ✅ Error handling and fallback responses
- ✅ Manual connect/disconnect controls
- ✅ TypeScript support with proper interfaces

## Configuration

### Environment Variables

Create a `.env.local` file in your project root:

```bash
# WebSocket endpoint
NEXT_PUBLIC_WEBSOCKET_URL=ws://localhost:8080/ws/chat
```

### Default Configuration

If no environment variable is set, the default configuration is:

- **URL**: `ws://localhost:8080/ws/chat`
- **Reconnection attempts**: 5
- **Reconnection interval**: 3 seconds
- **Connection timeout**: 10 seconds
- **Heartbeat interval**: 30 seconds

## Testing with the Example Server

1. **Install dependencies** (if not already installed):

```bash
npm install ws
```

2. **Start the example WebSocket server**:

```bash
node websocket-server-example.js
```

3. **Start your Next.js application**:

```bash
npm run dev
```

4. **Navigate to the chat page** and click "Connect" to establish WebSocket connection.

## WebSocket Message Protocol

### Client → Server Messages

#### Chat Message

```json
{
  "type": "message",
  "data": {
    "content": "User message content",
    "messageId": "unique_message_id",
    "timestamp": "2025-11-09T12:00:00.000Z"
  }
}
```

#### Heartbeat

```json
{
  "type": "ping"
}
```

### Server → Client Messages

#### Chat Response

```json
{
  "type": "response",
  "data": {
    "content": "AI response content",
    "responseId": "unique_response_id",
    "messageId": "original_message_id",
    "timestamp": "2025-11-09T12:00:01.000Z"
  }
}
```

#### Heartbeat Response

```json
{
  "type": "pong"
}
```

#### Error Message

```json
{
  "type": "error",
  "data": {
    "message": "Error description",
    "timestamp": "2025-11-09T12:00:00.000Z"
  }
}
```

## Integration with Your Backend

To integrate with your actual Myzane AI backend:

1. **Update the WebSocket URL** in `.env.local` to point to your backend
2. **Implement the message protocol** on your backend server
3. **Handle authentication** if required (you can extend the WebSocket hook to include auth tokens)
4. **Process queries** and return intelligent responses about data lineage

### Example Backend Integration

```javascript
// Your WebSocket server should handle these message types:
ws.on('message', (data) => {
  const message = JSON.parse(data);

  switch (message.type) {
    case 'message':
      // Process with your AI/ML pipeline
      const aiResponse = await processQuery(message.data.content);

      ws.send(JSON.stringify({
        type: 'response',
        data: {
          content: aiResponse,
          responseId: generateId(),
          messageId: message.data.messageId,
          timestamp: new Date().toISOString()
        }
      }));
      break;

    case 'ping':
      ws.send(JSON.stringify({ type: 'pong' }));
      break;
  }
});
```

## Connection States

The chat page displays different connection states:

- 🟢 **Connected**: WebSocket is connected and ready
- 🟡 **Connecting**: Attempting to establish connection
- 🟡 **Reconnecting**: Attempting to reconnect after connection loss
- 🔴 **Error**: Connection failed or encountered an error
- ⚪ **Disconnected**: Not connected

## Manual Controls

- **Connect Button**: Manually establish WebSocket connection
- **Disconnect Button**: Manually close WebSocket connection
- **Auto-reconnection**: Automatically attempts to reconnect on connection loss

## Fallback Behavior

If WebSocket connection fails:

1. The app shows a fallback message
2. Users can still type messages (they won't be sent until connected)
3. Manual reconnection is available via the Connect button

## Troubleshooting

### Common Issues

1. **Connection Refused**: Make sure your WebSocket server is running
2. **CORS Issues**: Ensure your server accepts connections from your frontend domain
3. **SSL Issues**: Use `wss://` for HTTPS sites, `ws://` for HTTP sites
4. **Port Issues**: Check if the WebSocket port is accessible and not blocked

### Debug Mode

Check the browser console for WebSocket connection logs and errors.

## Security Considerations

- Use `wss://` (secure WebSocket) in production
- Implement proper authentication if handling sensitive data
- Validate all incoming messages on the server side
- Consider rate limiting to prevent abuse
