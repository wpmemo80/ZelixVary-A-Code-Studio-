"use client";

import { useState, useRef, useEffect } from "react";
import { Globe } from "lucide-react";
import { useLang } from "@/lib/language-context";
import { LANG_LABELS, type Lang } from "@/lib/i18n";

export default function LanguageSwitcher() {
  const { lang, setLang } = useLang();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  // Dışarıya tıklayınca kapat — click yerine mousedown kullan
  // ama button'a tıklamayı da engelleme
  useEffect(() => {
    if (!open) return;
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    // mousedown yerine click kullan — button click'ini engellemez
    document.addEventListener("click", handleClick);
    return () => document.removeEventListener("click", handleClick);
  }, [open]);

  return (
    <div ref={ref} className="relative">
      <button
        onClick={(e) => {
          e.stopPropagation();
          setOpen((v) => !v);
        }}
        className="flex items-center gap-1.5 rounded-lg border border-zinc-700 px-2.5 py-1.5 text-[12px] font-medium text-zinc-300 transition hover:border-violet-500/60 hover:text-violet-300"
        title="Change language / Dil değiştir"
      >
        <Globe size={14} className="text-violet-400" />
        <span className="hidden sm:inline">{LANG_LABELS[lang]}</span>
        <span className="sm:hidden">{lang === "tr" ? "🇹🇷" : "🇬🇧"}</span>
      </button>

      {open && (
        <div
          onClick={(e) => e.stopPropagation()}
          className="absolute right-0 top-full z-[9999] mt-1.5 w-44 overflow-visible rounded-xl border border-zinc-700 bg-[#1c1c1f] p-1.5 shadow-2xl"
        >
          {(Object.keys(LANG_LABELS) as Lang[]).map((l) => (
            <button
              key={l}
              onClick={(e) => {
                e.stopPropagation();
                setLang(l);
                setOpen(false);
              }}
              className={`flex w-full items-center gap-2 rounded-lg px-3 py-2.5 text-left text-[13px] transition ${
                lang === l
                  ? "bg-violet-600/20 text-violet-300"
                  : "text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200"
              }`}
            >
              {LANG_LABELS[l]}
              {lang === l && <span className="ml-auto text-violet-400">✓</span>}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
