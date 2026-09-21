"use client";

import { useEffect, useState } from "react";
import { CheckCircle2, ChevronLeft, ChevronRight, X } from "lucide-react";

/* ── Eski sürümler ─────────────────────────────────────────── */
interface UpdateEntry {
  version: string;
  storageKey: string;
  trTitle: string;
  enTitle: string;
  trSubtitle: string;
  enSubtitle: string;
  trItems: string[];
  enItems: string[];
}

const UPDATES: UpdateEntry[] = [
  {
    version: "0.1.0",
    storageKey: "zelixvary:update-seen:v0.1.0",
    trTitle: "🎉 Güncelleme Var!",
    enTitle: "🎉 Update Available!",
    trSubtitle: "🚀 0.1.0 sürümüyle neler geldi:",
    enSubtitle: "🚀 Here's what's new in version 0.1.0:",
    trItems: [
      "🗂️ Artık tek dosya değil, **3 ayrı dosya** (HTML + CSS + JS) birbirine bağlanarak çalıştırılabiliyor",
      "🐍 **Python** desteği eklendi! Kolay ve temel öğrenim için mükemmel bir zemin",
      "🤖 Yapay zeka hataları giderildi",
      "💬 **Sohbet geçmişi** eklendi",
      "🔐 **Sohbet geçmişi şifreleme** eklendi — hesabınız çalınsa bile sohbet geçmişiniz, belirlediğiniz **4 haneli şifre** ile korunur",
      "🛠️ Proje geçmiş hatası düzeltildi",
      "🐛 Geçmişe kaydetme bugu düzeltildi",
    ],
    enItems: [
      "🗂️ No longer a single file — **3 separate files** (HTML + CSS + JS) can now be linked and run together",
      "🐍 **Python** support added! A perfect foundation for easy, beginner-friendly learning",
      "🤖 AI bugs fixed",
      "💬 **Chat history** added",
      "🔐 **Chat history encryption** added — even if your account is compromised, your chats stay protected with your **4-digit PIN**",
      "🛠️ Project history error fixed",
      "🐛 Chat history saving bug fixed",
    ],
  },
];

