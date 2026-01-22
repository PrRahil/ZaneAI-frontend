"use client";

import React, { useState } from "react";
import "highlight.js/styles/github.css";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertTriangle, Database, FileCode } from "lucide-react";
import { ImpactAnalysisData } from "@/types/impact-analysis";
import { QueryViewerModal } from "./QueryViewerModal";
import MarkdownRenderer from "./MarkdownRenderer";

interface ImpactSummaryProps {
  data: ImpactAnalysisData;
}

export function ImpactSummary({ data }: ImpactSummaryProps) {
  const [isQueryModalOpen, setIsQueryModalOpen] = useState(false);

  const parseSqlChange = (sql: string | undefined) => {
    if (!sql) return { type: "UNKNOWN CHANGE", column: "Unknown" };

    if (/DROP COLUMN/i.test(sql)) {
      return {
        type: "DROP COLUMN",
        column: sql.match(/DROP COLUMN\s+(\w+)/i)?.[1] || "Unknown"
      };
    }
    if (/ADD COLUMN/i.test(sql)) {
      return {
        type: "ADD COLUMN",
        column: sql.match(/ADD COLUMN\s+(\w+)/i)?.[1] || "Unknown"
      };
    }
    if (/RENAME COLUMN/i.test(sql)) {
      return {
        type: "RENAME COLUMN",
        column: sql.match(/RENAME COLUMN\s+(\w+)/i)?.[1] || "Unknown"
      };
    }
    if (/ALTER COLUMN|MODIFY COLUMN/i.test(sql)) {
      return {
        type: "MODIFY COLUMN",
        column: sql.match(/(?:ALTER|MODIFY) COLUMN\s+(\w+)/i)?.[1] || "Unknown"
      };
    }

    return { type: "SQL CHANGE", column: "See details" };
  };

  const { type: changeType, column: changedColumn } = parseSqlChange(data?.sql_change);

  const impactAnalysis = data?.impact_analysis || "";

  const impactedQueriesCount =
    data?.affected_query_ids?.length ?? data?.regression_queries?.length ?? 0;

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">SQL Change</CardTitle>
            <Database className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{changeType}</div>
            <p className="text-xs text-muted-foreground mt-1">{changedColumn}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">
              Affected Queries
            </CardTitle>
            <FileCode className="h-4 w-4 text-muted-foreground" />
          </CardHeader>

          <CardContent>
            <div className="text-2xl font-bold">{impactedQueriesCount}</div>
            <div className="flex items-center justify-between mt-1">
              <p className="text-xs text-muted-foreground">
                Queries impacted downstream
              </p>

              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsQueryModalOpen(true)}
                className="h-6 text-xs"
                disabled={impactedQueriesCount === 0}
              >
                <FileCode className="h-3 w-3 mr-1" />
                View
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* MARKDOWN SECTION */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <AlertTriangle className="h-3.5 w-3.5" />
            Impact Analysis
          </CardTitle>
        </CardHeader>

        <CardContent>
          {impactAnalysis ? (
            <div className="prose prose-sm max-w-none">
              <MarkdownRenderer markdown={impactAnalysis} />
            </div>
          ) : (
            <p className="text-muted-foreground text-sm">
              No impact analysis description available.
            </p>
          )}
        </CardContent>
      </Card>

      {/* QUERY MODAL */}
      <QueryViewerModal
        isOpen={isQueryModalOpen}
        onClose={() => setIsQueryModalOpen(false)}
        queries={data?.regression_queries ?? []}
        title="Affected Queries"
      />
    </div>
  );
}
