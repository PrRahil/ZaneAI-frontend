"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
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
    LogOut,
    User,
    Users,
    LayoutDashboard,
    ChevronRight,
    PanelLeftClose,
    PanelLeft,
} from "lucide-react";
import { cn } from "@/components/ui/utils";
import { useLogout } from "@/hooks/useAuth";
import toast from "react-hot-toast";
import { useAuthStore } from "@/store/useAuthStore";
import { useSidebar } from "@/components/layout/DashboardLayout";

interface NavItem {
    href: string;
    label: string;
    icon: React.ElementType;
}

interface NavSection {
    title: string;
    items: NavItem[];
}

export function AppSidebar() {
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

    const navSections: NavSection[] = [
        {
            title: "General",
            items: [
                { href: "/overview", label: "Dashboard", icon: LayoutDashboard },
            ],
        },
        {
            title: "Pages",
            items: [
                { href: "/overview", label: "Overview", icon: BarChart3 },
                { href: "/chat", label: "Chat", icon: MessageSquare },
            ],
        },
    ];

    // Add settings section for admin users
    if (user?.role === "SYSTEM_ADMIN") {
        navSections.push({
            title: "Other",
            items: [
                { href: "/users", label: "Users", icon: Users },
                { href: "/settings/connectors", label: "Settings", icon: Settings },
            ],
        });
    }

    return (
        <div
            className={cn(
                "flex flex-col h-screen bg-sidebar border-r border-sidebar-border transition-all duration-300",
                collapsed ? "w-16" : "w-64"
            )}
        >
            {/* Header with Logo */}
            <div className="h-16 px-4 border-b border-sidebar-border flex items-center justify-center">
                {!collapsed ? (
                    <Link href="/overview" className="flex items-center space-x-2">
                        <div className="h-8 w-8 bg-sidebar-primary rounded-lg flex items-center justify-center">
                            <GitBranch className="h-5 w-5 text-sidebar-primary-foreground" />
                        </div>
                        <span className="font-semibold text-lg text-sidebar-foreground">
                            Myzane AI
                        </span>
                    </Link>
                ) : (
                    <div className="h-8 w-8 bg-sidebar-primary rounded-lg flex items-center justify-center">
                        <GitBranch className="h-5 w-5 text-sidebar-primary-foreground" />
                    </div>
                )}
            </div>

            {/* Navigation */}
            <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-6">
                {navSections.map((section) => (
                    <div key={section.title}>
                        {!collapsed && (
                            <h3 className="px-3 mb-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                                {section.title}
                            </h3>
                        )}
                        <div className="space-y-1">
                            {section.items.map((item) => {
                                const Icon = item.icon;
                                const isActive =
                                    pathname === item.href || pathname.startsWith(item.href);

                                return (
                                    <Link key={item.href} href={item.href}>
                                        <Button
                                            variant="ghost"
                                            className={cn(
                                                "w-full h-10",
                                                collapsed ? "justify-center px-0" : "justify-start gap-3 px-3",
                                                isActive &&
                                                "bg-sidebar-accent text-sidebar-accent-foreground font-medium"
                                            )}
                                            title={collapsed ? item.label : undefined}
                                        >
                                            <Icon className="h-5 w-5 flex-shrink-0" />
                                            {!collapsed && <span>{item.label}</span>}
                                        </Button>
                                    </Link>
                                );
                            })}
                        </div>
                    </div>
                ))}
            </nav>

            {/* User Profile Section */}
            <div className="border-t border-sidebar-border p-4">
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button
                            variant="ghost"
                            className={cn(
                                "w-full h-12",
                                collapsed ? "justify-center px-0" : "justify-start gap-3 px-3"
                            )}
                        >
                            <Avatar className="h-8 w-8 flex-shrink-0">
                                <AvatarFallback className="bg-sidebar-primary text-sidebar-primary-foreground text-sm">
                                    {user?.username ? user.username.slice(0, 2).toUpperCase() : "AA"}
                                </AvatarFallback>
                            </Avatar>
                            {!collapsed && (
                                <>
                                    <div className="flex-1 text-left overflow-hidden">
                                        <p className="text-sm font-medium text-sidebar-foreground truncate">
                                            {user?.username || "Admin"}
                                        </p>
                                        <p className="text-xs text-muted-foreground truncate">
                                            {user?.email || "admin@example.com"}
                                        </p>
                                    </div>
                                    <ChevronRight className="h-4 w-4 flex-shrink-0" />
                                </>
                            )}
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="w-56" align="end" side={collapsed ? "right" : "top"}>
                        <DropdownMenuItem
                            onClick={() => router.push("/profile")}
                            className="cursor-pointer"
                        >
                            <User className="mr-2 h-4 w-4" />
                            Profile
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={handleLogout} className="cursor-pointer">
                            <LogOut className="mr-2 h-4 w-4" />
                            Sign Out
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
        </div>
    );
}
