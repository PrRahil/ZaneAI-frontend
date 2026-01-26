import { useEffect, useState, useRef } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { MessageCircle, Send, Bot, User } from "lucide-react";
import { ChatMessage, ChatResponsePayload, WebSocketMessage } from "@/types/chat";
import { ImpactAnalysisData } from "@/types/impact-analysis";
import { useWebSocket } from "@/hooks/useWebSocket";
import { useChat } from "@/hooks/useChat"; // Import custom hook
import { StreamingResponse } from "./StreamingResponse";
import MarkdownRenderer from "./MarkdownRenderer";
import apiClient from "@/lib/apiClient";
import { useAuthStore } from "@/store/useAuthStore";

interface ChatInterfaceProps {
  data: ImpactAnalysisData;
}

export function ChatInterface({ data }: ChatInterfaceProps) {
  const {
    threadId,
    setThreadId,
    messages,
    setMessages,
    isLoadingHistory,
  } = useChat(undefined, [
    {
      id: "welcome",
      sender: "assistant",
      content:
        "Hi! I can help you understand the impact of your SQL changes. Ask me anything about the affected queries, tables, or columns.",
      timestamp: new Date(),
    },
  ]);

  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [pendingMessage, setPendingMessage] = useState<string | null>(null);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const { user } = useAuthStore();

  const {
    isConnected,
    connectionState,
    connect,
    sendChatMessage,
    currentThreadId,
    setCurrentThreadId,
  } = useWebSocket({
    threadId,
    autoConnect: true,
    onChatResponse: (response: ChatResponsePayload) => {
      if (response.thread_id && !threadId) {
        setThreadId(response.thread_id);
      }

      const assistantMessage: ChatMessage = {
        id: `ai-${Date.now()}`,
        sender: "assistant",
        content: response.response,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, assistantMessage]);
      setIsLoading(false);
    },
    onMessage: (message: WebSocketMessage) => {
      switch (message.type) {
        case "system_message":
          if (message.data?.status === "connected") {
            break;
          }
          if (message.data?.status === "thread_created" && message.data.thread_id) {
            setThreadId(message.data.thread_id);
          }
          if (message.data?.message) {
            setMessages((prev) => [
              ...prev,
              {
                id: `system-${Date.now()}`,
                sender: "assistant",
                content: message.data.message,
                timestamp: new Date(),
              },
            ]);
          }
          break;
        case "error":
          setIsLoading(false);
          if (message.data?.error_message) {
            setMessages((prev) => [
              ...prev,
              {
                id: `error-${Date.now()}`,
                sender: "assistant",
                content: message.data.error_message,
                timestamp: new Date(),
              },
            ]);
          }
          break;
      }
    },
    onError: () => {
      setIsLoading(false);
    },
  });

  // Sync WebSocket thread ID with local thread ID
  useEffect(() => {
    if (currentThreadId && currentThreadId !== threadId) {
      setThreadId(currentThreadId);
    }
  }, [currentThreadId, threadId, setThreadId]);

  // Sync local thread ID to WebSocket hook if it changes
  useEffect(() => {
    if (threadId && setCurrentThreadId) {
      setCurrentThreadId(threadId);
    }
  }, [threadId, setCurrentThreadId]);


  // ---------------------- SEND MESSAGE ----------------------
  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      sender: "user",
      content: input,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    if (isConnected) {
      const sent = sendChatMessage(input);
      if (!sent) {
        setIsLoading(false);
      }
      return;
    }

    setPendingMessage(input);
    connect();
  };

  useEffect(() => {
    if (!isConnected || !pendingMessage) return;

    const sent = sendChatMessage(pendingMessage);
    if (!sent) {
      setIsLoading(false);
    }
    setPendingMessage(null);
  }, [isConnected, pendingMessage, sendChatMessage]);

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <Card className="min-h-[100%] flex flex-col">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MessageCircle className="h-4 w-4" />
          Impact Analysis Assistant
        </CardTitle>
      </CardHeader>

      <CardContent className="flex-1 flex flex-col p-0">
        <ScrollArea className="flex-1 p-4" ref={scrollAreaRef}>
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <span>
                {isConnected
                  ? `Connected${currentThreadId ? ` • Thread ${currentThreadId}` : ""}`
                  : connectionState.isConnecting
                    ? "Connecting..."
                    : "Disconnected"}
              </span>
              {isLoadingHistory && (
                <span className="flex items-center gap-1 text-primary animate-pulse">
                  Restoring history...
                </span>
              )}
            </div>
            {messages.map((message, index) => {
              const isLastMessage = index === messages.length - 1;
              const shouldStream = isLastMessage && message.sender === "assistant";
              if (isLastMessage) {
                console.log("[Chat] Render Last Message. ID:", message.id, "Role:", message.sender, "ShouldStream:", shouldStream);
              }

              return (
                <div
                  key={message.id}
                  className={`flex gap-3 ${message.sender === "user" ? "justify-end" : "justify-start"
                    }`}
                >
                  {message.sender === "assistant" && (
                    <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
                      <Bot className="h-4 w-4 text-primary-foreground" />
                    </div>
                  )}

                  <div
                    className={`max-w-[80%] p-3 rounded-lg ${message.sender === "user"
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted"
                      }`}
                  >
                    {message.sender === "user" ? (
                      <p className="text-sm">{message.content}</p>
                    ) : (
                      shouldStream ? (
                        <StreamingResponse content={message.content} />
                      ) : (
                        <MarkdownRenderer markdown={message.content} />
                      )
                    )}

                    <p
                      className={`text-xs mt-1 ${message.sender === "user"
                        ? "text-primary-foreground/70"
                        : "text-muted-foreground"
                        }`}
                    >
                      {message.timestamp.toLocaleDateString()} {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>

                  {message.sender === "user" && (
                    <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
                      <User className="h-4 w-4 text-muted-foreground" />
                    </div>
                  )}
                </div>
              )
            })}

            {isLoading && (
              <div className="flex gap-3 justify-start">
                <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
                  <Bot className="h-4 w-4 text-primary-foreground" />
                </div>
                <div className="bg-muted p-3 rounded-lg">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" />
                    <div
                      className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce"
                      style={{ animationDelay: "150ms" }}
                    />
                    <div
                      className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce"
                      style={{ animationDelay: "300ms" }}
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
        </ScrollArea>

        <div className="sticky bottom-0 z-[999] bg-[hsl(var(--card))] border-t p-4">
          <div className="flex gap-2">
            <Input
              placeholder="Ask about the impact analysis..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              disabled={isLoading}
            />
            <Button onClick={handleSend} disabled={isLoading || !input.trim()}>
              <Send className="h-4 w-4" />
            </Button>
          </div>

        </div>
      </CardContent>
    </Card>
  );
}
