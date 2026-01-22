"use client";

import React from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";

interface Props {
  markdown: string;
}

function normalizeMarkdown(markdown: string) {
  if (typeof markdown !== 'string') {
    return markdown;
  }

  let normalized = markdown
    .replace(/\\n/g, '\n')
    .replace(/\\t/g, '\t')
    .replace(/\\r/g, '\r')
    .replace(/\\'/g, "'")
    .replace(/\\"/g, '"')
    .replace(/\\\\/g, '\\');

  const lines = normalized.split('\n');
  const processedLines: string[] = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmedLine = line.trim();
    const nextLine = lines[i + 1];

    const isListItemStart = /^\d+\.\s/.test(trimmedLine);

    const isNextLineContinuation = nextLine && /^\s+\*\*[^*]+\*\*:/.test(nextLine);

    const isCurrentLineContinuation = /^\s+\*\*[^*]+\*\*:/.test(line);

    if (isListItemStart) {
      if (isNextLineContinuation) {
        processedLines.push(line.replace(/\s+$/, '') + '  ');
      } else {
        processedLines.push(line);
      }
    } else if (isCurrentLineContinuation) {
      if (processedLines.length > 0) {
        const prevLine = processedLines[processedLines.length - 1];
        if (!prevLine.endsWith('  ')) {
          processedLines[processedLines.length - 1] = prevLine.replace(/\s+$/, '') + '  ';
        }
      }

      if (isNextLineContinuation) {
        processedLines.push(line.replace(/\s+$/, '') + '  ');
      } else {
        processedLines.push(line);
      }
    } else {
      processedLines.push(line);
    }
  }

  return processedLines.join('\n');
}

function extractAllText(node: any): string {
  if (typeof node === 'string') return node;
  if (typeof node === 'number') return String(node);
  if (React.isValidElement(node)) {
    const children = (node.props as any)?.children;
    if (Array.isArray(children)) {
      return children.map(extractAllText).join('');
    }
    return extractAllText(children || '');
  }
  if (Array.isArray(node)) {
    return node.map(extractAllText).join('');
  }
  return '';
}

function CustomListItem({ children, ...props }: any) {
  const fullText = extractAllText(children);

  const fieldNames = [
    'Target Database', 'Target Schema', 'Target Table', 'Target Column',
    'Explanation', 'Snippet', 'Source Database', 'Source Schema'
  ];

  const fieldPattern = new RegExp(
    `(${fieldNames.join('|')}):\\s*([^A-Z][^:]*?)(?=\\s*(?:${fieldNames.join('|')}):|$)`,
    'gi'
  );

  const matches: { field: string; value: string; start: number; end: number }[] = [];
  let match;
  let lastIndex = 0;

  while ((match = fieldPattern.exec(fullText)) !== null) {
    matches.push({
      field: match[1],
      value: match[2].trim(),
      start: match.index,
      end: match.index + match[0].length
    });
    lastIndex = match.index + match[0].length;
  }

  if (matches.length > 0) {
    const parts = [];
    let key = 0;

    if (matches[0].start > 0) {
      const beforeText = fullText.substring(0, matches[0].start).trim();
      if (beforeText) {
        parts.push(
          <div key={`text-${key++}`} className="mb-1 text-gray-700 dark:text-gray-300">
            {beforeText}
          </div>
        );
      }
    }

    matches.forEach((m, idx) => {
      parts.push(
        <div key={`field-${key++}`} className="mb-1">
          <strong className="text-gray-700 dark:text-gray-300 font-bold">{m.field}:</strong>
          {' '}
          <span className="text-gray-700 dark:text-gray-300">{m.value}</span>
        </div>
      );

      if (idx < matches.length - 1) {
        const betweenText = fullText.substring(m.end, matches[idx + 1].start).trim();
        if (betweenText && !fieldPattern.test(betweenText)) {
          parts.push(
            <div key={`text-between-${key++}`} className="mb-1 text-gray-700 dark:text-gray-300">
              {betweenText}
            </div>
          );
        }
      }
    });

    if (lastIndex < fullText.length) {
      const remainingText = fullText.substring(lastIndex).trim();
      if (remainingText) {
        parts.push(
          <div key={`text-${key++}`} className="mb-1 text-gray-700 dark:text-gray-300">
            {remainingText}
          </div>
        );
      }
    }

    return (
      <li {...props} className="mb-3">
        {parts.length > 0 ? parts : children}
      </li>
    );
  }

  return <li {...props} className="mb-2">{children}</li>;
}

export default function MarkdownRenderer({ markdown }: Props) {
  const normalizedMarkdown = normalizeMarkdown(markdown);

  return (
    <div className="impact-analysis-markdown">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeRaw]}
        components={{
          ol: ({ children, ...props }) => (
            <ol {...props} className="mb-4 pl-5 list-decimal text-sm">
              {children}
            </ol>
          ),
          ul: ({ children }) => (
            <ul className="mb-4 pl-5 list-disc text-sm space-y-1">
              {children}
            </ul>
          ),
          li: CustomListItem,
          p: ({ children }) => <p className="mb-4 leading-7 text-sm">{children}</p>,
          h1: ({ children }) => <h1 className="mt-6 mb-3 text-xl font-bold">{children}</h1>,
          h2: ({ children }) => <h2 className="mt-5 mb-3 text-lg font-semibold">{children}</h2>,
          h3: ({ children }) => <h3 className="mt-4 mb-2 text-base font-semibold">{children}</h3>,
          blockquote: ({ children }) => (
            <blockquote className="mt-4 border-l-4 border-primary pl-4 italic text-muted-foreground text-sm">
              {children}
            </blockquote>
          ),
          code: ({ className, children, ...props }) => {
            const match = /language-(\w+)/.exec(className || "");
            const isInline = !match && !String(children).includes("\n");

            if (isInline) {
              return (
                <code className="bg-muted px-1.5 py-0.5 rounded text-xs font-mono" {...props}>
                  {children}
                </code>
              );
            }
            return (
              <pre className="bg-muted p-3 round-md overflow-x-auto text-xs my-3">
                <code className={className} {...props}>
                  {children}
                </code>
              </pre>
            );
          },
          table: ({ children }) => (
            <div className="overflow-x-auto my-6">
              <table className="w-full text-left text-sm border-collapse">{children}</table>
            </div>
          ),
          thead: ({ children }) => (
            <thead className="bg-muted/50 border-b">{children}</thead>
          ),
          tbody: ({ children }) => <tbody>{children}</tbody>,
          tr: ({ children }) => <tr className="border-b last:border-0">{children}</tr>,
          th: ({ children }) => (
            <th className="py-3 px-4 font-semibold text-muted-foreground">{children}</th>
          ),
          td: ({ children }) => <td className="py-3 px-4 align-top">{children}</td>,
          hr: () => <hr className="my-6 border-slate-200 dark:border-slate-800" />,
        }}
      >
        {normalizedMarkdown}
      </ReactMarkdown>
    </div>
  );
}
