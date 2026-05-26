/** Markdown → Jira wiki for create-issue descriptions. */

function parseMarkdownTableRow(line: string): string[] {
  return line
    .split("|")
    .map((cell) => cell.trim())
    .filter((_, index, cells) => index > 0 && index < cells.length - 1);
}

function isMarkdownTableSeparator(line: string): boolean {
  return /^\|[\s\-:|]+\|$/.test(line.trim());
}

function convertMarkdownTables(text: string): string {
  const lines = text.split("\n");
  const result: string[] = [];
  let index = 0;

  while (index < lines.length) {
    const line = lines[index];
    const trimmed = line.trim();

    if (trimmed.startsWith("|") && trimmed.endsWith("|")) {
      const tableLines: string[] = [];
      while (index < lines.length) {
        const row = lines[index].trim();
        if (!row.startsWith("|") || !row.endsWith("|")) break;
        tableLines.push(lines[index]);
        index += 1;
      }

      if (tableLines.length >= 1) {
        const header = parseMarkdownTableRow(tableLines[0]);
        const dataStart =
          tableLines.length > 1 && isMarkdownTableSeparator(tableLines[1])
            ? 2
            : 1;

        result.push(`|| ${header.join(" || ")} ||`);
        for (let rowIndex = dataStart; rowIndex < tableLines.length; rowIndex += 1) {
          const cells = parseMarkdownTableRow(tableLines[rowIndex]);
          result.push(`| ${cells.join(" | ")} |`);
        }
        continue;
      }
    }

    result.push(line);
    index += 1;
  }

  return result.join("\n");
}

function markdownToJiraWiki(markdown: string): string {
  let text = markdown.replace(/\r\n/g, "\n");

  text = convertMarkdownTables(text);

  text = text.replace(/\[([^\]]+)\]\(([^)]+)\)/g, "[$1|$2]");
  text = text.replace(/\*\*([^*]+)\*\*/g, "*$1*");
  text = text.replace(/^#### (.+)$/gm, "h4. $1");
  text = text.replace(/^### (.+)$/gm, "h3. $1");
  text = text.replace(/^## (.+)$/gm, "h2. $1");
  text = text.replace(/^# (.+)$/gm, "h1. $1");
  text = text.replace(/^---$/gm, "----");
  text = text.replace(/^- /gm, "* ");

  return text;
}

function buildReferencesAppendixJira(
  prUrl?: string | null,
  analysisUrl?: string | null
): string {
  const items: string[] = [];

  if (prUrl?.trim()) {
    items.push(`* *Pull request:* [View pull request|${prUrl.trim()}]`);
  }
  if (analysisUrl?.trim()) {
    items.push(`* *Analysis report:* [View analysis report|${analysisUrl.trim()}]`);
  }
  if (items.length === 0) return "";

  return ["----", "", "h3. References", "", ...items].join("\n");
}

function buildAffectedQueriesSection(queryIds?: string[] | null): string {
  if (!queryIds || queryIds.length === 0) return "";

  const items = queryIds.map((id) => `* {{${id}}}`).join("\n");
  return ["----", "", "h3. Affected Query IDs", "", items].join("\n");
}

export function buildJiraTicketDescription(
  body: string,
  prUrl?: string | null,
  analysisUrl?: string | null,
  affectedQueryIds?: string[] | null
): string {
  const wikiBody = markdownToJiraWiki(body.trim());
  const references = buildReferencesAppendixJira(prUrl, analysisUrl);
  const queries = buildAffectedQueriesSection(affectedQueryIds);

  return [wikiBody, references, queries].filter(Boolean).join("\n\n");
}