"use client";
import * as TooltipPrimitive from "@radix-ui/react-tooltip";
export function TooltipProvider({ children }: { children: React.ReactNode }) {
  return (
    <TooltipPrimitive.Provider delayDuration={100}>
      {children}
    </TooltipPrimitive.Provider>
  );
}
export const Tooltip = TooltipPrimitive.Root;
export const TooltipTrigger = TooltipPrimitive.Trigger;
export const TooltipContent = ({ children }: { children: React.ReactNode }) => (
  <TooltipPrimitive.Content
    className="rounded-xl border px-3 py-2 text-sm bg-
[hsl(var(--bg))]"
  >
    {children}
    <TooltipPrimitive.Arrow />
  </TooltipPrimitive.Content>
);
