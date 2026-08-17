"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Bug, CheckCircle2, Loader2, Play, Square, Trash2 } from "lucide-react";

interface PythonRunnerProps {
  code: string;
  refreshKey: number;
  fileName?: string | null;
}

type PyLine = { id: number; kind: "out" | "err" | "info"; text: string };

const PYODIDE_VERSION = "v0.26.4";
const INDEX_URL = `https://cdn.jsdelivr.net/pyodide/${PYODIDE_VERSION}/full/`;

/**
 * Python kodu, UI'yi kilitlememesi için ayrı bir Web Worker'da çalıştırılır.
 * Sonsuz döngü / yoğun hesap sayfayı donduramaz; "Durdur" worker'ı sonlandırır.
 */
const WORKER_SRC = [
  `importScripts("${INDEX_URL}pyodide.js");`,
  ``,
  `let pyodide = null;`,
  ``,
  `function send(msg) { self.postMessage(msg); }`,
  ``,
  `self.onmessage = async function (e) {`,
  `  const msg = e.data;`,
  ``,
  `  if (msg.type === "init") {`,
  `    try {`,
  `      pyodide = await loadPyodide({`,
  `        indexURL: "${INDEX_URL}",`,
  `        stdin: () => ""`,
  `      });`,
  `      pyodide.setStdin({ stdin: () => "" });`,
  `      pyodide.setStdout({ batched: function (t) { send({ type: "out", text: t }); } });`,
  `      pyodide.setStderr({ batched: function (t) { send({ type: "err", text: t }); } });`,
  `      send({ type: "ready" });`,
  `    } catch (err) {`,
  `      send({ type: "load-error", message: String((err && err.message) || err) });`,
  `    }`,
  `    return;`,
  `  }`,
  ``,
  `  if (msg.type === "run") {`,
  `    if (!pyodide) { send({ type: "run-error", message: "Pyodide hazır değil." }); return; }`,
  `    const t0 = performance.now();`,
  `    try {`,
  `      pyodide.runPython(msg.code);`,
  `      send({ type: "done", duration: Math.round(performance.now() - t0) });`,
  `    } catch (err) {`,
  `      send({`,
  `        type: "run-error",`,
  `        message: String((err && err.message) || err),`,
  `        duration: Math.round(performance.now() - t0)`,
  `      });`,
  `    }`,
  `    return;`,
  `  }`,
  `};`,
].join("\n");

let workerUrl: string | null = null;
function getWorkerUrl(): string {
  if (!workerUrl) {
    workerUrl = URL.createObjectURL(new Blob([WORKER_SRC], { type: "text/javascript" }));
  }
  return workerUrl;
}

type WorkerMessage =
  | { type: "ready" }
  | { type: "load-error"; message: string }
  | { type: "out"; text: string }
  | { type: "err"; text: string }
  | { type: "done"; duration: number }
  | { type: "run-error"; message: string; duration: number };

