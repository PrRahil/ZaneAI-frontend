"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

import {
  GitBranch,
  Search,
  Clock,
  User,
  FolderGit2,
  GitPullRequest,
} from "lucide-react";

import { useGithubAnalyses } from "@/hooks/useGithub";
import { useRouter } from "next/navigation";
import { formatDistanceToNow } from "date-fns";
import { Skeleton } from "@/components/ui/skeleton";
import { ErrorState } from "@/components/ui/error-state";
import Navigation from "@/components/layout/Navigation";

export default function OverviewPage() {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState("");

  const { data, isLoading, isError } = useGithubAnalyses();

  const summary = data?.summary || {};
  const prs = data?.pull_requests || [];

  const filteredPRs = prs.filter((pr: any) =>
    (pr.title + pr.repository_name + pr.author_name)
      .toLowerCase()
      .includes(searchTerm.toLowerCase())
  );

  const handlePRClick = (analysisId: string) => {
    router.push(`/analysis?id=${analysisId}`);
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      <div className="container mx-auto px-6 py-8 space-y-8">
        {/* Page Header */}
        <div className="space-y-1">
          <h1 className="text-3xl font-semibold tracking-tight">Overview Dashboard</h1>
          <p className="text-sm text-muted-foreground">
            Track PR impact, query changes, and recent updates across repositories.
          </p>
        </div>

        {/* Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Card className="border-border">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total Pull Requests
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{summary.total_prs || 0}</div>
            </CardContent>
          </Card>

          <Card className="border-border">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total Impacted Queries
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {summary.impacted_queries || 0}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            className="pl-9 border-border"
            placeholder="Search pull requests..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Card>
                <CardHeader>
                  <Skeleton className="h-4 w-32" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-8 w-20" />
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <Skeleton className="h-4 w-40" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-8 w-20" />
                </CardContent>
              </Card>
            </div>

            <Skeleton className="h-10 w-full" />

            <div className="space-y-4">
              {[...Array(4)].map((_, i) => (
                <Card key={i}>
                  <CardContent className="p-6 space-y-4">
                    <Skeleton className="h-5 w-56" />
                    <Skeleton className="h-4 w-full" />

                    <div className="flex gap-6 flex-wrap">
                      <Skeleton className="h-4 w-32" />
                      <Skeleton className="h-4 w-28" />
                      <Skeleton className="h-4 w-24" />
                      <Skeleton className="h-4 w-40" />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* PR List */}
        {!isLoading && !isError && filteredPRs.length > 0 && (
          <div className="space-y-3">
            {filteredPRs.map((pr: any) => (
              <Card
                key={pr.pr_id}
                className="border-border hover:border-foreground/20 transition-colors cursor-pointer"
                onClick={() => handlePRClick(pr.analysis_id)}
              >
                <CardContent className="p-5 space-y-3">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <h3 className="text-base font-semibold truncate">{pr.title}</h3>
                      <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                        {pr.description}
                      </p>
                    </div>

                    <Badge variant="outline" className="flex-shrink-0">
                      <GitPullRequest className="h-3 w-3 mr-1" />
                      {pr.total_impacted_queries} impacted
                    </Badge>
                  </div>

                  <div className="flex flex-wrap gap-4 text-xs text-muted-foreground">
                    <div className="flex items-center gap-1.5">
                      <GitBranch className="h-3.5 w-3.5" />
                      <span className="font-mono">{pr.branch_name}</span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <FolderGit2 className="h-3.5 w-3.5" />
                      <span>{pr.repository_name}</span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <User className="h-3.5 w-3.5" />
                      <span>{pr.author_name}</span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <Clock className="h-3.5 w-3.5" />
                      <span>
                        {formatDistanceToNow(new Date(pr.submitted_at), {
                          addSuffix: true,
                        })}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Empty/Error State */}
        {!isLoading && filteredPRs.length === 0 && (
          <Card className="border-border">
            <CardContent className="text-center p-12">
              <Search className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-lg font-medium">No Pull Requests Found</p>
              <p className="text-sm text-muted-foreground mt-1">
                Try adjusting your search or filters.
              </p>

              {isError && (
                <ErrorState
                  title="Failed to Load"
                  description="Failed to load overview data. Please try again later."
                  className="min-h-[200px] mt-6"
                />
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
