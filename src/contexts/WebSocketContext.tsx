"use client";

import React, { createContext, useContext, ReactNode } from "react";
import { useWebSocket } from "@/hooks/useWebSocket";
import {
  WebSocketConnectionState,
  ChatResponsePayload,
  OutgoingChatMessage,
} from "@/types/chat";

interface WebSocketContextType {
  connectionState: WebSocketConnectionState;
  connect: () => void;
  disconnect: () => void;
  sendMessage: (message: OutgoingChatMessage) => boolean;
  sendChatMessage: (content: string) => boolean;
  isConnected: boolean;
  isConnecting: boolean;
  isReconnecting: boolean;
  error: string | null;
  reconnectAttempts: number;
  currentThreadId: string | null;
}

const WebSocketContext = createContext<WebSocketContextType | null>(null);

interface WebSocketProviderProps {
  children: ReactNode;
  onChatResponse?: (response: ChatResponsePayload) => void;
  onError?: (error: Event) => void;
  onConnect?: () => void;
  onDisconnect?: () => void;
  autoConnect?: boolean;
}

export function WebSocketProvider({
  children,
  onChatResponse,
  onError,
  onConnect,
  onDisconnect,
  autoConnect = false, // Don't auto-connect by default, let components decide
}: WebSocketProviderProps) {
  const websocket = useWebSocket({
    onChatResponse,
    onError,
    onConnect,
    onDisconnect,
    autoConnect,
  });

  return (
    <WebSocketContext.Provider value={websocket}>
      {children}
    </WebSocketContext.Provider>
  );
}

export function useWebSocketContext() {
  const context = useContext(WebSocketContext);
  if (!context) {
    throw new Error(
      "useWebSocketContext must be used within a WebSocketProvider"
    );
  }
  return context;
}

// Optional: Hook for components that want WebSocket but don't require it
export function useOptionalWebSocket() {
  try {
    return useWebSocketContext();
  } catch {
    return null;
  }
}
