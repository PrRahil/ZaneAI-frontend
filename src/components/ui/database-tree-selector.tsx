"use client";

import { useState, useCallback, memo } from "react";
import { ChevronRight, ChevronDown, Database, Folder } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useFetchSchemasByDatabase } from "@/hooks/useSnowflake";

export interface SchemaNode {
  id: string;
  name: string;
}

export interface DatabaseNode {
  id: string;
  name: string;
}

interface Props {
  databases: DatabaseNode[];
  selectedItems: string[];
  onSelectionChange: (next: string[]) => void;
  connectionId: string;
}

export const DatabaseTreeSelector = memo(function DatabaseTreeSelector({
  databases,
  selectedItems,
  onSelectionChange,
  connectionId,
}: Props) {
  const [expanded, setExpanded] = useState<string[]>([]);

  const toggleDatabaseExpand = useCallback(
    (dbName: string) => {
      setExpanded((prev) =>
        prev.includes(dbName)
          ? prev.filter((p) => p !== dbName)
          : [...prev, dbName]
      );
    },
    [expanded]
  );

  const toggleSchemaSelection = useCallback(
    (schemaId: string) => {
      if (selectedItems.includes(schemaId)) {
        onSelectionChange(selectedItems.filter((s) => s !== schemaId));
      } else {
        onSelectionChange([...selectedItems, schemaId]);
      }
    },
    [selectedItems]
  );

  const toggleDatabaseSelection = useCallback(
    (dbName: string, schemas: SchemaNode[]) => {
      const ids = schemas.map((s) => s.id);
      const isAllSelected = ids.every((id) => selectedItems.includes(id));

      if (isAllSelected) {
        onSelectionChange(selectedItems.filter((id) => !ids.includes(id)));
      } else {
        const newSet = new Set([...selectedItems, ...ids]);
        onSelectionChange([...newSet]);
      }
    },
    [selectedItems]
  );

  return (
    <div className="border rounded-md">
      <ScrollArea className="h-80 p-4">
        <div className="space-y-2">
          {databases.length === 0 && (
            <p className="text-sm text-muted-foreground">No databases found.</p>
          )}

          {databases.map((db) => {
            const isOpen = expanded.includes(db.name);

            const { data: schemas = [], isLoading } = useFetchSchemasByDatabase(
              connectionId,
              isOpen ? db.name : ""
            );

            return (
              <div key={db.name}>
                <div className="flex items-center space-x-2 hover:bg-muted/50 p-2 rounded">
                  <button
                    type="button"
                    onClick={() => toggleDatabaseExpand(db.name)}
                    className="w-4 h-4 flex items-center justify-center"
                  >
                    {isOpen ? (
                      <ChevronDown className="h-3 w-3" />
                    ) : (
                      <ChevronRight className="h-3 w-3" />
                    )}
                  </button>

                  <Checkbox
                    checked={
                      schemas.length > 0 &&
                      schemas.every((s: SchemaNode) =>
                        selectedItems.includes(s.id)
                      )
                    }
                    onCheckedChange={() =>
                      toggleDatabaseSelection(db.name, schemas)
                    }
                  />

                  <Database className="h-4 w-4 text-blue-600" />
                  <span className="font-medium text-sm">{db.name}</span>
                </div>

                {isOpen && (
                  <div className="ml-6 space-y-1">
                    {isLoading && (
                      <p className="text-sm text-muted-foreground">
                        Loading schemas...
                      </p>
                    )}

                    {schemas.map((schema: SchemaNode) => (
                      <div
                        key={schema.id}
                        className="flex items-center space-x-2 hover:bg-muted/50 p-2 rounded"
                      >
                        <Checkbox
                          checked={selectedItems.includes(schema.id)}
                          onCheckedChange={() =>
                            toggleSchemaSelection(schema.id)
                          }
                        />
                        <Folder className="h-4 w-4 text-orange-600" />
                        <span className="text-sm">{schema.name}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </ScrollArea>
    </div>
  );
});
