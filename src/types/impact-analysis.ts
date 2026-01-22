export interface ImpactAnalysisData {
  sql_change: string;
  impact_analysis: string;
  affected_query_ids: string[];
  regression_queries: {
    query_text: string;
  }[];
  source_metadata: {
    query_id: string | string[];
    target_table: string;
    source_column: string;
    target_column: string;
    source_table: string;
  }[];
}

export interface LineageNode {
  id: string;
  label: string;
  type: "table" | "column";
  isImpacted: boolean;
  isPrimary?: boolean;
  x?: number;
  y?: number;
}

export interface LineageEdge {
  id: string;
  source: string;
  target: string;
  isImpacted: boolean;
  queries: string[];
  sourceColumn?: string;
  targetColumn?: string;
}

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}
