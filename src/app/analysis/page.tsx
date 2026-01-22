"use client";

import { useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { useGithubAnalysis } from "@/hooks/useGithub";
import Navigation from "@/components/layout/Navigation";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";

import {
  GitBranch,
  ExternalLink,
  BarChart3,
  GitMerge,
  MessageCircle,
} from "lucide-react";

import { ImpactSummary } from "@/components/analysis/ImpactSummary";
import { ReactFlowLineage } from "@/components/analysis/ReactFlowLineage";
import { QueryDetailModal } from "@/components/analysis/QueryDetailModal";
import { ChatInterface } from "@/components/analysis/chat-interface";
import { LayoutSplashScreen } from "@/components/ui/splash-screen";
import { ErrorState } from "@/components/ui/error-state";
import { transformLineageData } from "@/lib/lineageUtils";

function AnalysisContent() {
  const searchParams = useSearchParams();
  const id = searchParams.get("id");
  const [selectedEdge, setSelectedEdge] = useState<any | null>(null);
  const [activeTab, setActiveTab] = useState("overview");
  const [modalOpen, setModalOpen] = useState(false);

  const { data, isLoading, isError } = useGithubAnalysis(id as string);

  if (!id) {
    return (
      <ErrorState
        title="No Analysis ID"
        description="No analysis ID was provided in the URL. Please provide a valid ID to view the analysis."
        className="min-h-screen"
      />
    );
  }

  if (isLoading) {
    return <LayoutSplashScreen />;
  }

  if (isError || !data) {
    return (
      <ErrorState
        title="Failed to Load"
        description="We couldn't load the analysis details. Please try again later or check if the ID is correct."
        className="min-h-screen"
      />
    );
  }

  const analysis = data;
  const impactData = analysis?.analysis_data?.files?.[0];

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      <div className="border-b bg-card">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-semibold">{analysis.pr_title}</h1>

              <p className="text-muted-foreground mt-1">
                <span className="inline-flex items-center gap-2">
                  <GitBranch className="h-3.5 w-3.5" />
                  <span className="font-mono text-xs">
                    {analysis.branch_name}
                  </span>
                  <span className="text-xs">•</span>
                  <span className="text-xs">PR #{analysis.pr_number}</span>
                </span>
              </p>

              <p className="text-xs text-muted-foreground mt-1">
                {analysis.pr_description}
              </p>
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={() => window.open(analysis.pr_url, "_blank")}
            >
              <ExternalLink className="h-3.5 w-3.5 mr-2" />
              View on GitHub
            </Button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-3">
        <Tabs
          value={activeTab}
          onValueChange={setActiveTab}
          className="h-[calc(100vh-220px)]"
        >
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="overview" className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              Overview
            </TabsTrigger>

            <TabsTrigger value="lineage" className="flex items-center gap-2">
              <GitMerge className="h-4 w-4" />
              Data Lineage
            </TabsTrigger>

            <TabsTrigger value="assistant" className="flex items-center gap-2">
              <MessageCircle className="h-4 w-4" />
              AI Assistant
            </TabsTrigger>
          </TabsList>

          <TabsContent
            value="overview"
            className="mt-4 h-[calc(100%-40px)] overflow-auto"
          >
            <ImpactSummary data={impactData} />
          </TabsContent>

          <TabsContent
            value="lineage"
            className="mt-4 h-[calc(100%-40px)] overflow-auto"
          >
            <ReactFlowLineage data={transformLineageData(impactData)} />
          </TabsContent>

          <TabsContent
            value="assistant"
            className="mt-4 h-[calc(100%-40px)] overflow-auto"
          >
            <ChatInterface data={impactData} />
          </TabsContent>
        </Tabs>
      </div>

      <QueryDetailModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        edge={selectedEdge}
        data={impactData}
      />
    </div>
  );
}

export default function AnalysisDetailsPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <AnalysisContent />
    </Suspense>
  );
}
