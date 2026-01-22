"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Copy, FileText, AlertTriangle } from "lucide-react";
import { ImpactAnalysisData, LineageEdge } from "@/types/impact-analysis";
import toast from "react-hot-toast";

interface QueryDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  edge: LineageEdge | null;
  data: ImpactAnalysisData;
}

export function QueryDetailModal({
  isOpen,
  onClose,
  edge,
  data,
}: QueryDetailModalProps) {
  const [copiedQuery, setCopiedQuery] = useState<string | null>(null);

  if (!edge) return null;

  const relatedQueries = data.regression_queries.filter((query) =>
    edge.queries.some((queryId) => query.query_text.includes(queryId))
  );

  const copyToClipboard = async (text: string, queryId: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedQuery(queryId);

      toast.success("Query copied to clipboard");

      setTimeout(() => setCopiedQuery(null), 2000);
    } catch {
      toast.error("Failed to copy query");
    }
  };

  const highlightImpactedColumn = (queryText: string) => {
    if (!edge.sourceColumn) return queryText;

    const regex = new RegExp(`\\b${edge.sourceColumn}\\b`, "gi");
    return queryText.replace(regex, `**${edge.sourceColumn}**`);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Query Impact Details
          </DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="overview" className="w-full">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="queries">Affected Queries</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Source</CardTitle>
                </CardHeader>
                <CardContent>
                  <Badge variant="outline">{edge.source.split(".")[0]}</Badge>
                  <p className="text-sm font-mono">{edge.sourceColumn}</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Target</CardTitle>
                </CardHeader>
                <CardContent>
                  <Badge variant="outline">{edge.target.split(".")[0]}</Badge>
                  <p className="text-sm font-mono">{edge.targetColumn}</p>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-sm">
                  <AlertTriangle className="h-4 w-4 text-destructive" />
                  Impact Summary
                </CardTitle>
              </CardHeader>

              <CardContent>
                <p className="text-sm">
                  Connection will break when column{" "}
                  <code className="bg-muted px-1 rounded">
                    {edge.sourceColumn}
                  </code>{" "}
                  is dropped.
                </p>

                <div className="flex flex-wrap gap-2 mt-2">
                  {edge.queries.map((qid) => (
                    <Badge key={qid} variant="destructive">
                      {qid}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="queries" className="space-y-4">
            <ScrollArea className="h-[400px]">
              {relatedQueries.length > 0 ? (
                relatedQueries.map((query, index) => {
                  const queryId = `query-${index}`;

                  return (
                    <Card key={index} className="mb-4">
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-sm">
                            Query {index + 1}
                          </CardTitle>

                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() =>
                              copyToClipboard(query.query_text, queryId)
                            }
                          >
                            {copiedQuery === queryId ? (
                              "Copied!"
                            ) : (
                              <>
                                <Copy className="h-3 w-3 mr-1" />
                                Copy
                              </>
                            )}
                          </Button>
                        </div>
                      </CardHeader>

                      <CardContent>
                        <pre className="text-xs bg-muted p-3 rounded-md overflow-x-auto whitespace-pre-wrap">
                          {highlightImpactedColumn(query.query_text)}
                        </pre>
                      </CardContent>
                    </Card>
                  );
                })
              ) : (
                <Card>
                  <CardContent className="pt-6">
                    <p className="text-center text-muted-foreground">
                      No specific query details available.
                    </p>
                  </CardContent>
                </Card>
              )}
            </ScrollArea>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
