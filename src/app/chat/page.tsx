"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import ChatMessage from "@/components/chat/ChatMessage";
import ChatInput from "@/components/chat/ChatInput";
import ConnectionStatus from "@/components/chat/ConnectionStatus";
import {
  ChatMessage as ChatMessageType,
  ChatResponsePayload,
} from "@/types/chat";
import { Button } from "@/components/ui/button";
import { useWebSocket } from "@/hooks/useWebSocket";
import { useChat } from "@/hooks/useChat";
import { useAuthStore } from "@/store/useAuthStore";

export default function ChatPage() {
  const { threadId, setThreadId, messages, setMessages, isLoadingHistory } =
    useChat(undefined);

  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [pendingMessage, setPendingMessage] = useState<{
    content: string;
    messageId: string;
  } | null>(null);
  const fallbackTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [streamingMessageId, setStreamingMessageId] = useState<string | null>(
    null,
  );
  const userId = useAuthStore((state) => state.user?.id);
  const { user } = useAuthStore();

  const {
    connectionState,
    connect,
    disconnect,
    sendChatMessage,
    isConnected,
    currentThreadId,
    setCurrentThreadId,
  } = useWebSocket({
    threadId,
    onChatResponse: (response: ChatResponsePayload) => {
      if (response.thread_id && !threadId) {
        setThreadId(response.thread_id);
      }

      const assistantMessage: ChatMessageType = {
        id: `ai-${Date.now()}`,
        content: response.response,
        timestamp: new Date(),
        sender: "assistant",
      };

      setMessages((prev) => [...prev, assistantMessage]);
      setStreamingMessageId(assistantMessage.id);
      setIsLoading(false);
    },
    onMessage: (message) => {
      switch (message.type) {
        case "system_message":
          if (
            message.data?.status === "thread_created" &&
            message.data.thread_id
          ) {
            setThreadId(message.data.thread_id);
          }
          if (message.data?.status === "connected") {
            break; // Skip noisy welcome message
          }
          if (message.data?.message) {
            setMessages((prev) => [
              ...prev,
              {
                id: `system-${Date.now()}`,
                content: message.data.message,
                timestamp: new Date(),
                sender: "assistant",
              },
            ]);
          }
          break;
        case "chat_message":
          if (
            message.data?.sender_id &&
            userId &&
            message.data.sender_id === userId
          ) {
            return;
          }
          if (message.data?.content) {
            const newMessageId = `chat-${Date.now()}`;
            setMessages((prev) => [
              ...prev,
              {
                id: newMessageId,
                content: message.data.content,
                timestamp: new Date(),
                sender:
                  message.data?.message_type === "assistant"
                    ? "assistant"
                    : "user",
              },
            ]);
            if (message.data?.message_type === "assistant") {
              setStreamingMessageId(newMessageId);
            }
          }
          break;
        case "error":
          setIsLoading(false);
          if (message.data?.error_message) {
            setMessages((prev) => [
              ...prev,
              {
                id: `error-${Date.now()}`,
                content: message.data.error_message,
                timestamp: new Date(),
                sender: "assistant",
              },
            ]);
          }
          break;
      }
    },
    onError: (error) => {
      console.error("WebSocket error:", error);
      setIsLoading(false);
    },
    onConnect: () => {
      console.log("WebSocket connected");
    },
    onDisconnect: () => {
      console.log("WebSocket disconnected");
      setIsLoading(false);
    },
    autoConnect: false,
  });

  useEffect(() => {
    if (
      user?.id &&
      user?.org_id &&
      !isConnected &&
      !connectionState.isConnecting
    ) {
      console.log("[ChatPage] User ready, triggering connection...");
      connect();
    }
  }, [
    user?.id,
    user?.org_id,
    isConnected,
    connectionState.isConnecting,
    connect,
  ]);

  useEffect(() => {
    if (currentThreadId && currentThreadId !== threadId) {
      setThreadId(currentThreadId);
    }
  }, [currentThreadId, threadId, setThreadId]);

  useEffect(() => {
    if (threadId && setCurrentThreadId) {
      setCurrentThreadId(threadId);
    }
  }, [threadId, setCurrentThreadId]);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  // Auto-scroll to bottom when new messages are added
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async (content: string) => {
    console.log("Chat send attempt", {
      isConnected,
      hasPendingMessage: Boolean(pendingMessage),
    });

    // Add user message immediately
    const messageId = Date.now().toString();
    const userMessage: ChatMessageType = {
      id: messageId,
      content,
      timestamp: new Date(),
      sender: "user",
    };

    setMessages((prev) => [...prev, userMessage]);
    setIsLoading(true);

    // Try to send via WebSocket first
    if (isConnected) {
      const sent = sendChatMessage(content);
      if (!sent) {
        const errorMessage: ChatMessageType = {
          id: (Date.now() + 1).toString(),
          content:
            "Failed to send message. Please check your connection and try again.",
          timestamp: new Date(),
          sender: "assistant",
        };
        setMessages((prev) => [...prev, errorMessage]);
        setIsLoading(false);
      }
      return;
    }

    console.log(
      "WebSocket not connected; queueing message and calling connect()",
    );
    setPendingMessage({ content, messageId });
    connect();
    if (fallbackTimeoutRef.current) {
      clearTimeout(fallbackTimeoutRef.current);
    }
    fallbackTimeoutRef.current = setTimeout(() => {
      if (!isConnected) {
        const fallbackId = (Date.now() + 1).toString();
        const fallbackMessage: ChatMessageType = {
          id: fallbackId,
          content:
            "I'm having trouble connecting to the server. This is a fallback response. Please check your connection or try again later.",
          timestamp: new Date(),
          sender: "assistant",
        };
        setMessages((prev) => [...prev, fallbackMessage]);
        setStreamingMessageId(fallbackId);
        setIsLoading(false);
        setPendingMessage(null);
      }
    }, 3000);
  };

  // When the socket connects, send any queued message
  useEffect(() => {
    if (!isConnected || !pendingMessage) return;

    const sent = sendChatMessage(pendingMessage.content);
    if (!sent) {
      const errorMessage: ChatMessageType = {
        id: (Date.now() + 1).toString(),
        content: "Failed to send message after connecting. Please try again.",
        timestamp: new Date(),
        sender: "assistant",
      };
      setMessages((prev) => [...prev, errorMessage]);
      setIsLoading(false);
    }

    setPendingMessage(null);

    if (fallbackTimeoutRef.current) {
      clearTimeout(fallbackTimeoutRef.current);
      fallbackTimeoutRef.current = null;
    }
  }, [isConnected, pendingMessage, sendChatMessage]);

  useEffect(() => {
    return () => {
      if (fallbackTimeoutRef.current) {
        clearTimeout(fallbackTimeoutRef.current);
      }
    };
  }, []);

  const handleClearChat = () => {
    setMessages([]);
  };

  return (
    <div className="flex flex-col h-screen bg-[hsl(var(--bg))]">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between p-4 border-b border-[hsl(var(--border))] bg-[hsl(var(--bg))] sticky top-0 z-10"
      >
        <div>
          <div className="flex items-center gap-3 mb-2">
            <Link href="/">
              <Button variant="ghost" size="sm" className="p-2">
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 19l-7-7 7-7"
                  />
                </svg>
              </Button>
            </Link>
            <h1 className="text-2xl font-semibold tracking-tight">Ask Zane</h1>
          </div>
          <p className="text-sm text-black/60 dark:text-white/60">
            Ask questions about your data and get intelligent insights
          </p>
        </div>
        <div className="flex gap-2">
          <div className="flex items-center gap-2">
            <ConnectionStatus connectionState={connectionState} />
            {isLoadingHistory && (
              <span className="text-xs text-muted-foreground animate-pulse ml-2">
                Loading history...
              </span>
            )}
          </div>
          {isConnected ? (
            <Button variant="outline" size="sm" onClick={disconnect}>
              Disconnect
            </Button>
          ) : (
            <Button
              variant="outline"
              size="sm"
              onClick={connect}
              disabled={connectionState.isConnecting}
            >
              {connectionState.isConnecting ? "Connecting..." : "Connect"}
            </Button>
          )}
          <Button
            variant="outline"
            size="sm"
            onClick={handleClearChat}
            disabled={messages.length === 0}
          >
            Clear Chat
          </Button>
        </div>
      </motion.div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4">
        {isLoadingHistory && messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full space-y-4">
            <div className="w-8 h-8 border-4 border-t-primary border-[hsl(var(--muted))] rounded-full animate-spin" />
            <p className="text-sm text-muted-foreground">
              Restoring your conversation...
            </p>
          </div>
        ) : messages.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col items-center justify-center h-full text-center"
          >
            <div className="max-w-md space-y-4">
              <div className="w-16 h-16 mx-auto bg-linear-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center">
                <svg
                  className="w-8 h-8 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                  />
                </svg>
              </div>
              <h3 className="text-lg font-medium">Start a conversation</h3>
              <p className="text-sm text-black/60 dark:text-white/60">
                Ask me anything about your data, lineage, or queries. I&apos;m
                here to help!
              </p>
            </div>
          </motion.div>
        ) : (
          <div className="max-w-4xl mx-auto">
            {messages.map((message, index) => {
              const shouldStream = message.id === streamingMessageId;
              return (
                <ChatMessage
                  key={message.id}
                  message={message}
                  isStreaming={shouldStream}
                />
              );
            })}
            {isLoading && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex justify-start mb-4"
              >
                <div className="max-w-[70%] rounded-2xl px-4 py-3 bg-[hsl(var(--muted))]">
                  <div className="flex items-center gap-2">
                    <div className="flex gap-1">
                      <div
                        className="w-2 h-2 bg-[hsl(var(--fg))]/60 rounded-full animate-bounce"
                        style={{ animationDelay: "0ms" }}
                      />
                      <div
                        className="w-2 h-2 bg-[hsl(var(--fg))]/60 rounded-full animate-bounce"
                        style={{ animationDelay: "150ms" }}
                      />
                      <div
                        className="w-2 h-2 bg-[hsl(var(--fg))]/60 rounded-full animate-bounce"
                        style={{ animationDelay: "300ms" }}
                      />
                    </div>
                    <span className="text-sm text-[hsl(var(--fg))]/60">
                      Zane.AI thinking...
                    </span>
                  </div>
                </div>
              </motion.div>
            )}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Input Area */}
      <ChatInput
        onSendMessage={handleSendMessage}
        isLoading={isLoading}
        placeholder={
          isConnected
            ? "Ask about your data, lineage, or any queries..."
            : "Connect to WebSocket to start chatting..."
        }
      />
    </div>
  );
}
