"use client";

import { memo, useState } from "react";
import { Handle, Position } from "@xyflow/react";
import {
  Search,
  ChevronDown,
  ChevronUp,
  Snowflake,
  CheckCircle2,
  Hash,
  Type,
  Calendar,
  AlignJustify,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default memo(function TableNode({ data }: any) {
  const {
    tableName,
    source,
    columns = [],
    isSource = false,
    onColumnClick,
    highlightedColumns = [],
    selectedColumn = null,
  } = data;
  const [expanded, setExpanded] = useState(true);
  const [q, setQ] = useState("");

  const filtered = columns.filter((c: any) =>
    c.name.toLowerCase().includes(q.toLowerCase())
  );

  const typeIcon = (colName: string, isPrimary: boolean) => {
    const colorClass = isPrimary ? "text-red-500" : "text-slate-400";
    if (
      /id$/i.test(colName) ||
      /_id$/i.test(colName) ||
      /count|num|feet/i.test(colName)
    )
      return <Hash className={`h-3 w-3 ${colorClass}`} />;
    if (/date|time|timestamp/i.test(colName))
      return <Calendar className={`h-3 w-3 ${colorClass}`} />;
    return <Type className={`h-3 w-3 ${colorClass}`} />;
  };

  return (
    <div className="bg-white border border-blue-200 rounded-lg shadow-sm w-[280px] font-sans">
      {/* Header */}
      <div className="p-3 bg-slate-50/50 border-b border-slate-100 flex items-center gap-3 rounded-t-lg">
        <div className="mt-1">
          <Snowflake className="h-5 w-5 text-sky-500" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-[10px] uppercase tracking-wider text-slate-400 font-medium mb-0.5">
            TABLE
          </div>
          <div
            className="text-sm font-bold text-blue-700 truncate"
            title={tableName}
          >
            {tableName}
          </div>
          <div className="text-[11px] text-slate-500 truncate" title={source}>
            {source || "PROD_TZ / PROPERTY"}
          </div>
        </div>
        <div>
          <CheckCircle2 className="h-4 w-4 text-emerald-500" />
        </div>
      </div>

      {/* Accordion Header */}
      <div
        className="px-3 py-2 flex items-center justify-between cursor-pointer hover:bg-slate-50 transition-colors"
        onClick={() => setExpanded(!expanded)}
      >
        <span className="text-xs text-blue-500 font-medium">
          {columns.length} of {columns.length} columns
        </span>
        {expanded ? (
          <ChevronUp className="h-4 w-4 text-blue-400" />
        ) : (
          <ChevronDown className="h-4 w-4 text-blue-400" />
        )}
      </div>

      {expanded && (
        <div className="px-3 pb-3">
          <div className="relative mb-3">
            <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search"
              className="w-full pl-8 pr-8 py-1.5 text-xs border border-slate-200 rounded text-slate-600 placeholder:text-slate-400 focus:outline-none focus:border-blue-300 transition-colors"
            />
          </div>

          <div className="pr-1 space-y-0.5">
            {filtered.map((col: any) => {
              const isSelected = selectedColumn === col.name;
              const isHighlighted = highlightedColumns.includes(col.name);
              const isInLineagePath = isSelected || isHighlighted;

              return (
                <div
                  key={col.name}
                  onClick={() => onColumnClick?.(tableName, col.name)}
                  className={`
                    group flex items-center justify-between px-2 py-1.5 rounded cursor-pointer transition-all relative
                    ${isInLineagePath
                      ? "bg-blue-500 text-white ring-2 ring-blue-600 ring-offset-1 shadow-md"
                      : col.isPrimary
                        ? "bg-red-50"
                        : col.isImpacted
                          ? "bg-amber-50"
                          : "hover:bg-blue-50"
                    }
                  `}
                >
                  <Handle
                    type="target"
                    position={Position.Left}
                    id={col.name}
                    style={{ left: -22 }}
                    className="w-1.5 h-1.5 !bg-blue-500 !border-white !border"
                  />
                  <div className="flex items-center gap-2.5 overflow-hidden">
                    <div className="shrink-0 w-4 flex justify-center">
                      {isInLineagePath ? (
                        <Hash className="h-3 w-3 text-white" />
                      ) : (
                        typeIcon(col.name, col.isPrimary)
                      )}
                    </div>
                    <span
                      className={`text-xs truncate ${isInLineagePath
                        ? "text-white font-semibold"
                        : col.isPrimary
                          ? "text-red-700 font-medium"
                          : "text-slate-600 group-hover:text-blue-700"
                        }`}
                    >
                      {col.name}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    {col.isPrimary && (
                      <Badge
                        variant="destructive"
                        className="text-[9px] h-4 px-1"
                      >
                        DROP
                      </Badge>
                    )}
                    {col.isImpacted && !col.isPrimary && !isInLineagePath && (
                      <Badge variant="warning" className="text-[9px] h-4 px-1">
                        IMPACT
                      </Badge>
                    )}

                    <AlignJustify
                      className={`h-3 w-3 rotate-90 transition-opacity ${isInLineagePath
                        ? "text-white opacity-100"
                        : "text-blue-300 opacity-0 group-hover:opacity-100"
                        }`}
                    />
                  </div>
                  {data.isSource && (
                    <Handle
                      type="source"
                      position={Position.Right}
                      id={col.name}
                      style={{ right: -22 }}
                      className="w-1.5 h-1.5 !bg-blue-500 !border-white !border"
                    />
                  )}
                </div>
              );
            })}
            {filtered.length === 0 && (
              <div className="text-xs text-slate-400 text-center py-2">
                No columns found
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
});
