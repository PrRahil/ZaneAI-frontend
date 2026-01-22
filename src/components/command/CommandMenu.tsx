"use client";
import * as React from "react";
import { Command } from "cmdk";
import { useRouter } from "next/navigation";
const ASSETS = [
  { id: "a", label: "Raw.Users" },
  { id: "b", label: "Stg.Users" },
  { id: "c", label: "Dim.Users" },
];
export default function CommandMenu() {
  const [open, setOpen] = React.useState(false);
  const router = useRouter();
  React.useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen((o) => !o);
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);
  return (
    <div
      role="dialog"
      aria-modal
      style={{ display: open ? "block" : "none" }}
      className="fixed inset-0 z-50"
      onClick={() => setOpen(false)}
    >
      <div className="absolute inset-0 bg-black/20" />
      <div
        className="absolute left-1/2 top-24 -translate-x-1/2 w-full max-wxl"
        onClick={(e) => e.stopPropagation()}
      >
        <Command
          className="rounded-2xl border bg-[hsl(var(--bg))] text-
[hsl(var(--fg))] shadow-xl"
        >
          <Command.Input
            placeholder="Search assets, routes…"
            className="w-full
border-b p-3 outline-none rounded-t-2xl"
          />
          <Command.List className="max-h-80 overflow-auto">
            <Command.Empty className="p-3 text-sm opacity-60">
              No results found.
            </Command.Empty>
            <Command.Group heading="Navigation">
              <Command.Item
                onSelect={() => {
                  router.push("/");
                  setOpen(false);
                }}
              >
                Home
              </Command.Item>
              <Command.Item
                onSelect={() => {
                  router.push("/runs");
                  setOpen(false);
                }}
              >
                Runs
              </Command.Item>
              <Command.Item
                onSelect={() => {
                  router.push("/settings");
                  setOpen(false);
                }}
              >
                Settings
              </Command.Item>
            </Command.Group>
            <Command.Group heading="Assets">
              {ASSETS.map((a) => (
                <Command.Item
                  key={a.id}
                  onSelect={() => {
                    router.push(`/asset/$
{a.id}`);
                    setOpen(false);
                  }}
                >
                  {a.label}
                </Command.Item>
              ))}
            </Command.Group>
          </Command.List>
        </Command>
      </div>
    </div>
  );
}
