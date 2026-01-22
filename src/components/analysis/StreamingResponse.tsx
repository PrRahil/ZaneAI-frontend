"use client";

import { useState, useEffect, useRef } from "react";
import MarkdownRenderer from "./MarkdownRenderer";

interface StreamingResponseProps {
    content: string;
}

export function StreamingResponse({ content }: StreamingResponseProps) {
    const [displayedContent, setDisplayedContent] = useState("");
    const [isTyping, setIsTyping] = useState(true);
    const indexRef = useRef(0);
    const timeoutRef = useRef<NodeJS.Timeout | null>(null);

    useEffect(() => {
        if (indexRef.current < content.length) {
            setIsTyping(true);

            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
            }

            const typeNextChar = () => {
                if (indexRef.current < content.length) {
                    const remaining = content.length - indexRef.current;
                    const chunkSize = remaining > 100 ? 3 : remaining > 40 ? 2 : 1;

                    const nextChunk = content.slice(indexRef.current, indexRef.current + chunkSize);
                    setDisplayedContent((prev) => prev + nextChunk);
                    indexRef.current += chunkSize;

                    timeoutRef.current = setTimeout(typeNextChar, 30);
                } else {
                    setIsTyping(false);
                    timeoutRef.current = null;
                }
            };

            typeNextChar();
        } else if (content.length > 0 && indexRef.current >= content.length) {
            if (displayedContent !== content) {
                setDisplayedContent(content);
            }
            setIsTyping(false);
        }

        return () => {
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
            }
        };
    }, [content]);



    return (
        <div className={isTyping ? "typing-active" : ""}>
            <MarkdownRenderer markdown={displayedContent} />
            {isTyping && <span className="animate-pulse inline-block w-1.5 h-4 bg-primary ml-1 align-middle"></span>}
        </div>
    );
}
