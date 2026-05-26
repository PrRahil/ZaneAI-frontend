export interface ImpactDepthSection {
  depth: number;
  content: string;
  itemCount: number;
}

export interface ParsedImpactAnalysis {
  preamble: string;
  depths: ImpactDepthSection[];
  epilogue: string;
}

const DEPTH_HEADER_REGEX = /^####\s+Depth\s+(\d+)\s*(.*)$/im;
const IMPACT_ITEM_REGEX = /^\d+\.\s+\*\*Target/i;

const JIRA_PRIORITIES = ["Highest", "High", "Medium", "Low", "Lowest"];

export function getPriorityForDepth(depth: number, totalDepths = 1): string {
  // Distribute priorities proportionally across the full range so that:
  // - depth 1 always maps to the highest priority bucket
  // - the last depth always maps to the lowest priority bucket
  // - everything in between is spread evenly
  // Works for any number of depths (1–N).
  if (totalDepths <= 1) return JIRA_PRIORITIES[0];
  const index = Math.round(
    ((depth - 1) / (totalDepths - 1)) * (JIRA_PRIORITIES.length - 1)
  );
  return JIRA_PRIORITIES[Math.min(index, JIRA_PRIORITIES.length - 1)];
}

export function countImpactItems(content: string): number {
  return content
    .split("\n")
    .filter((line) => IMPACT_ITEM_REGEX.test(line.trim())).length;
}

export function parseImpactByDepth(impactAnalysis: string): ParsedImpactAnalysis {
  const text = impactAnalysis?.trim() ?? "";
  if (!text) {
    return { preamble: "", depths: [], epilogue: "" };
  }

  const downstreamMarker = text.search(
    /###\s*\*?\*?Downstream Impact Analysis\*?\*?/i
  );

  const preamble =
    downstreamMarker >= 0 ? text.slice(0, downstreamMarker).trim() : text;

  const downstreamText =
    downstreamMarker >= 0 ? text.slice(downstreamMarker).trim() : "";

  if (!downstreamText) {
    return { preamble, depths: [], epilogue: "" };
  }

  const explanationMarker = downstreamText.search(/\n\*\*Explanation:\*\*/i);
  const depthBlock =
    explanationMarker >= 0
      ? downstreamText.slice(0, explanationMarker).trim()
      : downstreamText;
  const epilogue =
    explanationMarker >= 0
      ? downstreamText.slice(explanationMarker).trim()
      : "";

  const sections = depthBlock.split(/(?=####\s+Depth\s+\d+)/i).filter(Boolean);
  const depths: ImpactDepthSection[] = [];

  for (const section of sections) {
    const headerMatch = section.match(DEPTH_HEADER_REGEX);
    if (!headerMatch) continue;

    const depth = parseInt(headerMatch[1], 10);
    const content = section.trim();

    depths.push({
      depth,
      content,
      itemCount: countImpactItems(content),
    });
  }

  depths.sort((a, b) => a.depth - b.depth);

  return { preamble, depths, epilogue };
}

export function buildSingleTicketDescription(
  preamble: string,
  depths: ImpactDepthSection[],
  epilogue: string
): string {
  const downstreamHeader = "### **Downstream Impact Analysis**";
  const depthContent = depths.map((d) => d.content).join("\n\n");
  const parts = [preamble, downstreamHeader, depthContent, epilogue].filter(
    Boolean
  );
  return parts.join("\n\n");
}

export function buildDepthTicketDescription(
  preamble: string,
  depth: ImpactDepthSection,
  epilogue: string
): string {
  const parts = [preamble, depth.content, epilogue].filter(Boolean);
  return parts.join("\n\n");
}

export function buildDepthTicketSummary(
  baseSummary: string,
  depth: number
): string {
  const prefix = `[Depth ${depth}] `;
  const maxLen = 255 - prefix.length;
  const trimmed =
    baseSummary.length > maxLen
      ? `${baseSummary.slice(0, maxLen - 3)}...`
      : baseSummary;
  return `${prefix}${trimmed}`;
}
