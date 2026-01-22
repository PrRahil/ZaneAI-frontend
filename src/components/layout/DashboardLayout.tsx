"use client";

import { AppSidebar } from "@/components/layout/AppSidebar";
import { useAuthStore } from "@/store/useAuthStore";
import { usePathname } from "next/navigation";
import { createContext, useContext, useState } from "react";

interface SidebarContextType {
    collapsed: boolean;
    toggleSidebar: () => void;
}

const SidebarContext = createContext<SidebarContextType>({
    collapsed: false,
    toggleSidebar: () => { },
});

export const useSidebar = () => useContext(SidebarContext);

interface DashboardLayoutProps {
    children: React.ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
    const user = useAuthStore((state) => state.user);
    const pathname = usePathname();
    const [collapsed, setCollapsed] = useState(false);

    const toggleSidebar = () => setCollapsed(!collapsed);

    const shouldShowSidebar = user && !pathname.startsWith("/auth") && !pathname.startsWith("/setup");

    if (!shouldShowSidebar) {
        return <>{children}</>;
    }

    return (
        <SidebarContext.Provider value={{ collapsed, toggleSidebar }}>
            <div className="flex h-screen overflow-hidden">
                <AppSidebar />
                <main className="flex-1 overflow-y-auto bg-background">
                    {children}
                </main>
            </div>
        </SidebarContext.Provider>
    );
}
