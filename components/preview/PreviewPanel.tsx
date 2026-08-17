"use client";

import { EyeOff, FileCode2 } from "lucide-react";
import { buildJsConsoleDoc, buildSandboxHtml, inlineProjectAssets } from "@/lib/sandbox";
import LivePreview from "./LivePreview";
import PythonRunner from "./PythonRunner";

interface PreviewPanelProps {
  projectMode: boolean;
  currentFile: string | null;
  files: Record<string, string> | null;
  singleCode: string;
  refreshKey: number;
}

export default function PreviewPanel({
  projectMode,
  currentFile,
  files,
  singleCode,
  refreshKey,
}: PreviewPanelProps) {
  if (!projectMode) {
    return <LivePreview srcdoc={buildSandboxHtml(singleCode)} refreshKey={refreshKey} fileName="index.html" />;
  }

  if (!currentFile) {
    return (
      <div className="flex h-full items-center justify-center bg-[#18181b]">
        <div className="max-w-sm rounded-xl border border-dashed border-zinc-800 p-6 text-center">
          <FileCode2 size={24} className="mx-auto mb-2 text-zinc-700" />
          <p className="text-[13px] text-zinc-500">
            Önizleme için soldan bir dosya seç.
            <br />
            <span className="text-zinc-600">HTML → canlı web, JS → konsol, PY → Python çalıştırıcı</span>
          </p>
        </div>
      </div>
    );
  }

  const content = files?.[currentFile] ?? "";
  const ext = currentFile.split(".").pop()?.toLowerCase() ?? "";

  if (ext === "html" || ext === "htm") {
    const html = inlineProjectAssets(content, files ?? {});
    return <LivePreview srcdoc={buildSandboxHtml(html)} refreshKey={refreshKey} fileName={currentFile} />;
  }

  if (ext === "py") {
    return <PythonRunner code={content} refreshKey={refreshKey} fileName={currentFile} />;
  }

  if (ext === "js" || ext === "mjs" || ext === "jsx" || ext === "ts" || ext === "tsx") {
    return (
      <LivePreview srcdoc={buildJsConsoleDoc(content)} refreshKey={refreshKey} fileName={currentFile} autoConsole />
    );
  }

  return (
    <div className="flex h-full items-center justify-center bg-[#18181b]">
      <div className="max-w-sm rounded-xl border border-dashed border-zinc-800 p-6 text-center">
        <EyeOff size={24} className="mx-auto mb-2 text-zinc-700" />
        <p className="text-[13px] text-zinc-500">
          {ext ? `.${ext}` : "Bu"} dosyası tek başına önizlenemez.
          <br />
          <span className="text-zinc-600">
            Bir <span className="font-mono">index.html</span> açıp bu dosyayı{" "}
            <span className="font-mono">{currentFile}</span> olarak bağla.
          </span>
        </p>
      </div>
    </div>
  );
}