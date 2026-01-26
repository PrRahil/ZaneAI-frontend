"use client";

import { BaseEdge, getBezierPath } from "@xyflow/react";

export default function ImpactEdge({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  data = {},
  markerEnd,
  style = {},
}: any) {
  const [edgePath] = getBezierPath({
    sourceX,
    sourceY,
    targetX,
    targetY,
    sourcePosition,
    targetPosition,
  });
  const highlighted = !!data.isHighlighted;

  return (
    <>
      <BaseEdge
        id={id}
        path={edgePath}
        markerEnd={markerEnd}
        style={{
          stroke:
            style?.stroke === "#ef4444"
              ? "#ef4444" // Keep red if dropped
              : highlighted
                ? "rgb(79 70 229)"
                : "rgb(209 213 219)",
          strokeWidth: highlighted ? 4 : 1.5,
          transition: "all 200ms ease-in-out",
          opacity: highlighted ? 1 : 0.6,
          ...style,
        }}
        className="cursor-pointer"
        onClick={data.onEdgeClick}
      />
    </>
  );
}
