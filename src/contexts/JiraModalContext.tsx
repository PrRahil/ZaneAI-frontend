"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import CreateJiraTicketModal from "@/components/jira/CreateJiraTicketModal";

export interface JiraModalDefaultValues {
  summary?: string;
  description?: string;
  impact_analysis?: string;
  pr_url?: string;
  analysis_report_url?: string;
  affected_query_ids?: string[];
}

interface JiraModalContextValue {
  openJiraModal: (values: JiraModalDefaultValues) => void;
}

const JiraModalContext = createContext<JiraModalContextValue | null>(null);

export function JiraModalProvider({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const [defaultValues, setDefaultValues] = useState<JiraModalDefaultValues>({});
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Clear any pending timer on unmount to prevent setState on unmounted component
  useEffect(() => {
    return () => {
      if (timerRef.current !== null) {
        clearTimeout(timerRef.current);
      }
    };
  }, []);

  const openJiraModal = useCallback((values: JiraModalDefaultValues) => {
    setDefaultValues(values);
    // setTimeout(0) ensures defaultValues state is committed before open=true
    // triggers the modal's useEffect, avoiding a React batching issue where
    // impact_analysis would be empty on first open.
    if (timerRef.current !== null) {
      clearTimeout(timerRef.current);
    }
    timerRef.current = setTimeout(() => {
      timerRef.current = null;
      setOpen(true);
    }, 0);
  }, []);

  return (
    <JiraModalContext.Provider value={{ openJiraModal }}>
      {children}
      <CreateJiraTicketModal
        open={open}
        onClose={() => setOpen(false)}
        defaultValues={defaultValues}
      />
    </JiraModalContext.Provider>
  );
}

export function useJiraModal(): JiraModalContextValue {
  const ctx = useContext(JiraModalContext);
  if (!ctx) {
    throw new Error("useJiraModal must be used within a JiraModalProvider");
  }
  return ctx;
}
