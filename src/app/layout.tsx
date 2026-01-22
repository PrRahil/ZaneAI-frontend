// src/app/layout.tsx
import type { Metadata } from "next";
import "@/app/globals.css";
import Providers from "@/lib/providers";
import { Toaster } from "react-hot-toast";
import { AuthInit } from "@/providers/AuthProvider";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Inter } from "next/font/google";

import { CookieConsent } from "@/components/privacy/CookieConsent";
import { GoogleAnalytics } from "@/components/analytics/GoogleAnalytics";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "Lineage Studio",
  description: "Minimal data lineage frontend",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning className={inter.variable}>
      <body className={inter.className}>
        <Providers>
          <AuthInit>
            <DashboardLayout>{children}</DashboardLayout>
            <CookieConsent />
            <GoogleAnalytics />
          </AuthInit>
        </Providers>
        <Toaster position="top-right" />
      </body>
    </html>
  );
}
