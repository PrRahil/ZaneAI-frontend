"use client";

import { motion } from "framer-motion";
import { cn } from "@/components/ui/utils";
import { WebSocketConnectionState } from "@/types/chat";

interface ConnectionStatusProps {
  connectionState: WebSocketConnectionState;
  className?: string;
}

export default function ConnectionStatus({
  connectionState,
  className,
}: ConnectionStatusProps) {
  const {
    isConnected,
    isConnecting,
    isReconnecting,
    error,
    reconnectAttempts,
  } = connectionState;

  const getStatusConfig = () => {
    if (error) {
      return {
        color: "bg-red-500",
        text: `Error: ${error}`,
        icon: "⚠️",
      };
    }

    if (isReconnecting) {
      return {
        color: "bg-yellow-500",
        text: `Reconnecting... (${reconnectAttempts}/5)`,
        icon: "🔄",
      };
    }

    if (isConnecting) {
      return {
        color: "bg-yellow-500",
        text: "Connecting...",
        icon: "🔄",
      };
    }

    if (isConnected) {
      return {
        color: "bg-green-500",
        text: "Connected",
        icon: "✅",
      };
    }

    return {
      color: "bg-gray-500",
      text: "Disconnected",
      icon: "⚪",
    };
  };

  const statusConfig = getStatusConfig();

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        "flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium",
        "bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10",
        className
      )}
    >
      <div className="flex items-center gap-1.5">
        <motion.div
          animate={
            isConnecting || isReconnecting ? { rotate: 360 } : { rotate: 0 }
          }
          transition={{
            duration: 1,
            repeat: isConnecting || isReconnecting ? Infinity : 0,
            ease: "linear",
          }}
          className={cn("w-2 h-2 rounded-full", statusConfig.color)}
        />
        <span className="text-black/70 dark:text-white/70">
          {statusConfig.text}
        </span>
      </div>
    </motion.div>
  );
}