export default function PythonRunner({ code, refreshKey, fileName }: PythonRunnerProps) {
  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [lines, setLines] = useState<PyLine[]>([]);
  const [running, setRunning] = useState(false);
  const workerRef = useRef<Worker | null>(null);
  const lineIdRef = useRef(1);
  const statusRef = useRef<"loading" | "ready" | "error">("loading");
  const runningRef = useRef(false);

  function pushLines(kind: "out" | "err", text: string) {
    const clean = text.replace(/\n$/, "");
    if (!clean) return;
    for (const part of clean.split("\n")) {
      setLines((prev) => [...prev.slice(-499), { id: lineIdRef.current++, kind, text: part }]);
    }
  }

  function pushInfo(text: string) {
    setLines((prev) => [...prev.slice(-499), { id: lineIdRef.current++, kind: "info", text }]);
  }

  const handleWorkerMessage = useCallback((msg: WorkerMessage) => {
    switch (msg.type) {
      case "ready":
        statusRef.current = "ready";
        setStatus("ready");
        break;
      case "load-error":
        statusRef.current = "error";
        setStatus("error");
        setErrorMsg(msg.message);
        break;
      case "out":
        pushLines("out", msg.text);
        break;
      case "err":
        pushLines("err", msg.text);
        break;
      case "done":
        runningRef.current = false;
        setRunning(false);
        pushInfo(`✓ program ${msg.duration} ms'de tamamlandı`);
        break;
      case "run-error":
        runningRef.current = false;
        setRunning(false);
        pushInfo(`Hata (${msg.duration} ms):`);
        pushLines("err", msg.message);
        break;
    }
  }, []);

  const createWorker = useCallback(() => {
    if (workerRef.current) workerRef.current.terminate();
    const worker = new Worker(getWorkerUrl());
    worker.onmessage = (e: MessageEvent<WorkerMessage>) => handleWorkerMessage(e.data);
    worker.onerror = (e) => {
      statusRef.current = "error";
      setStatus("error");
      setErrorMsg(`Worker hatası: ${e.message}`);
    };
    workerRef.current = worker;
    statusRef.current = "loading";
    worker.postMessage({ type: "init" });
  }, [handleWorkerMessage]);

  // Worker'ı oluştur ve Pyodide'ı yükle
  useEffect(() => {
    createWorker();
    return () => {
      workerRef.current?.terminate();
      workerRef.current = null;
    };
  }, [createWorker]);

  // Kod değişince otomatik çalıştır
  useEffect(() => {
    if (status !== "ready") return;
    const t = setTimeout(() => {
      runCode();
    }, 300);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [code, refreshKey, status]);

  function runCode() {
    const worker = workerRef.current;
    if (!worker || statusRef.current !== "ready" || runningRef.current) return;
    if (!code.trim()) {
      setLines([]);
      return;
    }
    runningRef.current = true;
    setRunning(true);
    setLines([]);
    worker.postMessage({ type: "run", code });
  }

  function handleInterrupt() {
    if (!runningRef.current) return;
    pushInfo("— program kullanıcı tarafından durduruldu —");
    // Sonsuz döngüyü durdurmanın en güvenilir yolu worker'ı sonlandırıp yeniden başlatmaktır.
    statusRef.current = "loading";
    setStatus("loading");
    createWorker();
  }

  return (
    <div className="flex h-full flex-col bg-[#0d0d10]">
      <div className="flex shrink-0 items-center gap-2 border-b border-zinc-800 bg-[#232328] px-3 py-1.5">
        <span
          className={`text-[11px] font-medium ${
            status === "ready" ? "text-emerald-400" : status === "error" ? "text-red-400" : "text-zinc-400"
          }`}
        >
          {status === "ready" ? "● Hazır" : status === "error" ? "✕ Hata" : "○ Python yükleniyor..."}
        </span>
        <span className="text-[11px] text-zinc-600">
          {fileName ?? "main.py"} · Pyodide {PYODIDE_VERSION}
        </span>
        <div className="ml-auto flex items-center gap-1">
          <button
            onClick={runCode}
            disabled={!code.trim() || status !== "ready"}
            className="flex h-7 items-center gap-1.5 rounded px-2 text-[11px] font-medium text-emerald-300 transition hover:bg-emerald-500/10 disabled:cursor-not-allowed disabled:opacity-40"
            title="Çalıştır"
          >
            {running ? <Loader2 size={12} className="animate-spin" /> : <Play size={12} />}
            Çalıştır
          </button>
          <button
            onClick={handleInterrupt}
            disabled={!running}
            className="flex h-7 items-center gap-1.5 rounded px-2 text-[11px] font-medium text-red-300 transition hover:bg-red-500/10 disabled:cursor-not-allowed disabled:opacity-40"
            title="Programı durdur (sonsuz döngü vb.)"
          >
            <Square size={11} />
            Durdur
          </button>
          <button
            onClick={() => setLines([])}
            className="flex h-7 items-center gap-1.5 rounded px-2 text-[11px] text-zinc-400 transition hover:bg-zinc-700/40 hover:text-zinc-100"
            title="Çıktıyı temizle"
          >
            <Trash2 size={12} />
            Temizle
          </button>
        </div>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto px-3 py-2 font-mono text-[12.5px] leading-relaxed">
        {status === "loading" && (
          <div className="flex items-center gap-2 py-2 text-[12px] text-zinc-500">
            <Loader2 size={14} className="animate-spin text-violet-400" />
            Python motoru indiriliyor (tek seferlik ~10 MB)...
          </div>
        )}
        {status === "error" && (
          <div className="flex items-start gap-2 rounded-lg border border-red-600/40 bg-red-950/40 p-3 text-[12px] text-red-300">
            <Bug size={14} className="mt-0.5 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}
        {status === "ready" && lines.length === 0 && (
          <div>
            <p className="text-zinc-600">
              {"Python REPL"} — kod burada çalışır, <span className="text-zinc-500">print()</span> çıktıları ve
              hatalar aşağıda görünür.
            </p>
            <p className="mt-1 text-zinc-700">
              <span className="text-emerald-500/70">$</span> her düzenlemede otomatik çalışır, ya da Çalıştır butonuna bas.
              <br />
              <span className="text-zinc-700">Not:</span>{" "}
              <span className="font-mono text-[11.5px]">input()</span> tarayıcıda boş değer döndürür;
              etkileşimli oyunlar <span className="font-mono text-[11.5px]">input()</span> yerine
              rastgele/sabit veriyle yazılmalı. Sonsuz döngü oluşursa <span className="text-red-300">Durdur</span> ile kes.
            </p>
          </div>
        )}
        {lines.map((line) => (
          <div key={line.id} className="flex gap-2">
            <span
              className={`shrink-0 select-none text-[10px] font-bold ${
                line.kind === "err" ? "text-red-400" : line.kind === "info" ? "text-zinc-500" : "text-emerald-500/60"
              }`}
            >
              {line.kind === "err" ? "✗" : line.kind === "info" ? "ℹ" : "»"}
            </span>
            <span
              className={`min-w-0 break-all whitespace-pre-wrap ${
                line.kind === "err" ? "text-red-300" : line.kind === "info" ? "text-zinc-400" : "text-zinc-100"
              }`}
            >
              {line.text}
            </span>
          </div>
        ))}
        {status === "ready" && (
          <div className="mt-1 flex items-center gap-1.5 text-[11px] text-zinc-600">
            <CheckCircle2 size={11} className="text-emerald-500/60" />
            {running ? "çalışıyor..." : "beklemede — kod değişince otomatik çalışır"}
          </div>
        )}
      </div>
    </div>
  );
}