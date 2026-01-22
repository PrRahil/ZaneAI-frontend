"use client";

import { useState, KeyboardEvent } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/components/ui/utils";

interface ChatInputProps {
  onSendMessage: (message: string) => void;
  isLoading?: boolean;
  placeholder?: string;
}

export default function ChatInput({
  onSendMessage,
  isLoading = false,
  placeholder = "Type your message...",
}: ChatInputProps) {
  const [message, setMessage] = useState("");

  const handleSubmit = () => {
    if (message.trim() && !isLoading) {
      onSendMessage(message.trim());
      setMessage("");
    }
  };

  const handleKeyPress = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div className="flex items-center gap-3 p-4 bg-[hsl(var(--bg))] border-t border-[hsl(var(--border))]">
      <div className="flex-1">
        <Input
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder={placeholder}
          disabled={isLoading}
          className="min-h-12 rounded-2xl resize-none"
        />
      </div>
      <Button
        onClick={handleSubmit}
        disabled={!message.trim() || isLoading}
        size="lg"
        className={cn(
          "rounded-2xl min-w-20",
          !message.trim() && "opacity-50 cursor-not-allowed"
        )}
      >
        Send
      </Button>
    </div>
  );
}
