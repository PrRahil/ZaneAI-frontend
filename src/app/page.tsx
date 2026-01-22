"use client";
import { Button } from "@/components/ui/button";
import LineageGraph from "@/components/graph/LineageGraph";
import { motion } from "framer-motion";
import Link from "next/link";
import { useAuthStore } from "@/store/useAuthStore";
import { useRoleRedirect } from "@/hooks/useRoleRedirect";
import { LayoutSplashScreen } from "@/components/ui/splash-screen";

export default function Page() {
  const { token } = useAuthStore();
  useRoleRedirect();

  if (token) {
    return <LayoutSplashScreen />;
  }
  return (
    <div className="container py-10 space-y-8">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <h1 className="text-3xl font-semibold tracking-tight">
          Myzane AI Studio
        </h1>
        <p className="text-sm text-black/60 dark:text-white/60 mt-2">
          Intelligent data lineage platform with AI-powered insights and query
          analysis.
        </p>
        <div className="mt-4 flex gap-3">
          <Button>Run lineage</Button>
          <Button variant="outline">Connect source</Button>
          <Link href="/chat">
            <Button variant="outline">💬 AI Chat</Button>
          </Link>
        </div>
      </motion.div>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.1 }}
      >
        <LineageGraph />
      </motion.div>
    </div>
  );
}
