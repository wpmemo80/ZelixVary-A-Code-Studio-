"use client";

import { useEffect, useState } from "react";
import { CheckCircle2, X } from "lucide-react";

const STORAGE_KEY = "zelixvary:update-seen:v0.1.0";

const TR_ITEMS = [
  "🗂️ Artık tek dosya değil, **3 ayrı dosya** (HTML + CSS + JS) birbirine bağlanarak çalıştırılabiliyor",
  "🐍 **Python** desteği eklendi! Kolay ve temel öğrenim için mükemmel bir zemin",
  "🤖 Yapay zeka hataları giderildi",
  "💬 **Sohbet geçmişi** eklendi",
  "🔐 **Sohbet geçmişi şifreleme** eklendi — hesabınız çalınsa bile sohbet geçmişiniz, belirlediğiniz **4 haneli şifre** ile korunur",
  "🛠️ Proje geçmiş hatası düzeltildi",
  "🐛 Geçmişe kaydetme bugu düzeltildi",
];

const EN_ITEMS = [
  "🗂️ No longer a single file — **3 separate files** (HTML + CSS + JS) can now be linked and run together",
  "🐍 **Python** support added! A perfect foundation for easy, beginner-friendly learning",
  "🤖 AI bugs fixed",
  "💬 **Chat history** added",
  "🔐 **Chat history encryption** added — even if your account is compromised, your chats stay protected with your **4-digit PIN**",
  "🛠️ Project history error fixed",
  "🐛 Chat history saving bug fixed",
];

function renderBold(text: string) {
  return text.split("**").map((part, i) => (i % 2 === 1 ? <strong key={i}>{part}</strong> : part));
}

function Side({
  lang,
  title,
  subtitle,
  items,
  accent,
  footer,
}: {
  lang: string;
  title: string;
  subtitle: string;
  items: string[];
  accent: string;
  footer: React.ReactNode;
}) {
  return (
    <div className={`flex flex-col p-6 ${accent}`}>
      <div className="mb-2 flex items-center gap-2">
        <span className="rounded-full border border-zinc-700 bg-zinc-800/80 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-zinc-400">
          {lang}
        </span>
        <span className="rounded-full border border-violet-500/50 bg-violet-500/10 px-2.5 py-0.5 text-[10px] font-bold tracking-wider text-violet-300">
          v0.1.0
        </span>
      </div>
      <h3 className="mb-0.5 text-[19px] font-extrabold text-zinc-50">{title}</h3>
      <p className="mb-4 text-[12.5px] text-zinc-500">{subtitle}</p>
      <ul className="mb-5 space-y-2.5">
        {items.map((item) => (
          <li key={item} className="text-[12.5px] leading-relaxed text-zinc-300">
            {renderBold(item)}
          </li>
        ))}
      </ul>
      <div className="mt-auto flex items-center gap-2 pt-2">{footer}</div>
    </div>
  );
}

export default function UpdatePanel() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const t = window.setTimeout(() => {
      try {
        if (localStorage.getItem(STORAGE_KEY) !== "1") setOpen(true);
      } catch {
        setOpen(true);
      }
    }, 0);
    return () => window.clearTimeout(t);
  }, []);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
      <div className="relative w-full max-w-3xl overflow-hidden rounded-2xl border border-zinc-700 bg-[#141417] shadow-2xl">
        <button
          onClick={() => setOpen(false)}
          className="absolute right-3 top-3 z-10 flex h-8 w-8 items-center justify-center rounded-full border border-zinc-700 bg-zinc-800/80 text-zinc-400 transition hover:bg-zinc-700 hover:text-zinc-100"
          title="Kapat / Close"
        >
          <X size={15} />
        </button>

        <div className="grid sm:grid-cols-2">
          <Side
            lang="🇬🇧 English"
            title="🎉 Update Available!"
            subtitle="🚀 Here's what's new in version 0.1.0:"
            items={EN_ITEMS}
            accent="border-b border-zinc-800 sm:border-b-0 sm:border-r"
            footer={
              <>
                <CheckCircle2 size={14} className="shrink-0 text-emerald-400" />
                <button
                  onClick={() => {
                    try {
                      localStorage.setItem(STORAGE_KEY, "1");
                    } catch {
                      // yut
                    }
                    setOpen(false);
                  }}
                  className="text-[12px] font-semibold text-emerald-400 transition hover:text-emerald-300"
                >
                  I&apos;ve Read It — Don&apos;t Show Again
                </button>
              </>
            }
          />
          <Side
            lang="🇹🇷 Türkçe"
            title="🎉 Güncelleme Var!"
            subtitle="🚀 0.1.0 sürümüyle neler geldi:"
            items={TR_ITEMS}
            accent="bg-[#0f0f13]"
            footer={
              <>
                <CheckCircle2 size={14} className="shrink-0 text-violet-400" />
                <button
                  onClick={() => setOpen(false)}
                  className="text-[12px] font-semibold text-violet-400 transition hover:text-violet-300"
                >
                  ✔️ Kapat
                </button>
              </>
            }
          />
        </div>
      </div>
    </div>
  );
}