/* ── En son sürüm (v0.2.1) ─────────────────────────────────── */
const LATEST: UpdateEntry = {
  version: "0.2.1",
  storageKey: "zelixvary:update-seen:v0.2.1",
  trTitle: "🎉 Yeni Güncelleme!",
  enTitle: "🎉 New Update!",
  trSubtitle: "🚀 0.2.1 sürümüyle neler geldi:",
  enSubtitle: "🚀 Here's what's new in version 0.2.1:",
  trItems: [
    "🆕 **Giriş sonrası seçim ekranı** — Artık giriş yapınca direkt kodlamaya başlamayacak. İki mod seçeneği sunulacak: Sunucuda kodlama (Local) ile Dosya içerisine yazarak kodlama (Kalıcı)",
    "🧠 **Claude AI eklendi!** — Anthropic Claude artık destekleniyor! Sonnet 4, 3.5 Sonnet, 3.5 Haiku modelleri kullanılabilir",
    "📋 **Model seçim sistemi** — Her yapay zeka sağlayıcısı için hangi modeli kullanacağını seçebilirsin (Ayarlar'dan). Tüm seçimler kaydedilir",
    "🔧 **Python terminal hatası güncellendi** — Eskiden terminale bir şey yazılamıyordu, artık input() gibi sorulan soruları cevaplayabileceğiniz bir yazma alanı mevcut",
    "🧠 **Yapay zeka sohbet hafızası eklendi** — Artık sohbetleri daha iyi tanıyacak, konuşulanları hatırlayacak ve ona göre yenilik yapacak",
    "📝 **Yapay zekaya ekstra istek sistemi eklendi** — Dosya seçtikten sonra altta ekstra istek bölümüne yapay zekaya ekstra olarak ne yapılmasını istiyorsanız yazabilirsiniz",
    "🎨 **Dosya tipi ikonları** — Python, HTML, CSS, JS, TS dosyaları artık kendi renk ve ikonlarıyla gösterilir",
    "🐛 **Hatalar düzeltildi** — Genel performans ve kararlılık iyileştirmeleri",
  ],
  enItems: [
    "🆕 **Post-login selection screen** — No longer jumps directly to coding after login. Two mode options: Local coding (temporary) and File-based coding (permanent)",
    "🧠 **Claude AI added!** — Anthropic Claude is now supported! Sonnet 4, 3.5 Sonnet, 3.5 Haiku models available",
    "📋 **Model selection system** — Choose which model each AI provider uses (in Settings). All selections are saved",
    "🔧 **Python terminal input fixed** — Terminal now supports input() and other interactive prompts with a dedicated input area",
    "🧠 **AI chat memory added** — AI now better remembers conversations, recalls context, and makes improvements accordingly",
    "📝 **AI extra request system added** — After selecting files, you can write additional instructions for the AI in the extra request section below",
    "🎨 **File type icons** — Python, HTML, CSS, JS, TS files now show with their own colors and icons",
    "🐛 **Bugs fixed** — General performance and stability improvements",
  ],
};

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
  const [pageIndex, setPageIndex] = useState(0);

  // Tüm güncellemeler: en yeniden en eskiye
  const allUpdates = [LATEST, ...UPDATES];
  const currentPage = allUpdates[pageIndex];

  useEffect(() => {
    const t = window.setTimeout(() => {
      try {
        if (localStorage.getItem(LATEST.storageKey) !== "1") setOpen(true);
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
        {/* Üst bar: Sürüm göstergesi ve navigasyon */}
        <div className="flex items-center justify-between border-b border-zinc-800 bg-[#1a1a1f] px-4 py-2.5">
          <button
            onClick={() => setPageIndex((i) => Math.min(i + 1, allUpdates.length - 1))}
            disabled={pageIndex >= allUpdates.length - 1}
            className="flex items-center gap-1 rounded-md px-2 py-1 text-[11px] text-zinc-400 transition hover:bg-zinc-800 hover:text-zinc-200 disabled:cursor-not-allowed disabled:opacity-30"
            title="Eski güncelleme"
          >
            <ChevronLeft size={14} />
            Eski
          </button>

          <div className="flex items-center gap-2">
            <span className="rounded-full bg-gradient-to-r from-violet-600 to-fuchsia-600 px-3 py-1 text-[11px] font-bold text-white shadow-lg">
              v{currentPage.version}
            </span>
            <span className="text-[11px] text-zinc-500">
              {pageIndex + 1} / {allUpdates.length}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setPageIndex((i) => Math.max(i - 1, 0))}
              disabled={pageIndex <= 0}
              className="flex items-center gap-1 rounded-md px-2 py-1 text-[11px] text-zinc-400 transition hover:bg-zinc-800 hover:text-zinc-200 disabled:cursor-not-allowed disabled:opacity-30"
              title="Yeni güncelleme"
            >
              Yeni
              <ChevronRight size={14} />
            </button>
            <button
              onClick={() => setOpen(false)}
              className="flex h-7 w-7 items-center justify-center rounded-full border border-zinc-700 bg-zinc-800/80 text-zinc-400 transition hover:bg-zinc-700 hover:text-zinc-100"
              title="Kapat / Close"
            >
              <X size={14} />
            </button>
          </div>
        </div>

        <div className="grid sm:grid-cols-2">
          <Side
            lang="🇬🇧 English"
            title={currentPage.enTitle}
            subtitle={currentPage.enSubtitle}
            items={currentPage.enItems}
            accent="border-b border-zinc-800 sm:border-b-0 sm:border-r"
            footer={
              <>
                <CheckCircle2 size={14} className="shrink-0 text-emerald-400" />
                <button
                  onClick={() => {
                    try {
                      // Tüm sürümleri okundu olarak işaretle
                      for (const update of allUpdates) {
                        localStorage.setItem(update.storageKey, "1");
                      }
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
            title={currentPage.trTitle}
            subtitle={currentPage.trSubtitle}
            items={currentPage.trItems}
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

        {/* Sayfa göstergeleri */}
        <div className="flex items-center justify-center gap-1.5 border-t border-zinc-800 bg-[#1a1a1f] py-2">
          {allUpdates.map((u, i) => (
            <button
              key={u.version}
              onClick={() => setPageIndex(i)}
              className={`h-1.5 rounded-full transition-all ${
                i === pageIndex
                  ? "w-6 bg-violet-500"
                  : "w-1.5 bg-zinc-700 hover:bg-zinc-500"
              }`}
              title={`v${u.version}`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
