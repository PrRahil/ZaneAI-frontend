export interface LineageNode {
    database: string;
    schema: string;
    table: string;
    column: string;
}

export interface LineageEdge {
    source_database: string;
    source_schema: string;
    source_table: string;
    source_column: string;
    target_database: string;
    target_schema: string;
    target_table: string;
    target_column: string;
    query_id?: string;
    query_type?: string;
}

export interface CompleteLineage {
    upstream: LineageEdge[];
    downstream: LineageEdge[];
    center_node: LineageNode;
}

export interface AnalysisFile {
    sql_change: string;
    impact_analysis: string;
    complete_lineage: CompleteLineage;
}

export interface Column {
    Name: string;
    Type?: string;
    Nullable?: boolean;
    isPrimary?: boolean;
    isImpacted?: boolean;
}

export interface Table {
    Type: "Table" | "View";
    Name: string;
    Source?: string;
    Columns: Column[];
}

export interface ReactFlowEdge {
    FromTable: string;
    FromColumn: string;
    ToTable: string;
    ToColumn: string;
    style?: React.CSSProperties;
}

export interface LineagePayload {
    Tables: Table[];
    Edges: ReactFlowEdge[];
}
