"use client";

import { Bot } from "lucide-react";

export const LayoutSplashScreen = () => {
  return (
    <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-background">
      <div className="flex items-center gap-3 opacity-0 animate-fadeIn">
        <div className="h-12 w-12 bg-accent rounded-2xl flex items-center justify-center shadow-lg">
          <Bot className="h-6 w-6 text-accent-foreground" />
        </div>

        <span className="font-bold text-2xl text-foreground tracking-wide">
          Zane.AI
        </span>
      </div>
    </div>
  );
};
