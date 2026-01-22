import { useState, useEffect, useCallback } from "react";
import apiClient from "@/lib/apiClient";
import { ChatMessage } from "@/types/chat";
import { useAuthStore } from "@/store/useAuthStore";

export const useChat = (
    setCurrentThreadId?: (id: string | null) => void,
    initialMessages: ChatMessage[] = []
) => {
    const [threadId, setThreadId] = useState<string | null>(null);
    const [messages, setMessages] = useState<ChatMessage[]>(initialMessages);
    const [isLoadingHistory, setIsLoadingHistory] = useState(false);
    const { user } = useAuthStore();

    useEffect(() => {
        const restoreSession = async () => {
            if (!user?.org_id || threadId) return;

            try {
                const res = await apiClient.get('/chat/threads', {
                    params: { org_id: user.org_id }
                });
                const threads = Array.isArray(res.data) ? res.data : res.data?.threads || [];

                if (threads.length > 0) {
                    const latest = threads[0];
                    setThreadId(latest.id);
                    if (setCurrentThreadId) setCurrentThreadId(latest.id);
                }
            } catch (err) {
                console.error("[useChat] Failed to restore session:", err);
            }
        };

        if (user?.org_id && !threadId) {
            restoreSession();
        }
    }, [user?.org_id, threadId, setCurrentThreadId]);

    useEffect(() => {
        const loadHistory = async () => {
            if (!threadId) return;

            setIsLoadingHistory(true);
            try {
                const res = await apiClient.get(`/chat/threads/${threadId}`);
                const data = res.data;
                const msgs = data.messages || data.history || [];

                if (Array.isArray(msgs) && msgs.length > 0) {
                    const formatted: ChatMessage[] = msgs.map((m: any) => ({
                        id: m.id || `hist-${Math.random()}`,
                        content: m.content,
                        sender: m.role === 'user' ? 'user' : 'assistant',
                        timestamp: new Date(m.created_at || Date.now())
                    }));
                    setMessages(formatted);
                }
            } catch (err) {
                console.error("[useChat] Failed to load history:", err);
            } finally {
                setIsLoadingHistory(false);
            }
        };

        if (threadId) {
            loadHistory();
        }
    }, [threadId]);

    return {
        threadId,
        setThreadId,
        messages,
        setMessages,
        isLoadingHistory,
    };
};
