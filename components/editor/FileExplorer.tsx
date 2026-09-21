"use client";

import { useState } from "react";
import { FileCode2, FilePlus2, Folder, Trash2 } from "lucide-react";

interface FileExplorerProps {
  files: Record<string, string>;
  currentFile: string | null;
  onSelect: (path: string) => void;
  onCreateFile: (path: string, content: string) => void;
  onDeleteFile: (path: string) => void;
}

/** Dosya uzantısına göre ikon ve renk döndürür */
function getFileIcon(path: string): { icon: React.ReactNode; color: string } {
  const ext = path.split(".").pop()?.toLowerCase() ?? "";
  switch (ext) {
    case "py":
      return {
        icon: <span className="text-[10px] font-bold">PY</span>,
        color: "bg-blue-500/20 text-blue-400",
      };
    case "html":
    case "htm":
      return {
        icon: <span className="text-[10px] font-bold">HTML</span>,
        color: "bg-orange-500/20 text-orange-400",
      };
    case "css":
      return {
        icon: <span className="text-[10px] font-bold">CSS</span>,
        color: "bg-sky-500/20 text-sky-400",
      };
    case "js":
    case "jsx":
    case "mjs":
      return {
        icon: <span className="text-[10px] font-bold">JS</span>,
        color: "bg-yellow-500/20 text-yellow-400",
      };
    case "ts":
    case "tsx":
      return {
        icon: <span className="text-[10px] font-bold">TS</span>,
        color: "bg-blue-600/20 text-blue-300",
      };
    case "json":
      return {
        icon: <span className="text-[10px] font-bold">JSON</span>,
        color: "bg-emerald-500/20 text-emerald-400",
      };
    case "md":
      return {
        icon: <span className="text-[10px] font-bold">MD</span>,
        color: "bg-zinc-500/20 text-zinc-300",
      };
    case "svg":
      return {
        icon: <span className="text-[10px] font-bold">SVG</span>,
        color: "bg-pink-500/20 text-pink-400",
      };
    case "png":
    case "jpg":
    case "jpeg":
    case "gif":
    case "webp":
      return {
        icon: <span className="text-[10px] font-bold">IMG</span>,
        color: "bg-purple-500/20 text-purple-400",
      };
    default:
      return {
        icon: <FileCode2 size={12} />,
        color: "bg-zinc-500/20 text-zinc-400",
      };
  }
}

export default function FileExplorer({
  files,
  currentFile,
  onSelect,
  onCreateFile,
  onDeleteFile,
}: FileExplorerProps) {
  const [creating, setCreating] = useState(false);
  const [newPath, setNewPath] = useState("");

  const paths = Object.keys(files).sort((a, b) => a.localeCompare(b));

  function handleCreate() {
    const path = newPath.trim().replace(/\\/g, "/");
    if (!path) return;
    if (files[path] !== undefined) {
      onSelect(path);
    } else {
      onCreateFile(path, "");
    }
    setNewPath("");
    setCreating(false);
  }

  return (
    <div className="flex h-full w-full flex-col bg-[#1c1c1f]">
      <div className="flex h-8 shrink-0 items-center justify-between border-b border-zinc-800 px-3">
        <span className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-zinc-500">
          <Folder size={12} /> Dosyalar
        </span>
        <button
          onClick={() => setCreating((v) => !v)}
          className="flex h-6 w-6 items-center justify-center rounded text-zinc-400 transition hover:bg-zinc-700/50 hover:text-zinc-100"
          title="Yeni dosya"
        >
          <FilePlus2 size={13} />
        </button>
      </div>

      {creating && (
        <div className="flex items-center gap-1 border-b border-zinc-800 px-2 py-1.5">
          <input
            autoFocus
            value={newPath}
            onChange={(e) => setNewPath(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleCreate();
              if (e.key === "Escape") {
                setCreating(false);
                setNewPath("");
              }
            }}
            placeholder="index.html, style.css, app.js, main.py"
            className="min-w-0 flex-1 rounded border border-zinc-700 bg-[#101013] px-2 py-1 text-[12px] text-zinc-100 placeholder-zinc-600 outline-none focus:border-violet-500"
            spellCheck={false}
          />
          <button
            onClick={handleCreate}
            className="flex h-6 shrink-0 items-center rounded bg-violet-600 px-2 text-[11px] font-medium text-white transition hover:bg-violet-500"
          >
            Ekle
          </button>
        </div>
      )}

      <div className="min-h-0 flex-1 overflow-y-auto py-1">
        {paths.length === 0 ? (
          <div className="px-3 py-6 text-center">
            <FileCode2 size={28} className="mx-auto mb-2 text-zinc-700" />
            <p className="text-[12px] font-medium text-zinc-500">Henüz dosya yok</p>
            <p className="mt-1 text-[11px] text-zinc-600">
              + butonuna basarak yeni dosya oluştur
            </p>
            <button
              onClick={() => setCreating(true)}
              className="mt-3 flex items-center gap-1.5 mx-auto rounded-lg border border-violet-500/50 bg-violet-500/10 px-3 py-1.5 text-[11px] font-medium text-violet-300 transition hover:bg-violet-500/20"
            >
              <FilePlus2 size={12} />
              Yeni Dosya Oluştur
            </button>
          </div>
        ) : (
          paths.map((path) => {
            const isActive = path === currentFile;
            const fileIcon = getFileIcon(path);
            return (
              <div
                key={path}
                onClick={() => onSelect(path)}
                className={`group flex cursor-pointer items-center gap-2 px-3 py-1.5 text-[12.5px] transition ${
                  isActive
                    ? "border-l-2 border-violet-500 bg-violet-500/10 text-violet-200"
                    : "border-l-2 border-transparent text-zinc-400 hover:bg-zinc-800/60 hover:text-zinc-200"
                }`}
                title={path}
              >
                <span
                  className={`flex h-5 w-8 shrink-0 items-center justify-center rounded text-[9px] font-bold ${fileIcon.color}`}
                >
                  {fileIcon.icon}
                </span>
                <span className="min-w-0 flex-1 truncate font-mono text-[12px]">{path}</span>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onDeleteFile(path);
                  }}
                  className="hidden h-5 w-5 shrink-0 items-center justify-center rounded text-zinc-600 transition hover:bg-red-500/20 hover:text-red-400 group-hover:flex"
                  title="Dosyayı sil"
                >
                  <Trash2 size={12} />
                </button>
              </div>
            );
          })
        )}
      </div>

      <div className="shrink-0 border-t border-zinc-800 px-3 py-1.5">
        <p className="text-[10.5px] text-zinc-600">
          {paths.length} dosya · {currentFile ? "düzenleniyor" : "seçim yok"}
        </p>
      </div>
    </div>
  );
}
