"use client";

import * as React from "react";
import { cn } from "./utils";

interface InputProps extends React.ComponentProps<"input"> {
  error?: boolean;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, error, ...props }, ref) => {
    return (
      <input
        type={type}
        ref={ref}
        className={cn(
          "flex h-10 w-full rounded-md px-3 py-2 text-base bg-background file:border-0 file:bg-transparent file:text-sm placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
          "border border-input focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",

          error &&
            "border-red-500 focus-visible:ring-red-200 focus-visible:ring-offset-0",

          "transition-all duration-150 ease-in-out",

          className
        )}
        {...props}
      />
    );
  }
);

Input.displayName = "Input";

export { Input };
