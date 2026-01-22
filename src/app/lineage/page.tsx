import Navigation from "@/components/layout/Navigation";
import { ReactFlowLineage } from "@/components/analysis/ReactFlowLineage";

import { Card } from "@/components/ui/card";
import mockLineage from "../data/mockLineage";
import { transformLineageData } from "@/lib/lineageUtils";

export default function LineagePage() {
  const data = transformLineageData(mockLineage.analysis_data.files[0] as any);

  return (
    <div className="min-h-screen bg-[rgba(240,242,245,1)]">
      <Navigation />
      <div className="container mx-auto px-4 py-6">
        <Card className="p-0">
          <div className="p-4">
            <h2 className="text-lg font-semibold">
              Lineage Canvas (Atlan style)
            </h2>
            <p className="text-sm text-muted-foreground mt-1">
              Mock data showing tables, columns and links — click columns to
              highlight edges.
            </p>
          </div>
          <div className="p-4">
            <ReactFlowLineage data={data} />
          </div>
        </Card>
      </div>
    </div>
  );
}
