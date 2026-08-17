"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { ExternalLink, RefreshCw, Terminal } from "lucide-react";

export interface ConsoleEntry {
  id: number;
  type: "log" | "warn" | "error" | "info";
  data: string[];
  time: string;
}

interface LivePreviewProps {
  srcdoc: string;
  refreshKey: number;
  fileName?: string;
  autoConsole?: boolean;
}

export default function LivePreview({ srcdoc, refreshKey, fileName = "index.html", autoConsole = false }: LivePreviewProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [logsBySource, setLogsBySource] = useState<Record<string, ConsoleEntry[]>>({});
  const [showConsole, setShowConsole] = useState(autoConsole);
  const [loaded, setLoaded] = useState(false);

  const sourceKey = `${refreshKey}:${srcdoc.length}:${srcdoc.slice(0, 64)}`;
  const logs = logsBySource[sourceKey] ?? [];
  const errorCount = logs.filter((l) => l.type === "error").length;

  useEffect(() => {
    function onMessage(event: MessageEvent) {
      const msg = event.data;
      if (!msg || msg.source !== "zelixvary") return;
      if (!iframeRef.current || event.source !== iframeRef.current.contentWindow) return;
      setLogsBySource((prev) => {
        const key = sourceKey;
        const entry: ConsoleEntry = {
          id: Date.now() + Math.random(),
          type:
            msg.type === "log" || msg.type === "warn" || msg.type === "error" || msg.type === "info"
              ? msg.type
              : "log",
          data: Array.isArray(msg.data) ? msg.data : [String(msg.data)],
          time: new Date().toLocaleTimeString("tr-TR", { hour12: false }),
        };
        const next = { ...prev, [key]: [...(prev[key] ?? []).slice(-199), entry] };
        const keys = Object.keys(next);
        if (keys.length > 5) {
          delete next[keys[0]];
        }
        return next;
      });
    }
    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function openInNewTab() {
    if (!srcdoc.trim()) return;
    const blob = new Blob([srcdoc], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    window.open(url, "_blank");
    setTimeout(() => URL.revokeObjectURL(url), 60_000);
  }

  const isEmpty = useMemo(() => srcdoc.trim().length === 0, [srcdoc]);

  return (
    <div className="flex h-full flex-col">
      <div className="flex shrink-0 items-center gap-2 border-b border-zinc-800 bg-[#232328] px-3 py-1.5">
        <span className="text-[11px] font-medium text-zinc-400">
          {loaded ? "● Canlı" : "○ Yükleniyor..."}
        </span>
        <span className="text-[11px] text-zinc-600">{fileName}</span>
        <div className="ml-auto flex items-center gap-1">
          <button
            onClick={openInNewTab}
            title="Yeni sekmede aç"
            className="flex h-7 w-7 items-center justify-center rounded text-zinc-400 transition hover:bg-zinc-700/50 hover:text-zinc-100"
          >
            <ExternalLink size={14} />
          </button>
          <button
            onClick={() => setShowConsole((v) => !v)}
            title="Konsol"
            className={`flex h-7 items-center gap-1.5 rounded px-2 text-[11px] font-medium transition ${
              showConsole
                ? "bg-zinc-700/60 text-zinc-100"
                : "text-zinc-400 hover:bg-zinc-700/40 hover:text-zinc-100"
            }`}
          >
            <Terminal size={13} />
            Konsol
            {errorCount > 0 && (
              <span className="flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500/90 px-1 text-[10px] font-bold text-white">
                {errorCount}
              </span>
            )}
          </button>
        </div>
      </div>

      <div className="relative min-h-0 flex-1 bg-white">
        {isEmpty && (
          <div className="absolute inset-0 flex items-center justify-center bg-[#18181b]">
            <div className="text-center">
              <RefreshCw size={28} className="mx-auto mb-2 text-zinc-600" />
              <p className="text-sm text-zinc-500">Önizlenecek kod yok</p>
            </div>
          </div>
        )}
        {!isEmpty && (
          <iframe
            key={refreshKey}
            ref={iframeRef}
            sandbox="allow-scripts allow-modals allow-forms allow-popups"
            onLoad={() => setLoaded(true)}
            srcDoc={srcdoc}
            title="ZelixVary Canlı Önizleme"
            className="absolute inset-0 h-full w-full border-0"
          />
        )}
      </div>

      {showConsole && (
        <div className="flex h-40 shrink-0 flex-col border-t border-zinc-800 bg-[#101013]">
          <div className="flex items-center gap-2 border-b border-zinc-800/80 px-3 py-1 text-[11px] font-medium text-zinc-400">
            <Terminal size={12} />
            Konsol
            <span className="text-zinc-600">
              {logs.length === 0 ? "henüz çıktı yok" : `${logs.length} kayıt`}
            </span>
            <button
              onClick={() =>
                setLogsBySource((prev) => ({ ...prev, [sourceKey]: [] }))
              }
              className="ml-auto text-zinc-500 transition hover:text-zinc-200"
            >
              Temizle
            </button>
          </div>
          <div className="flex-1 overflow-y-auto px-3 py-2 font-mono text-[12px] leading-relaxed">
            {logs.length === 0 ? (
              <p className="text-zinc-600">
                <span className="text-zinc-500">{"//"}</span> console.log çıktıları
                burada görünür
              </p>
            ) : (
              logs.map((entry) => (
                <div key={entry.id} className="flex gap-2">
                  <span
                    className={`shrink-0 text-[10px] uppercase ${
                      entry.type === "error"
                        ? "text-red-400"
                        : entry.type === "warn"
                          ? "text-yellow-400"
                          : entry.type === "info"
                            ? "text-sky-400"
                            : "text-zinc-500"
                    }`}
                  >
                    {entry.type}
                  </span>
                  <span
                    className={`min-w-0 break-all ${
                      entry.type === "error"
                        ? "text-red-300"
                        : entry.type === "warn"
                          ? "text-yellow-200"
                          : entry.type === "info"
                            ? "text-sky-200"
                            : "text-zinc-200"
                    }`}
                  >
                    {entry.data.join(" ")}
                  </span>
                  <span className="ml-auto shrink-0 text-[10px] text-zinc-600">
                    {entry.time}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
