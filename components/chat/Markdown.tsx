"use client";

import { useMemo, type ReactNode } from "react";
import { Check, Copy } from "lucide-react";
import { useState } from "react";
import type { ExtractedCode } from "@/lib/ai/extract";

interface MarkdownProps {
  text: string;
  onApply?: (block: ExtractedCode) => void;
}

function CodeBlockView({
  block,
  onApply,
}: {
  block: ExtractedCode;
  onApply?: (block: ExtractedCode) => void;
}) {
  const [copied, setCopied] = useState(false);

  function copy() {
    navigator.clipboard.writeText(block.code).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  return (
    <div className="group my-2 overflow-hidden rounded-lg border border-zinc-800 bg-[#101014]">
      <div className="flex items-center gap-2 border-b border-zinc-800/80 bg-zinc-900/70 px-3 py-1.5">
        <span className="rounded bg-zinc-800 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-violet-300">
          {block.language || "code"}
        </span>
        <div className="ml-auto flex items-center gap-1">
          {onApply && (
            <button
              onClick={() => onApply(block)}
              className="flex items-center gap-1 rounded bg-violet-600 px-2 py-1 text-[11px] font-medium text-white transition hover:bg-violet-500 active:scale-95"
            >
              <span className="text-xs">⇤</span> Uygula
            </button>
          )}
          <button
            onClick={copy}
            className="flex items-center gap-1 rounded bg-zinc-800 px-2 py-1 text-[11px] text-zinc-300 transition hover:bg-zinc-700"
          >
            {copied ? <Check size={11} className="text-emerald-400" /> : <Copy size={11} />}
            {copied ? "Kopyalandı" : "Kopyala"}
          </button>
        </div>
      </div>
      <pre className="overflow-x-auto p-3 font-mono text-[12.5px] leading-relaxed text-zinc-200">
        <code>{block.code}</code>
      </pre>
    </div>
  );
}

interface Segment {
  type: "text" | "code";
  content: string;
  language?: string;
}

function splitSegments(text: string): Segment[] {
  const segments: Segment[] = [];
  const fenceRe = /```([\w+-]*)\s*\n([\s\S]*?)```/g;
  let last = 0;
  let match: RegExpExecArray | null;
  while ((match = fenceRe.exec(text)) !== null) {
    if (match.index > last) {
      segments.push({ type: "text", content: text.slice(last, match.index) });
    }
    segments.push({
      type: "code",
      language: match[1]?.trim() || undefined,
      content: match[2].trim(),
    });
    last = match.index + match[0].length;
  }
  if (last < text.length) {
    segments.push({ type: "text", content: text.slice(last) });
  }
  return segments;
}

function renderInline(text: string, keyBase: string): ReactNode[] {
  const nodes: ReactNode[] = [];
  const inlineRe = /(`[^`]+`)|(\*\*[^*]+\*\*)|(\*[^*]+\*)|(\[([^\]]+)\]\(([^)]+)\))/g;
  let last = 0;
  let i = 0;
  let match: RegExpExecArray | null;
  while ((match = inlineRe.exec(text)) !== null) {
    if (match.index > last) {
      nodes.push(<span key={`${keyBase}-t${i}`}>{text.slice(last, match.index)}</span>);
      i++;
    }
    if (match[1]) {
      nodes.push(
        <code
          key={`${keyBase}-c${i}`}
          className="rounded bg-zinc-800/80 px-1.5 py-0.5 font-mono text-[11.5px] text-emerald-300"
        >
          {match[1].slice(1, -1)}
        </code>,
      );
    } else if (match[2]) {
      nodes.push(
        <strong key={`${keyBase}-b${i}`} className="font-semibold text-zinc-100">
          {match[2].slice(2, -2)}
        </strong>,
      );
    } else if (match[3]) {
      nodes.push(
        <em key={`${keyBase}-e${i}`} className="italic text-zinc-300">
          {match[3].slice(1, -1)}
        </em>,
      );
    } else if (match[4]) {
      nodes.push(
        <a
          key={`${keyBase}-a${i}`}
          href={match[6]}
          target="_blank"
          rel="noreferrer"
          className="text-sky-400 underline decoration-sky-400/40 underline-offset-2 hover:text-sky-300"
        >
          {match[5]}
        </a>,
      );
    }
    i++;
    last = match.index + match[0].length;
  }
  if (last < text.length) {
    nodes.push(<span key={`${keyBase}-e${i}`}>{text.slice(last)}</span>);
  }
  return nodes;
}

function TextBlock({ text, keyBase }: { text: string; keyBase: string }) {
  const lines = text.split("\n");
  const out: ReactNode[] = [];
  let listItems: string[] | null = null;
  let listKey = 0;
  let quote: string[] | null = null;
  let quoteKey = 0;

  function flushList() {
    if (listItems) {
      out.push(
        <ul key={`${keyBase}-ul${listKey++}`} className="my-1.5 space-y-1 pl-5 list-disc">
          {listItems.map((item, idx) => (
            <li key={idx}>{renderInline(item, `${keyBase}-li${idx}`)}</li>
          ))}
        </ul>,
      );
      listItems = null;
    }
  }

  function flushQuote() {
    if (quote) {
      out.push(
        <blockquote
          key={`${keyBase}-q${quoteKey++}`}
          className="my-1.5 border-l-2 border-violet-500 pl-3 text-zinc-300 italic"
        >
          {quote.map((q, idx) => (
            <p key={idx}>{renderInline(q, `${keyBase}-qt${idx}`)}</p>
          ))}
        </blockquote>,
      );
      quote = null;
    }
  }

  for (const line of lines) {
    if (line.startsWith("- ") || line.startsWith("* ")) {
      flushQuote();
      if (!listItems) listItems = [];
      listItems.push(line.slice(2));
      continue;
    }
    flushList();
    if (line.startsWith(">")) {
      if (!quote) quote = [];
      quote.push(line.slice(1).trim());
      continue;
    }
    flushQuote();
    const heading = line.match(/^(#{1,4})\s+(.*)$/);
    if (heading) {
      const level = heading[1].length;
      const Tag = (`h${level}`) as "h1";
      const size =
        level === 1
          ? "text-[15px] font-bold"
          : level === 2
            ? "text-[14px] font-bold"
            : "text-[13px] font-semibold";
      out.push(
        <Tag key={`${keyBase}-h${out.length}`} className={`${size} mt-2 mb-1 text-zinc-100`}>
          {renderInline(heading[2], `${keyBase}-h${out.length}`)}
        </Tag>,
      );
      continue;
    }
    if (line.trim() === "") {
      out.push(<div key={`${keyBase}-sp${out.length}`} className="h-2" />);
      continue;
    }
    out.push(
      <p key={`${keyBase}-p${out.length}`} className="my-1 text-[13px] leading-relaxed text-zinc-300">
        {renderInline(line, `${keyBase}-p${out.length}`)}
      </p>,
    );
  }
  flushList();
  flushQuote();

  return <>{out}</>;
}

export default function Markdown({ text, onApply }: MarkdownProps) {
  const segments = useMemo(() => splitSegments(text), [text]);

  return (
    <div className="min-w-0">
      {segments.map((seg, idx) =>
        seg.type === "code" ? (
          <CodeBlockView
            key={`${idx}-code`}
            block={{ language: seg.language ?? "html", code: seg.content }}
            onApply={onApply}
          />
        ) : (
          <TextBlock key={`${idx}-text`} text={seg.content} keyBase={`${idx}`} />
        ),
      )}
    </div>
  );
}
