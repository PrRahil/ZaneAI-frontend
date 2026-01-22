"use client";
import React, { useMemo } from "react";
import ReactFlow, {
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
  Position,
} from "reactflow";
import "reactflow/dist/style.css";
import { motion } from "framer-motion";
const defaultNodes = [
  { id: "a", position: { x: 0, y: 0 }, data: { label: "Raw.Users" } },
  { id: "b", position: { x: 250, y: 0 }, data: { label: "Stg.Users" } },
  { id: "c", position: { x: 500, y: 0 }, data: { label: "Dim.Users" } },
];
const defaultEdges = [
  { id: "e1", source: "a", target: "b", animated: true },
  { id: "e2", source: "b", target: "c", animated: true },
];
function NodeRenderer({ data }: { data: { label: string } }) {
  return (
    <motion.div
      initial={{ scale: 0.98, opacity: 0.95 }}
      whileHover={{ scale: 1.03, boxShadow: "0 8px 24px rgba(0,0,0,0.08)" }}
      transition={{ type: "spring", stiffness: 260, damping: 18 }}
      className="rounded-2xl border bg-[hsl(var(--bg))] px-4 py-2 text-sm"
    >
      {data.label}
    </motion.div>
  );
}
export default function LineageGraph() {
  const nodeTypes = useMemo(() => ({ default: NodeRenderer as any }), []);
  const [nodes, , onNodesChange] = useNodesState(defaultNodes);
  const [edges, , onEdgesChange] = useEdgesState(defaultEdges);
  return (
    <div className="h-[520px] rounded-2xl border">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        fitView
        nodeTypes={nodeTypes}
      >
        <MiniMap />
        6
        <Controls />
        <Background />
      </ReactFlow>
    </div>
  );
}
