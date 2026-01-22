"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  BarChart3,
  MessageSquare,
  Settings,
  GitBranch,
  Database,
  LogOut,
  User,
  Users,
  FolderOpen,
  PanelLeft,
  PanelLeftClose,
} from "lucide-react";
import { cn } from "../ui/utils";
import { useRouter } from "next/navigation";
import { useLogout } from "@/hooks/useAuth";
import toast from "react-hot-toast";
import { useAuthStore } from "@/store/useAuthStore";
import { useSidebar } from "@/components/layout/DashboardLayout";

export default function Navigation() {
  const pathname = usePathname();
  const router = useRouter();
  const logout = useLogout();
  const user = useAuthStore((state) => state.user);
  const { collapsed, toggleSidebar } = useSidebar();

  const handleLogout = () => {
    logout.mutate(undefined, {
      onSuccess: () => {
        toast.success("Signed out successfully!");
        router.push("/auth/login");
      },
      onError: () => {
        toast.error("Failed to sign out. Please try again.");
      },
    });
  };

  return (
    <nav className="border-b bg-card">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo with Toggle */}
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleSidebar}
              className="h-8 w-8"
              title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            >
              {collapsed ? (
                <PanelLeft className="h-5 w-5" />
              ) : (
                <PanelLeftClose className="h-5 w-5" />
              )}
            </Button>
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-9 w-9 rounded-full">
                <Avatar className="h-9 w-9">
                  <AvatarFallback>
                    {user?.username
                      ? user.username.slice(0, 2).toUpperCase()
                      : "AA"}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end">
              <DropdownMenuItem onClick={() => router.push("/profile")} className="cursor-pointer">
                <User className="mr-2 h-4 w-4" />
                Profile
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              {user?.role === "SYSTEM_ADMIN" && (
                <>
                  <DropdownMenuItem onClick={() => router.push("/users")} className="cursor-pointer">
                    <Users className="mr-2 h-4 w-4" />
                    Users
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => router.push("/settings/connectors")} className="cursor-pointer">
                    <Settings className="mr-2 h-4 w-4" />
                    Settings
                  </DropdownMenuItem>
                </>
              )}
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout} className="cursor-pointer">
                <LogOut className="mr-2 h-4 w-4" />
                Sign Out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </nav>
  );
}
