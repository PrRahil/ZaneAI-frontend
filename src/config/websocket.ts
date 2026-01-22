export const WEBSOCKET_CONFIG = {
  // Base WebSocket URL - should point to /chat/ws
  url:
    (process.env.NEXT_PUBLIC_WEBSOCKET_URL &&
      process.env.NEXT_PUBLIC_WEBSOCKET_URL.replace(/\/$/, "")) ||
    "wss://queryguard-backend-dev.onrender.com/chat/ws",

  // Reconnection settings
  reconnectInterval: 3000, // 3 seconds
  maxReconnectAttempts: 5,

  // Connection timeout
  connectionTimeout: 10000, // 10 seconds

  // Heartbeat settings to keep connection alive
  heartbeatInterval: 30000, // 30 seconds
  heartbeatMessage: { type: "ping" } as const,
};
