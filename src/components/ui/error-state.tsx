import { AlertTriangle, LucideIcon } from "lucide-react";
import { cn } from "./utils";
import React from "react";

interface ErrorStateProps {
    title?: string;
    description?: string;
    icon?: LucideIcon;
    action?: React.ReactNode;
    className?: string;
}

export function ErrorState({
    title = "Something went wrong",
    description = "We encountered an error while processing your request.",
    icon: Icon = AlertTriangle,
    action,
    className,
}: ErrorStateProps) {
    return (
        <div
            className={cn(
                "flex min-h-[400px] flex-col items-center justify-center p-8 text-center animate-in fade-in zoom-in-95 duration-300",
                className
            )}
        >
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-muted mb-6">
                <Icon className="h-10 w-10 text-muted-foreground" />
            </div>
            <h3 className="text-2xl font-semibold tracking-tight mb-2">{title}</h3>
            <p className="text-muted-foreground max-w-md mb-8">{description}</p>
            {action && <div>{action}</div>}
        </div>
    );
}
