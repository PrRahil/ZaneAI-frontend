"use client";

import { useEffect, useState } from "react";
import { useFetchMe } from "@/hooks/useAuth";
import { LayoutSplashScreen } from "@/components/ui/splash-screen";
import { useAuthStore } from "@/store/useAuthStore";
import { useRouter, usePathname } from "next/navigation";

export const AuthInit = ({ children }: { children: React.ReactNode }) => {
  const [hydrated, setHydrated] = useState(false);
  const { data: user, isLoading, isError } = useFetchMe();
  const setUser = useAuthStore((state) => state.setUser);
  const logout = useAuthStore((state) => state.logout);
  const token = useAuthStore((state) => state.token);
  const router = useRouter();

  useEffect(() => {
    setHydrated(true);
  }, []);

  const pathname = usePathname();

  useEffect(() => {
    if (!hydrated) return;

    if (!token && !pathname.startsWith("/auth")) {
      router.replace("/auth/login");
      return;
    }

    // Logic moved to user check below to ensure we have user details for correct redirection
    // if (token && authPages.some((route) => pathname.startsWith(route))) {
    //   router.replace("/");
    // }

    if (!isLoading && user) {
      setUser(user);

      const authPages = ["/auth/login", "/auth/signup", "/auth/forgot-password"];
      if (token && authPages.some((route) => pathname.startsWith(route))) {
        if (user.role === "PRODUCT_SUPPORT_ADMIN") {
          router.replace("/organization");
        } else if (user.is_connection_setup) {
          router.replace("/overview");
        } else {
          router.replace("/setup/database");
        }
      }
    }

    if (isError) {
      logout();
    }
  }, [hydrated, token, user, isLoading, isError, router, setUser, logout, pathname]);

  if (!hydrated || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <LayoutSplashScreen />
      </div>
    );
  }

  return <>{children}</>;
};
