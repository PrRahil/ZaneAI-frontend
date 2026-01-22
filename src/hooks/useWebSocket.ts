"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { WEBSOCKET_CONFIG } from "@/config/websocket";
import {
  WebSocketMessage,
  WebSocketConnectionState,
  ChatResponsePayload,
  OutgoingChatMessage,
  SystemMessagePayload,
} from "@/types/chat";

import { useAuthStore } from "@/store/useAuthStore";

const createSessionId = () =>
  `session-${Date.now()}-${Math.random().toString(36).slice(2, 11)}`;

interface UseWebSocketOptions {
  url?: string;
  threadId?: string | null;
  userName?: string;
  onMessage?: (message: WebSocketMessage) => void;
  onChatResponse?: (response: ChatResponsePayload) => void;
  onSystemMessage?: (message: SystemMessagePayload) => void;
  onError?: (error: Event) => void;
  onConnect?: () => void;
  onDisconnect?: () => void;
  autoConnect?: boolean;
}

export function useWebSocket(options: UseWebSocketOptions = {}) {
  const { user, token } = useAuthStore();

  const {
    url: baseUrl = WEBSOCKET_CONFIG.url,
    threadId,
    userName,
    onMessage,
    onChatResponse,
    onSystemMessage,
    onError,
    onConnect,
    onDisconnect,
    autoConnect = true,
  } = options;

  const [currentThreadId, setCurrentThreadId] = useState<string | null>(
    threadId ?? null
  );
  const manualCloseRef = useRef(false);
  const reconnectAttemptsRef = useRef(0);
  const [sessionId] = useState(() => createSessionId());
  const sessionIdRef = useRef<string>(sessionId);

  const [connectionState, setConnectionState] =
    useState<WebSocketConnectionState>({
      isConnected: false,
      isConnecting: false,
      isReconnecting: false,
      error: null,
      reconnectAttempts: 0,
    });

  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const heartbeatIntervalRef = useRef<ReturnType<typeof setInterval> | null>(
    null
  );
  const connectionTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const connectRef = useRef<(() => void) | undefined>(undefined);

  useEffect(() => {
    setCurrentThreadId(threadId ?? null);
  }, [threadId]);

  // Clear all timeouts and intervals
  const clearTimers = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }
    if (heartbeatIntervalRef.current) {
      clearInterval(heartbeatIntervalRef.current);
      heartbeatIntervalRef.current = null;
    }
    if (connectionTimeoutRef.current) {
      clearTimeout(connectionTimeoutRef.current);
      connectionTimeoutRef.current = null;
    }
  }, []);

  // Start heartbeat to keep connection alive
  const startHeartbeat = useCallback(() => {
    clearTimers();
    heartbeatIntervalRef.current = setInterval(() => {
      if (wsRef.current?.readyState === WebSocket.OPEN) {
        wsRef.current.send(JSON.stringify(WEBSOCKET_CONFIG.heartbeatMessage));
      }
    }, WEBSOCKET_CONFIG.heartbeatInterval);
  }, [clearTimers]);

  const userId = user?.id;
  const userOrgId = user?.org_id;
  const tokenRef = useRef(token);
  tokenRef.current = token;

  const buildUrl = useCallback(() => {
    if (!userOrgId || !userId) {
      throw new Error(
        "Organization ID and User ID are required for WebSocket connections."
      );
    }

    const normalizedBase = baseUrl.replace(/\/$/, "");
    const params = new URLSearchParams({
      session_id: sessionIdRef.current,
      user_name: userName ?? user?.username ?? user?.email ?? "User",
    });

    if (tokenRef.current) {
      params.append("token", tokenRef.current);
    } else {
      console.warn(
        "useWebSocket: JWT token is missing; chatbot tools and history will be unavailable."
      );
    }

    if (currentThreadId) {
      params.append("thread_id", currentThreadId);
    }

    return `${normalizedBase}/${userOrgId}/${userId}?${params.toString()}`;
  }, [baseUrl, currentThreadId, userId, userOrgId, userName, user?.username, user?.email]);

  const connect = useCallback(() => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      return;
    }

    if (!userId || !userOrgId) {
      console.log("useWebSocket: User ID or Org ID missing. Waiting for user to load...");
      return;
    }

    setConnectionState((prev) => ({
      ...prev,
      isConnecting: true,
      error: null,
    }));

    try {
      const fullUrl = buildUrl();
      console.log("Connecting to WebSocket:", fullUrl);
      wsRef.current = new WebSocket(fullUrl);
      manualCloseRef.current = false;

      connectionTimeoutRef.current = setTimeout(() => {
        if (wsRef.current?.readyState !== WebSocket.OPEN) {
          wsRef.current?.close();
          setConnectionState((prev) => ({
            ...prev,
            isConnecting: false,
            error: "Connection timeout",
          }));
        }
      }, WEBSOCKET_CONFIG.connectionTimeout);

      wsRef.current.onopen = () => {
        clearTimers();
        reconnectAttemptsRef.current = 0;
        setConnectionState((prev) => ({
          ...prev,
          isConnected: true,
          isConnecting: false,
          isReconnecting: false,
          error: null,
          reconnectAttempts: 0,
        }));
        startHeartbeat();
        onConnect?.();
      };

      wsRef.current.onclose = (event) => {
        console.log("WebSocket closed. Code:", event.code, "Reason:", event.reason, "WasClean:", event.wasClean);
        clearTimers();
        setConnectionState((prev) => ({
          ...prev,
          isConnected: false,
          isConnecting: false,
        }));
        onDisconnect?.();

        if (manualCloseRef.current) {
          manualCloseRef.current = false;
          return;
        }

        if (
          autoConnect &&
          reconnectAttemptsRef.current < WEBSOCKET_CONFIG.maxReconnectAttempts
        ) {
          reconnectAttemptsRef.current += 1;
          setConnectionState((prev) => ({
            ...prev,
            isReconnecting: true,
            reconnectAttempts: reconnectAttemptsRef.current,
          }));

          reconnectTimeoutRef.current = setTimeout(() => {
            connectRef.current?.();
          }, WEBSOCKET_CONFIG.reconnectInterval);
        }
      };

      wsRef.current.onerror = (error) => {
        console.error("WebSocket error event:", error);
        clearTimers();
        setConnectionState((prev) => ({
          ...prev,
          isConnecting: false,
          error: "Connection error",
        }));
        onError?.(error);
      };

      wsRef.current.onmessage = (event) => {
        try {
          const message: WebSocketMessage = JSON.parse(event.data);
          const data = message.data as any;

          switch (message.type) {
            case "system_message":
              if (
                data?.status === "thread_created" &&
                data?.thread_id
              ) {
                setCurrentThreadId(data.thread_id);
              }
              onSystemMessage?.(data as SystemMessagePayload);
              break;
            case "ai_response":
              if (data?.thread_id) {
                setCurrentThreadId((prev) => prev ?? data.thread_id);
              }
              onChatResponse?.(data as ChatResponsePayload);
              break;
            case "pong":
              // Handle heartbeat response
              break;
            case "error":
              setConnectionState((prev) => ({
                ...prev,
                error:
                  data?.error_message ||
                  data?.message ||
                  "Server error",
              }));
              break;
            default:
              break;
          }
          onMessage?.(message);
        } catch (error) {
          console.error("Failed to parse WebSocket message:", error);
        }
      };
    } catch (error) {
      console.error("Failed to create WebSocket connection", error);
      setConnectionState((prev) => ({
        ...prev,
        isConnecting: false,
        error: "Failed to create WebSocket connection",
      }));
    }
  }, [
    buildUrl,
    onMessage,
    onChatResponse,
    onSystemMessage,
    onError,
    onConnect,
    onDisconnect,
    autoConnect,
    clearTimers,
    startHeartbeat,
    userId,
    userOrgId,
  ]);

  useEffect(() => {
    connectRef.current = connect;
  }, [connect]);

  // Disconnect from WebSocket
  const disconnect = useCallback(() => {
    manualCloseRef.current = true;
    clearTimers();
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }
    reconnectAttemptsRef.current = 0;
    setConnectionState({
      isConnected: false,
      isConnecting: false,
      isReconnecting: false,
      error: null,
      reconnectAttempts: 0,
    });
  }, [clearTimers]);

  // Send message
  const sendMessage = useCallback((message: OutgoingChatMessage) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(message));
      return true;
    } else {
      console.warn("WebSocket is not connected. Cannot send message.");
      return false;
    }
  }, []);

  // Send chat message
  const sendChatMessage = useCallback(
    (content: string) => {
      const payload: OutgoingChatMessage = {
        type: "chat_message",
        content,
        thread_id: currentThreadId,
      };

      return sendMessage(payload);
    },
    [currentThreadId, sendMessage]
  );

  // Auto-connect on mount
  // useEffect(() => {
  //   if (autoConnect) {
  //     connect();
  //   }

  // }, [autoConnect, connect]);
  const hasConnectedRef = useRef(false);

  useEffect(() => {
    if (!autoConnect) return;
    if (!userId || !userOrgId) return;
    if (hasConnectedRef.current) return;

    hasConnectedRef.current = true;
    connect();
  }, [autoConnect, userId, userOrgId, connect]);
  // Cleanup on unmount
  useEffect(() => {
    return () => {
      clearTimers();
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, [clearTimers]);

  return {
    connectionState,
    connect,
    disconnect,
    sendMessage,
    sendChatMessage,
    isConnected: connectionState.isConnected,
    isConnecting: connectionState.isConnecting,
    isReconnecting: connectionState.isReconnecting,
    error: connectionState.error,
    reconnectAttempts: connectionState.reconnectAttempts,
    currentThreadId,
    setCurrentThreadId,
  };
}
