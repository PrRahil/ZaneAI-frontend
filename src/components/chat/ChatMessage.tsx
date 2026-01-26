"use client";

import { ChatMessage as ChatMessageType } from "@/types/chat";
import { cn } from "@/components/ui/utils";
import { motion } from "framer-motion";
import { useState, useEffect, useRef } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeHighlight from "rehype-highlight";
import "highlight.js/styles/github-dark.css";

interface ChatMessageProps {
  message: ChatMessageType;
  isStreaming?: boolean;
}

export default function ChatMessage({ message, isStreaming = false }: ChatMessageProps) {
  const isUser = message.sender === "user";
  const [displayedContent, setDisplayedContent] = useState(isStreaming ? "" : message.content);
  const indexRef = useRef(0);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!isStreaming) {
      setDisplayedContent(message.content);
      return;
    }

    if (indexRef.current < message.content.length) {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);

      const typeNextChar = () => {
        if (indexRef.current < message.content.length) {
          const remaining = message.content.length - indexRef.current;
          const chunkSize = remaining > 100 ? 3 : remaining > 40 ? 2 : 1;

          const nextChunk = message.content.slice(indexRef.current, indexRef.current + chunkSize);
          setDisplayedContent((prev) => prev + nextChunk);
          indexRef.current += chunkSize;

          timeoutRef.current = setTimeout(typeNextChar, 30);
        } else {
          timeoutRef.current = null;
        }
      };
      typeNextChar();
    }

    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    }
  }, [message.content, isStreaming]);

  const formatTime = (date: Date) => {
    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    }).format(date);
  };

  const processedContent = displayedContent
    .replace(/^=== (.*) ===$/gm, "### $1")
    .replace(/^== (.*) ==$/gm, "## $1");

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={cn(
        "flex w-full mb-6",
        isUser ? "justify-end" : "justify-start"
      )}
    >
      <div
        className={cn(
          "max-w-[85%] rounded-2xl px-5 py-4 relative shadow-sm",
          isUser
            ? "bg-black dark:bg-white text-white dark:text-black ml-12"
            : "bg-[hsl(var(--card))] text-[hsl(var(--foreground))] border border-[hsl(var(--border))] mr-12"
        )}
      >
        <div className={cn("text-sm leading-relaxed", !isUser && "markdown-content")}>
          {isUser ? (
            <div className="whitespace-pre-wrap">{message.content}</div>
          ) : (
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              rehypePlugins={[rehypeHighlight]}
              components={{
                pre: ({ children }) => <>{children}</>,
                p: ({ children }) => <p className="mb-3 last:mb-0">{children}</p>,
                ul: ({ children }) => (
                  <ul className="list-disc pl-6 mb-3 space-y-1">{children}</ul>
                ),
                ol: ({ children }) => (
                  <ol className="list-decimal pl-6 mb-3 space-y-1">{children}</ol>
                ),
                li: ({ children }) => <li>{children}</li>,
                h1: ({ children }) => (
                  <h1 className="text-xl font-bold mb-3 mt-4 first:mt-0">
                    {children}
                  </h1>
                ),
                h2: ({ children }) => (
                  <h2 className="text-lg font-bold mb-3 mt-4 first:mt-0">
                    {children}
                  </h2>
                ),
                h3: ({ children }) => (
                  <h3 className="text-base font-bold mb-2 mt-3 first:mt-0">
                    {children}
                  </h3>
                ),
                code: ({ className, children, ...props }) => {
                  const match = /language-(\w+)/.exec(className || "");
                  const isInline = !match && !String(children).includes("\n");

                  if (isInline) {
                    return (
                      <code
                        className="bg-[hsl(var(--muted))] text-[hsl(var(--foreground))] px-1.5 py-0.5 rounded-md text-xs font-mono border border-[hsl(var(--border))]"
                        {...props}
                      >
                        {children}
                      </code>
                    );
                  }

                  return (
                    <div className="relative my-4 rounded-lg overflow-hidden border border-[hsl(var(--border))]">
                      <div className="flex items-center justify-between px-3 py-1.5 bg-[hsl(var(--muted))] border-b border-[hsl(var(--border))]">
                        <span className="text-xs text-[hsl(var(--muted-foreground))] font-medium uppercase">
                          {match?.[1] || "text"}
                        </span>
                      </div>
                      <div className="overflow-x-auto bg-[#0d1117]">
                        <code className={cn(className, "block p-3 text-sm font-mono text-white")} {...props}>
                          {children}
                        </code>
                      </div>
                    </div>
                  );
                },
                table: ({ children }) => (
                  <div className="my-4 w-full overflow-x-auto rounded-lg border border-[hsl(var(--border))] shadow-xs">
                    <table className="w-full text-sm text-left">{children}</table>
                  </div>
                ),
                thead: ({ children }) => (
                  <thead className="bg-[hsl(var(--muted))] text-[hsl(var(--muted-foreground))] font-medium border-b border-[hsl(var(--border))]">
                    {children}
                  </thead>
                ),
                tbody: ({ children }) => (
                  <tbody className="divide-y divide-[hsl(var(--border))]">
                    {children}
                  </tbody>
                ),
                tr: ({ children }) => (
                  <tr className="hover:bg-[hsl(var(--muted))]/50 transition-colors">
                    {children}
                  </tr>
                ),
                th: ({ children }) => (
                  <th className="px-4 py-3 font-medium">{children}</th>
                ),
                td: ({ children }) => <td className="px-4 py-3">{children}</td>,
                blockquote: ({ children }) => (
                  <blockquote className="border-l-4 border-[hsl(var(--primary))] pl-4 my-4 italic text-[hsl(var(--muted-foreground))]">
                    {children}
                  </blockquote>
                ),
                a: ({ href, children }) => (
                  <a
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-500 hover:underline font-medium"
                  >
                    {children}
                  </a>
                ),
                hr: () => <hr className="my-4 border-[hsl(var(--border))]" />,
                img: ({ src, alt }) => (
                  <img src={src} alt={alt} className="max-w-full rounded-lg my-4" />
                )
              }}
            >
              {processedContent}
            </ReactMarkdown>
          )}
        </div>
        <div
          className={cn(
            "text-[10px] mt-2 select-none",
            isUser
              ? "text-white/70 dark:text-black/70 text-right"
              : "text-[hsl(var(--muted-foreground))]"
          )}
        >
          {formatTime(message.timestamp)}
        </div>
      </div>
    </motion.div>
  );
}
