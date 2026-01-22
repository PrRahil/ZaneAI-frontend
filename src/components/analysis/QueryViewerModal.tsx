// components/analysis/QueryViewerModal.tsx
"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Copy, Check } from "lucide-react";
import { useState } from "react";
import toast from "react-hot-toast";

export function QueryViewerModal({
  isOpen,
  onClose,
  queries = [],
  title = "Queries",
}: any) {
  const [copied, setCopied] = useState<number | null>(null);

  const copyToClipboard = async (text: string, idx: number) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(idx);
      toast.success("Copied to clipboard", { duration: 1600 });
      setTimeout(() => setCopied(null), 1600);
    } catch {
      toast.error("Failed to copy", { duration: 1600 });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>

        <ScrollArea className="h-[56vh] p-4">
          <div className="space-y-4">
            {queries.length === 0 && (
              <div className="text-muted-foreground text-sm">
                No queries available.
              </div>
            )}
            {queries.map((q: any, i: number) => (
              <div key={i} className="bg-card p-3 rounded border">
                <div className="flex items-center justify-between mb-2">
                  <div className="text-sm font-medium">Query {i + 1}</div>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => copyToClipboard(q.query_text || q, i)}
                  >
                    {copied === i ? (
                      <Check className="h-4 w-4 text-green-500" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </Button>
                </div>
                <pre className="text-xs font-mono bg-background p-3 rounded overflow-x-auto whitespace-pre-wrap">
                  {q.query_text}
                </pre>
              </div>
            ))}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
