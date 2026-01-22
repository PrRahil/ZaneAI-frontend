"use client";
import { useEffect, useState } from "react";
import { MoonIcon, SunIcon } from "@radix-ui/react-icons";
import { Button } from "@/components/ui/button";
function getInitialTheme() {
  if (typeof window === "undefined") return "light";
  const stored = localStorage.getItem("theme");
  if (stored === "light" || stored === "dark") return stored;
  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
}
export default function ThemeToggle() {
  const [theme, setTheme] = useState<string>(getInitialTheme());
  useEffect(() => {
    const root = document.documentElement;
    if (theme === "dark") root.classList.add("dark");
    else root.classList.remove("dark");
    localStorage.setItem("theme", theme);
  }, [theme]);
  return (
    <Button
      variant="outline"
      size="sm"
      aria-label="Toggle theme"
      onClick={() => setTheme((t) => (t === "dark" ? "light" : "dark"))}
    >
      {theme === "dark" ? <SunIcon /> : <MoonIcon />}
      <span className="sronly">Toggle theme</span>
    </Button>
  );
}
