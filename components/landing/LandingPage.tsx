"use client";

import { useState } from "react";
import {
  Bot,
  FileCode2,
  FolderOpen,
  Heart,
  LogIn,
  MessagesSquare,
  Play,
  Sparkles,
  UserPlus,
  Wand2,
} from "lucide-react";
import AuthModal, { type AuthMode } from "@/components/auth/AuthModal";

export default function LandingPage() {
  const [authMode, setAuthMode] = useState<AuthMode | null>(null);

  const features = [
    {
      icon: <Play size={16} />,
      title: "Canlı Önizleme",
      desc: "HTML, CSS, JS ve Python kodunu tarayıcıyı terk etmeden anında çalıştır.",
      color: "text-sky-400",
    },
    {
      icon: <Sparkles size={16} />,
      title: "4+ Yapay Zeka",
      desc: "Gemini, DeepSeek, Grok ve OpenAI — ZelixVary Auto Router en iyisini seçer.",
      color: "text-fuchsia-400",
    },
    {
      icon: <Wand2 size={16} />,
      title: "Tek Tıkla Uygula",
      desc: "AI'ın ürettiği kodu doğrudan editöre aktar, hata bul, refactor et.",
      color: "text-emerald-400",
    },
    {
      icon: <FolderOpen size={16} />,
      title: "Bulut Projeler",
      desc: "Klasörlerini içe aktar, dosyalarını düzenle, hepsi hesabında saklansın.",
      color: "text-amber-400",
    },
    {
      icon: <MessagesSquare size={16} />,
      title: "Kalıcı Sohbet Geçmişi",
      desc: "AI sohbetlerin hesabına kaydedilir, kaldığın yerden devam edersin.",
      color: "text-violet-400",
    },
    {
      icon: <FileCode2 size={16} />,
      title: "Monaco Editörü",
      desc: "VS Code gücünde editör: sözdizimi vurgulama, otomatik tamamlama, satır numaraları.",
      color: "text-sky-400",
    },
  ];

  return (
    <div className="min-h-screen bg-[#0b0b0f] text-zinc-200">
      {/* Navbar */}
      <nav className="flex items-center justify-between border-b border-zinc-800/70 bg-[#0b0b0f]/80 px-6 py-4 backdrop-blur">
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-violet-600 to-fuchsia-600 shadow-lg shadow-violet-900/50">
            <FileCode2 size={18} className="text-white" />
          </div>
          <div>
            <p className="text-[16px] font-bold tracking-tight text-zinc-100">
              Zelix<span className="text-violet-400">Vary</span>
            </p>
            <p className="text-[10.5px] text-zinc-500">Multi-AI Code Studio</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setAuthMode("login")}
            className="flex items-center gap-2 rounded-lg border border-zinc-700 px-4 py-2 text-[13px] font-medium text-zinc-300 transition hover:border-violet-500/60 hover:text-violet-300"
          >
            <LogIn size={15} />
            Giriş Yap
          </button>
          <button
            onClick={() => setAuthMode("register")}
            className="flex items-center gap-2 rounded-lg bg-gradient-to-r from-violet-600 to-fuchsia-600 px-4 py-2 text-[13px] font-semibold text-white shadow-lg shadow-violet-900/40 transition hover:from-violet-500 hover:to-fuchsia-500 active:scale-95"
          >
            <UserPlus size={15} />
            Kayıt Ol
          </button>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative overflow-hidden px-6 pb-16 pt-20 text-center">
        <div className="pointer-events-none absolute left-1/2 top-0 h-[500px] w-[700px] -translate-x-1/2 rounded-full bg-violet-700/20 blur-[120px]" />
        <div className="relative mx-auto max-w-3xl">
          <div className="mx-auto mb-6 flex w-fit items-center gap-2 rounded-full border border-violet-500/30 bg-violet-500/10 px-4 py-1.5 text-[12px] font-medium text-violet-300">
            <Sparkles size={13} />
            Gemini • DeepSeek • Grok • OpenAI destekli
          </div>
          <h1 className="text-4xl font-extrabold leading-tight tracking-tight text-zinc-50 sm:text-5xl">
            Kod Yaz, Önizle,
            <br />
            <span className="bg-gradient-to-r from-violet-400 via-fuchsia-400 to-sky-400 bg-clip-text text-transparent">
              Yapay Zekaya Bırak.
            </span>
          </h1>
          <p className="mx-auto mt-5 max-w-xl text-[15px] leading-relaxed text-zinc-400">
            ZelixVary; VS Code deneyimini tarayıcıya taşır. Monaco editörü, canlı önizleme ve
            istemine göre en uygun modeli otomatik seçen akıllı yönlendirici — hepsi tek yerde.
          </p>
          <div className="mt-8 flex items-center justify-center gap-3">
            <button
              onClick={() => setAuthMode("register")}
              className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-fuchsia-600 px-7 py-3 text-[14px] font-semibold text-white shadow-xl shadow-violet-900/50 transition hover:from-violet-500 hover:to-fuchsia-500 active:scale-[0.97]"
            >
              <UserPlus size={16} />
              Ücretsiz Başla
            </button>
            <button
              onClick={() => setAuthMode("login")}
              className="flex items-center gap-2 rounded-xl border border-zinc-700 px-7 py-3 text-[14px] font-medium text-zinc-300 transition hover:border-violet-500/60 hover:text-violet-300"
            >
              <Play size={15} />
              Canlı Demo
            </button>
          </div>
          <p className="mt-4 text-[12px] text-zinc-600">
            Kayıt gerektirmez mi? Hayır — tüm özellikler için ücretsiz hesap yeterli.
          </p>
        </div>
      </section>

      {/* Özellikler */}
      <section className="mx-auto max-w-5xl px-6 pb-20">
        <h2 className="mb-8 text-center text-2xl font-bold text-zinc-100">
          Neden <span className="text-violet-400">ZelixVary</span>?
        </h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((f) => (
            <div
              key={f.title}
              className="group rounded-2xl border border-zinc-800 bg-[#131318] p-5 transition hover:border-violet-500/40 hover:bg-[#181821]"
            >
              <div
                className={`mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-zinc-900 transition group-hover:scale-110 ${f.color}`}
              >
                {f.icon}
              </div>
              <h3 className="mb-1 text-[14.5px] font-semibold text-zinc-100">{f.title}</h3>
              <p className="text-[12.5px] leading-relaxed text-zinc-500">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Alt bar */}
      <footer className="border-t border-zinc-800/70 px-6 py-6">
        <div className="mx-auto flex max-w-5xl flex-col items-center justify-between gap-3 text-[12px] text-zinc-600 sm:flex-row">
          <div className="flex items-center gap-2">
            <Bot size={14} className="text-violet-500" />
            ZelixVary — Multi-AI Code Studio
          </div>
          <div className="flex items-center gap-4">
            <span>API anahtarların yalnızca tarayıcında saklanır 🔒</span>
            <span className="flex items-center gap-1.5">
              <Heart size={14} className="text-violet-500" /> ZelixYzlm group tarafından
            </span>
          </div>
        </div>
      </footer>

      {authMode && (
        <AuthModal
          mode={authMode}
          onClose={() => setAuthMode(null)}
          onSwitchMode={setAuthMode}
        />
      )}
    </div>
  );
}
