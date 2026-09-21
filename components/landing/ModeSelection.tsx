"use client";

import { useState } from "react";
import {
  Cloud,
  FileCode2,
  FolderOpen,
  HardDrive,
  Info,
  AlertTriangle,
} from "lucide-react";

interface ModeSelectionProps {
  onSelect: (mode: "local" | "file") => void;
}

export default function ModeSelection({ onSelect }: ModeSelectionProps) {
  const [hovered, setHovered] = useState<"local" | "file" | null>(null);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[#0b0b0f] px-4">
      {/* Hoşgeldiniz Başlığı */}
      <div className="mb-2 text-center">
        <h1 className="text-4xl font-extrabold tracking-tight text-zinc-50 sm:text-5xl">
          ZelixVary{" "}
          <span className="bg-gradient-to-r from-violet-400 via-fuchsia-400 to-sky-400 bg-clip-text text-transparent">
            Hoşgeldiniz
          </span>
        </h1>
        <p className="mt-3 text-[15px] text-zinc-400">
          Vibe Coding için en iyi ortam
        </p>
      </div>

      {/* Seçim Kutuları */}
      <div className="mt-12 grid w-full max-w-3xl gap-6 sm:grid-cols-2">
        {/* 1. Kutu — Local Kodla */}
        <button
          onClick={() => onSelect("local")}
          onMouseEnter={() => setHovered("local")}
          onMouseLeave={() => setHovered(null)}
          className={`group relative overflow-hidden rounded-2xl border p-6 text-left transition-all duration-300 ${
            hovered === "local"
              ? "border-violet-500/60 bg-[#181821] shadow-xl shadow-violet-900/30 scale-[1.02]"
              : "border-zinc-800 bg-[#131318] hover:border-zinc-700"
          }`}
        >
          {/* Gradient arka plan */}
          <div className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full bg-violet-600/10 blur-3xl transition-opacity duration-500 group-hover:opacity-100 opacity-0" />

          <div className="relative">
            <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-600 to-fuchsia-600 shadow-lg shadow-violet-900/50 transition-transform duration-300 group-hover:scale-110">
              <Cloud size={26} className="text-white" />
            </div>

            <h2 className="mb-2 text-[18px] font-bold text-zinc-100">
              Local Kodla
            </h2>

            <p className="mb-4 text-[13px] leading-relaxed text-zinc-400">
              Bulut üzerinde deneme amaçlı bir sistemdir.
            </p>

            <div className="flex items-start gap-2 rounded-xl border border-amber-500/30 bg-amber-500/10 px-3 py-2.5">
              <AlertTriangle
                size={16}
                className="mt-0.5 shrink-0 text-amber-400"
              />
              <p className="text-[11.5px] leading-relaxed text-amber-300/90">
                <span className="font-semibold">UYARI:</span> Tarayıcınızı
                kapatır veya sekmeyi kapatırsanız her şey silinir.
              </p>
            </div>

            <div className="mt-4 flex items-center gap-2 text-[12px] text-zinc-500">
              <FileCode2 size={13} className="text-violet-400" />
              Geçici kodlama stüdyosu
            </div>
          </div>
        </button>

        {/* 2. Kutu — Dosya Üzerine Kodla */}
        <button
          onClick={() => onSelect("file")}
          onMouseEnter={() => setHovered("file")}
          onMouseLeave={() => setHovered(null)}
          className={`group relative overflow-hidden rounded-2xl border p-6 text-left transition-all duration-300 ${
            hovered === "file"
              ? "border-emerald-500/60 bg-[#181821] shadow-xl shadow-emerald-900/30 scale-[1.02]"
              : "border-zinc-800 bg-[#131318] hover:border-zinc-700"
          }`}
        >
          {/* Gradient arka plan */}
          <div className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full bg-emerald-600/10 blur-3xl transition-opacity duration-500 group-hover:opacity-100 opacity-0" />

          <div className="relative">
            <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-600 to-teal-600 shadow-lg shadow-emerald-900/50 transition-transform duration-300 group-hover:scale-110">
              <HardDrive size={26} className="text-white" />
            </div>

            <h2 className="mb-2 text-[18px] font-bold text-zinc-100">
              Dosya Üzerine Kodla
            </h2>

            <p className="mb-4 text-[13px] leading-relaxed text-zinc-400">
              Eklediğiniz dosyayı alır ve içerisine yazdığınız her şeyi o
              dosyaya yazar. <span className="font-semibold text-zinc-300">Kalıcıdır.</span>
            </p>

            <div className="flex items-start gap-2 rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-3 py-2.5">
              <Info size={16} className="mt-0.5 shrink-0 text-emerald-400" />
              <p className="text-[11.5px] leading-relaxed text-emerald-300/90">
                Kaydedip çıkarsanız aynı dosyadan içeriği değiştirilmiş olarak
                çıkar.
              </p>
            </div>

            <div className="mt-4 flex items-center gap-2 text-[12px] text-zinc-500">
              <FolderOpen size={13} className="text-emerald-400" />
              Kalıcı proje modu
            </div>
          </div>
        </button>
      </div>

      {/* Alt bilgi */}
      <p className="mt-8 text-[12px] text-zinc-600">
        İstediğin zaman mod değiştirebilirsin.
      </p>
    </div>
  );
}
