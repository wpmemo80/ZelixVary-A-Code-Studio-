"use client";

import { EyeOff, FileCode2 } from "lucide-react";
import { buildJsConsoleDoc, buildSandboxHtml, inlineProjectAssets } from "@/lib/sandbox";
import { useLang } from "@/lib/language-context";
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
  const { t } = useLang();

  if (!projectMode) {
    return <LivePreview srcdoc={buildSandboxHtml(singleCode)} refreshKey={refreshKey} fileName="index.html" />;
  }

  if (!currentFile) {
    return (
      <div className="flex h-full items-center justify-center bg-[#18181b]">
        <div className="max-w-sm rounded-xl border border-dashed border-zinc-800 p-6 text-center">
          <FileCode2 size={24} className="mx-auto mb-2 text-zinc-700" />
          <p className="text-[13px] text-zinc-500">
            {t("preview.selectFile")}
            <br />
            <span className="text-zinc-600">{t("preview.hint")}</span>
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
          {ext ? `.${ext}` : t("preview.thisFile")} {t("preview.cannotPreview")}
          <br />
          <span className="text-zinc-600">
            {t("preview.linkHint")}{" "}
            <span className="font-mono">index.html</span> {t("preview.linkHint2")}{" "}
            <span className="font-mono">{currentFile}</span> {t("preview.linkHint3")}
          </span>
        </p>
      </div>
    </div>
  );
}