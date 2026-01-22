import { AnalysisFile, LineagePayload, ReactFlowEdge, Table, Column } from "@/types/lineage";

export const transformLineageData = (fileData: AnalysisFile): LineagePayload => {
    if (!fileData || !fileData.complete_lineage) {
        return { Tables: [], Edges: [] };
    }

    const { complete_lineage } = fileData;
    const { center_node, downstream, upstream } = complete_lineage;

    const edges: ReactFlowEdge[] = [];
    const tablesMap = new Map<string, Map<string, Column>>();

    const getOrCreateTable = (db: string, schema: string, table: string) => {
        const tableName = table.toUpperCase();
        if (!tablesMap.has(tableName)) {
            tablesMap.set(tableName, new Map());
        }
        return tablesMap.get(tableName)!;
    };

    const addColumn = (
        db: string,
        schema: string,
        table: string,
        colName: string,
        isCenter: boolean = false,
        isDownstream: boolean = false
    ) => {
        if (!table || !colName) return;
        const cols = getOrCreateTable(db, schema, table);
        const upperCol = colName.toUpperCase();

        if (!cols.has(upperCol)) {
            cols.set(upperCol, {
                Name: upperCol,
                Type: "VARCHAR",
                Nullable: true,
                isPrimary: isCenter,
                isImpacted: isDownstream && !isCenter,
            });
        } else {
            const existing = cols.get(upperCol)!;
            if (isCenter) existing.isPrimary = true;
            if (isDownstream && !existing.isPrimary) existing.isImpacted = true;
        }
    };

    downstream.forEach((edge) => {
        if (!edge.source_table || !edge.source_column || !edge.target_table || !edge.target_column) return;
        const fromTable = edge.source_table.toUpperCase();
        const fromCol = edge.source_column.toUpperCase();
        const toTable = edge.target_table.toUpperCase();
        const toCol = edge.target_column.toUpperCase();

        const isSourceCenter =
            edge.source_table?.toLowerCase() === center_node.table?.toLowerCase() &&
            edge.source_column?.toLowerCase() === center_node.column?.toLowerCase();

        const isTargetCenter =
            edge.target_table?.toLowerCase() === center_node.table?.toLowerCase() &&
            edge.target_column?.toLowerCase() === center_node.column?.toLowerCase();

        const isDropped = isSourceCenter;

        edges.push({
            FromTable: fromTable,
            FromColumn: fromCol,
            ToTable: toTable,
            ToColumn: toCol,
            style: isDropped
                ? { strokeDasharray: "5,5", stroke: "#ef4444", animation: "flow 2s linear infinite" }
                : { stroke: "#6097efff" },
        });

        addColumn(edge.source_database, edge.source_schema, edge.source_table, edge.source_column, isSourceCenter, false);
        addColumn(edge.target_database, edge.target_schema, edge.target_table, edge.target_column, isTargetCenter, true);
    });

    upstream?.forEach((edge) => {
        if (!edge.source_table || !edge.source_column || !edge.target_table || !edge.target_column) return;
        const fromTable = edge.source_table.toUpperCase();
        const fromCol = edge.source_column.toUpperCase();
        const toTable = edge.target_table.toUpperCase();
        const toCol = edge.target_column.toUpperCase();

        const isSourceCenter =
            edge.source_table.toLowerCase() === center_node.table.toLowerCase() &&
            edge.source_column.toLowerCase() === center_node.column.toLowerCase();

        edges.push({
            FromTable: fromTable,
            FromColumn: fromCol,
            ToTable: toTable,
            ToColumn: toCol,
            style: { stroke: "#6097efff" },
        });

        addColumn(edge.source_database, edge.source_schema, edge.source_table, edge.source_column, isSourceCenter, false);
        addColumn(edge.target_database, edge.target_schema, edge.target_table, edge.target_column, false, false); // Upstream aren't "impacted" usually, just context
    });

    addColumn(center_node.database, center_node.schema, center_node.table, center_node.column, true, false);

    const tables: Table[] = Array.from(tablesMap.entries()).map(([name, colsMap]) => ({
        Type: "Table",
        Name: name,
        Source: "RETAIL / RAW",
        Columns: Array.from(colsMap.values()),
    }));

    return { Tables: tables, Edges: edges };
};
