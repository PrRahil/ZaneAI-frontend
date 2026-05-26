"use client";

import { useMemo, useRef, useState } from "react";
import { Check, ChevronsUpDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/components/ui/utils";
import type { JiraAssignableUser } from "@/hooks/useJira";

export const UNASSIGNED = "__unassigned__";

const MAX_VISIBLE_RESULTS = 50;

interface AssigneeComboboxProps {
  value: string;
  onChange: (value: string) => void;
  users: JiraAssignableUser[] | undefined;
  disabled?: boolean;
  placeholder?: string;
  className?: string;
}

export function AssigneeCombobox({
  value,
  onChange,
  users,
  disabled = false,
  placeholder = "Unassigned",
  className,
}: AssigneeComboboxProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  // Tracks whether the popover was just closed by an outside click so we can
  // suppress the click from also activating whatever element was clicked.
  const justClosedRef = useRef(false);

  const selectedUser = users?.find((u) => u.account_id === value);

  const filteredUsers = useMemo(() => {
    if (!users) return [];
    const query = search.trim().toLowerCase();
    if (!query) return users.slice(0, MAX_VISIBLE_RESULTS);

    return users
      .filter((u) => u.name.toLowerCase().includes(query))
      .slice(0, MAX_VISIBLE_RESULTS);
  }, [users, search]);

  const handleOpenChange = (next: boolean) => {
    if (!next && open) {
      // Popover is closing due to an outside click. Set the flag and add a
      // one-time capture listener that stops the click from reaching the target.
      justClosedRef.current = true;
      document.addEventListener(
        "click",
        (e) => {
          if (justClosedRef.current) {
            e.stopPropagation();
            e.preventDefault();
            justClosedRef.current = false;
          }
        },
        { capture: true, once: true }
      );
    }
    setOpen(next);
  };

  return (
    <Popover open={open} onOpenChange={handleOpenChange}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          disabled={disabled}
          className={cn(
            "w-full justify-between font-normal",
            !selectedUser && value === UNASSIGNED && "text-muted-foreground",
            className
          )}
        >
          <span className="truncate">
            {selectedUser?.name ?? placeholder}
          </span>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0">
        <Command shouldFilter={false}>
          <CommandInput
            placeholder="Search by name..."
            value={search}
            onValueChange={setSearch}
          />
          <CommandList>
            <CommandEmpty>No users found.</CommandEmpty>
            <CommandGroup>
              <CommandItem
                value={UNASSIGNED}
                onSelect={() => {
                  onChange(UNASSIGNED);
                  setOpen(false);
                  setSearch("");
                }}
              >
                <Check
                  className={cn(
                    "h-4 w-4",
                    value === UNASSIGNED ? "opacity-100" : "opacity-0"
                  )}
                />
                Unassigned
              </CommandItem>
              {filteredUsers.map((user) => (
                <CommandItem
                  key={user.account_id}
                  value={user.account_id}
                  onSelect={() => {
                    onChange(user.account_id);
                    setOpen(false);
                    setSearch("");
                  }}
                >
                  <Check
                    className={cn(
                      "h-4 w-4 shrink-0",
                      value === user.account_id ? "opacity-100" : "opacity-0"
                    )}
                  />
                  <span className="truncate">{user.name}</span>
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
