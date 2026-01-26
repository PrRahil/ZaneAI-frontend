"use client";

import { useCallback, useEffect, useState } from "react";
import {
  ReactFlow,
  MiniMap,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  Node,
  Edge,
  MarkerType,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import TableNode from "./nodes/TableNode";
import ImpactEdge from "./edges/ImpactEdge";
import { QueryViewerModal } from "./QueryViewerModal";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { GitBranch, RotateCcw, Maximize2, Minimize2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { LineagePayload, LineageEdge as ReactFlowEdgeType } from "@/types/lineage";
import { Table, Column, ReactFlowEdge } from "@/types/lineage";
import dagre from "dagre";

type LineageEdge = ReactFlowEdge;
const nodeTypes = { table: TableNode };
const edgeTypes = { impact: ImpactEdge };

const nodeWidth = 320;

const getLayoutedElements = (nodes: Node[], edges: Edge[]) => {
  const dagreGraph = new dagre.graphlib.Graph();
  dagreGraph.setDefaultEdgeLabel(() => ({}));

  dagreGraph.setGraph({ rankdir: "LR", ranksep: 300, nodesep: 150 });

  nodes.forEach((node) => {
    const height = 100 + ((node.data.columns as any[])?.length || 0) * 32;
    dagreGraph.setNode(node.id, { width: nodeWidth, height: height });
  });

  edges.forEach((edge) => {
    dagreGraph.setEdge(edge.source, edge.target);
  });

  dagre.layout(dagreGraph);

  const layoutedNodes = nodes.map((node) => {
    const nodeWithPosition = dagreGraph.node(node.id);
    return {
      ...node,
      position: {
        x: nodeWithPosition.x - nodeWidth / 2,
        y: nodeWithPosition.y - nodeWithPosition.height / 2,
      },
    };
  });

  return { nodes: layoutedNodes, edges };
};

export function ReactFlowLineage({ data }: { data: LineagePayload }) {
  const [nodes, setNodes, onNodesChange] = useNodesState<Node>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([]);
  const [selectedColumn, setSelectedColumn] = useState<{
    table: string;
    column: string;
  } | null>(null);
  const [isQueryModalOpen, setIsQueryModalOpen] = useState(false);
  const [selectedEdgeQueries, setSelectedEdgeQueries] = useState<any[]>([]);
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    const handleEsc = (event: KeyboardEvent) => {
      if (event.key === "Escape" && isFullscreen) {
        setIsFullscreen(false);
      }
    };
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [isFullscreen]);

  useEffect(() => {
    if (!data) return;

    const allTables = data.Tables;
    const toTables = new Set(data.Edges.map((e) => e.ToTable));
    const fromTables = new Set(data.Edges.map((e) => e.FromTable));

    const nodeArray: Node[] = allTables.map((t) => {
      const cols = (t.Columns || []).map((c) => ({
        name: c.Name,
        isPrimary: c.isPrimary || false,
        isImpacted: false,
      }));

      // A table is a source if it has outgoing edges
      const hasOutgoingEdges = fromTables.has(t.Name);

      return {
        id: t.Name,
        type: "table",
        position: { x: 0, y: 0 }, // Initial position, will be set by dagre
        data: {
          tableName: t.Name,
          source: t.Source,
          columns: cols,
          isSource: hasOutgoingEdges,
          onColumnClick: (tblName: string, colName: string) =>
            handleColumnClick(tblName, colName),
        },
      };
    });

    const edgeArray: Edge[] = data.Edges.map((e, index) => ({
      id: `${e.FromTable}.${e.FromColumn}→${e.ToTable}.${e.ToColumn}`,
      source: e.FromTable,
      target: e.ToTable,
      sourceHandle: e.FromColumn,
      targetHandle: e.ToColumn,
      type: "impact",
      style: e.style,
      markerEnd: {
        type: MarkerType.ArrowClosed,
        color: (e.style as any)?.stroke || "rgb(79 70 229)",
      },
      data: {
        index,
        sourceColumn: e.FromColumn,
        targetColumn: e.ToColumn,
        isHighlighted: false,
        queryIds: [e.FromTable + "." + e.FromColumn],
        onEdgeClick: () => handleEdgeClick(e),
        onViewQueries: () => {
          setSelectedEdgeQueries([
            {
              query_text: `-- example query linking ${e.FromTable}.${e.FromColumn} to ${e.ToTable}.${e.ToColumn}`,
            },
          ]);
          setIsQueryModalOpen(true);
        },
      },
    }));

    const { nodes: layoutedNodes, edges: layoutedEdges } = getLayoutedElements(
      nodeArray,
      edgeArray
    );

    setNodes(layoutedNodes);
    setEdges(layoutedEdges);
  }, [data]);

  const handleColumnClick = useCallback(
    (tableName: string, columnName: string) => {
      setSelectedColumn({ table: tableName, column: columnName });

      // Build a map of highlighted columns for each table
      const connectedCols = new Map<string, string[]>();
      const relatedEdgeIds = new Set<string>();

      // Use setEdges with functional update to access current edges
      setEdges((currentEdges) => {

        // Find all edges and columns connected to the selected column
        currentEdges.forEach((edge) => {
          const d = (edge as any).data || {};

          if (d.sourceColumn === columnName && edge.source === tableName) {
            relatedEdgeIds.add(edge.id);
            if (!connectedCols.has(edge.target)) {
              connectedCols.set(edge.target, []);
            }
            connectedCols.get(edge.target)!.push(d.targetColumn);
          }

          if (d.targetColumn === columnName && edge.target === tableName) {
            relatedEdgeIds.add(edge.id);
            // Add source column to highlighted list
            if (!connectedCols.has(edge.source)) {
              connectedCols.set(edge.source, []);
            }
            connectedCols.get(edge.source)!.push(d.sourceColumn);
          }
        });

        connectedCols.set(tableName, [columnName]);
        setNodes((prev) =>
          prev.map((node) => ({
            ...node,
            data: {
              ...node.data,
              highlightedColumns: connectedCols.get(node.id) || [],
              selectedColumn:
                node.id === tableName ? columnName : null,
            },
          }))
        );

        // Return updated edges with highlighting
        return currentEdges.map((edge) => ({
          ...edge,
          data: { ...(edge as any).data, isHighlighted: relatedEdgeIds.has(edge.id) },
        }));
      });
    },
    [setEdges, setNodes]
  );

  const handleEdgeClick = useCallback((edge: LineageEdge) => {
    setSelectedEdgeQueries([
      {
        query_text: `Mock query for ${edge.FromTable}.${edge.FromColumn} -> ${edge.ToTable}.${edge.ToColumn}`,
      },
    ]);
    setIsQueryModalOpen(true);
  }, []);

  const clearSelection = useCallback(() => {
    setSelectedColumn(null);

    // Clear highlighted columns from nodes
    setNodes((prev) =>
      prev.map((node) => ({
        ...node,
        data: {
          ...node.data,
          highlightedColumns: [],
          selectedColumn: null,
        },
      }))
    );

    // Clear highlighted edges
    setEdges((prev) =>
      prev.map((e) => ({
        ...e,
        data: { ...(e as any).data, isHighlighted: false },
      }))
    );
  }, [setEdges, setNodes]);

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between w-full">
            <div className="flex items-center gap-3">
              <GitBranch className="h-4 w-4" />
              <CardTitle className="text-base">
                Column-level Data Lineage
              </CardTitle>
            </div>

            <div className="flex items-center gap-2">
              {selectedColumn && (
                <div className="text-sm text-muted-foreground mr-4">
                  Selected:{" "}
                  <span className="font-mono">
                    {selectedColumn.table}.{selectedColumn.column}
                  </span>
                </div>
              )}
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsFullscreen(!isFullscreen)}
                className="gap-2"
              >
                {isFullscreen ? (
                  <>
                    <Minimize2 className="h-4 w-4" /> Exit Full Screen
                  </>
                ) : (
                  <>
                    <Maximize2 className="h-4 w-4" /> Full Screen
                  </>
                )}
              </Button>
              <Button variant="outline" size="sm" onClick={clearSelection}>
                <RotateCcw className="h-3 w-3 mr-1" /> Clear
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          <div
            className={`border rounded-lg overflow-hidden relative transition-all duration-300
    ${isFullscreen
                ? "fixed inset-0 z-[99999] bg-background w-screen h-screen rounded-none border-none"
                : "h-[400px]"
              }
  `}
          >
            {isFullscreen && (
              <div className="absolute top-4 right-4 z-50 flex gap-2">
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={() => setIsFullscreen(false)}
                >
                  Exit Fullscreen
                </Button>
              </div>
            )}
            <ReactFlow
              nodes={nodes}
              edges={edges}
              onNodesChange={onNodesChange}
              onEdgesChange={onEdgesChange}
              nodeTypes={nodeTypes}
              edgeTypes={edgeTypes}
              fitView
              attributionPosition="top-right"
              style={{
                background: `repeating-linear-gradient(0deg, rgba(0,0,0,0.04) 0px, rgba(0,0,0,0.04) 1px, transparent 1px, transparent 24px)`,
              }}
            >
              <MiniMap
                zoomable
                pannable
                className="bg-transparent border border-border"
                nodeColor={(n: any) =>
                  n.data?.isSource ? "#4F46E5" : "#94a3b8"
                }
                nodeComponent={({ id }: any) => <div key={id} />}
              />
              <Controls className="bg-background border border-border" />
              <Background color="hsl(var(--border))" gap={16} />
            </ReactFlow>
          </div>

          <div className="mt-4 flex flex-wrap gap-3">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-accent" />{" "}
              <span className="text-xs text-muted-foreground">Source</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-muted border" />{" "}
              <span className="text-xs text-muted-foreground">Target</span>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="destructive" className="text-xs">
                DROP
              </Badge>
              <span className="text-xs text-muted-foreground">
                Dropped column
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="warning" className="text-xs">
                IMPACT
              </Badge>
              <span className="text-xs text-muted-foreground">Impacted</span>
            </div>
          </div>
        </CardContent>
      </Card>

      <QueryViewerModal
        isOpen={isQueryModalOpen}
        onClose={() => setIsQueryModalOpen(false)}
        queries={selectedEdgeQueries}
        title="Impacted Queries"
      />
    </div>
  );
}
