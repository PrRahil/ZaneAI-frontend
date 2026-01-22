export const API_URL =
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";
async function http<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, {
    headers: { "Content-Type": "application/json" },
    ...init,
  });
  if (!res.ok) {
    const msg = await res.text().catch(() => res.statusText);
    throw new Error(`${res.status} ${res.statusText}: ${msg}`);
  }
  return res.json() as Promise<T>;
}
export type LineageNode = { id: string; label: string };
export type LineageEdge = { id: string; source: string; target: string };
export type Subgraph = { nodes: LineageNode[]; edges: LineageEdge[] };
export const api = {
  getSubgraph(nodeId: string) {
    return http<Subgraph>(`/v1/lineage/subgraph?node_id=$
{encodeURIComponent(nodeId)}`);
  },
};
