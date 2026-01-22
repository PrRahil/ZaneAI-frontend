export interface ChatMessage {
  id: string;
  content: string;
  timestamp: Date;
  sender: "user" | "assistant";
}

export interface ChatState {
  messages: ChatMessage[];
  isLoading: boolean;
}

export type WebSocketMessageType =
  | "system_message"
  | "chat_message"
  | "ai_response"
  | "typing"
  | "user_status"
  | "error"
  | "ping"
  | "pong";

export interface WebSocketMessage {
  type: WebSocketMessageType;
  data?: unknown;
  sender_id?: string;
  sender_name?: string;
  room_id?: string;
  timestamp?: string;
}

export interface OutgoingChatMessage {
  type: "chat_message";
  content: string;
  thread_id?: string | null;
}

export interface TypingPayload {
  is_typing: boolean;
  sender_id?: string;
  sender_name?: string;
}

export interface SystemMessagePayload {
  message: string;
  session_id?: string;
  user_name?: string;
  status?: "connected" | "thread_created" | "error";
  thread_id?: string;
}

export interface IncomingChatMessagePayload {
  content: string;
  sender_id?: string;
  sender_name?: string;
  message_type?: "user" | "assistant";
  thread_id?: string;
}

export interface ChatMessagePayload {
  content: string;
  thread_id?: string | null;
}

export interface ChatResponsePayload {
  response: string;
  thread_id?: string | null;
  impacted_queries?: unknown[];
  pr_repo_data?: Record<string, unknown>;
  code_suggestions?: unknown[];
  jira_ticket?: Record<string, unknown> | null;
  processing_time?: number;
}

export interface WebSocketConnectionState {
  isConnected: boolean;
  isConnecting: boolean;
  isReconnecting: boolean;
  error: string | null;
  reconnectAttempts: number;
}
