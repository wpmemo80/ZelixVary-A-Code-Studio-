"use client";

import { useState } from "react";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  updateProfile,
} from "firebase/auth";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import { Loader2, Lock, Mail, User as UserIcon, X, Zap, FolderOpen, MessagesSquare } from "lucide-react";
import { getFirebase } from "@/lib/firebase/client";

export type AuthMode = "login" | "register";

interface AuthModalProps {
  mode: AuthMode;
  onClose: () => void;
  onSwitchMode: (mode: AuthMode) => void;
}

export default function AuthModal({ mode, onClose, onSwitchMode }: AuthModalProps) {
  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const isRegister = mode === "register";

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (busy) return;
    setError(null);

    if (!email.trim() || password.length < 6) {
      setError("E-posta gerekli ve şifre en az 6 karakter olmalı.");
      return;
    }
    if (isRegister && !displayName.trim()) {
      setError("İsim alanı zorunludur.");
      return;
    }

    setBusy(true);
    try {
      const { auth, db } = getFirebase();
      if (isRegister) {
        const cred = await createUserWithEmailAndPassword(auth, email.trim(), password);
        if (displayName.trim()) {
          await updateProfile(cred.user, { displayName: displayName.trim() });
        }
        await setDoc(
          doc(db, "users", cred.user.uid),
          {
            displayName: displayName.trim() || "ZelixVary Kullanıcısı",
            email: email.trim(),
            createdAt: serverTimestamp(),
          },
          { merge: true },
        );
      } else {
        await signInWithEmailAndPassword(auth, email.trim(), password);
      }
      onClose();
    } catch (err) {
      const code = (err as { code?: string }).code;
      const messages: Record<string, string> = {
        "auth/email-already-in-use": "Bu e-posta zaten kayıtlı. Giriş yapmayı dene.",
        "auth/invalid-email": "Geçersiz e-posta adresi.",
        "auth/weak-password": "Şifre çok zayıf (en az 6 karakter).",
        "auth/user-not-found": "Bu e-posta ile hesap bulunamadı.",
        "auth/wrong-password": "Şifre hatalı.",
        "auth/invalid-credential": "E-posta veya şifre hatalı.",
        "auth/too-many-requests": "Çok fazla deneme yapıldı. Biraz sonra tekrar dene.",
        "auth/network-request-failed": "Ağ hatası. İnternet bağlantını kontrol et.",
      };
      setError(messages[code ?? ""] ?? (err instanceof Error ? err.message : "Bilinmeyen hata"));
    } finally {
      setBusy(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md overflow-hidden rounded-2xl border border-zinc-700/80 bg-[#15151a] shadow-2xl shadow-violet-950/40"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="relative bg-gradient-to-br from-violet-600/20 via-transparent to-fuchsia-600/10 px-6 pt-6 pb-4">
          <button
            onClick={onClose}
            className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-lg text-zinc-400 transition hover:bg-zinc-800 hover:text-zinc-100"
          >
            <X size={16} />
          </button>

          <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-violet-600 to-fuchsia-600 shadow-lg shadow-violet-900/50">
            {isRegister ? <Zap size={22} className="text-white" /> : <Lock size={20} className="text-white" />}
          </div>
          <h2 className="text-xl font-bold text-zinc-100">
            {isRegister ? "ZelixVary'ye Katıl" : "Tekrar Hoş Geldin"}
          </h2>
          <p className="mt-1 text-[13px] text-zinc-400">
            {isRegister
              ? "Hesabını oluştur, projelerin ve AI sohbet geçmişlerin bulutta güvende kalsın."
              : "Projelerine ve sohbet geçmişine kaldığın yerden devam et."}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3 px-6 py-5">
          {isRegister && (
            <div className="group">
              <label className="mb-1.5 block text-[12px] font-medium text-zinc-400">İsim</label>
              <div className="flex items-center gap-2 rounded-xl border border-zinc-700 bg-[#101013] px-3 py-2.5 transition focus-within:border-violet-500">
                <UserIcon size={15} className="shrink-0 text-zinc-500" />
                <input
                  type="text"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="Adın"
                  className="min-w-0 flex-1 bg-transparent text-[13.5px] text-zinc-100 placeholder-zinc-600 outline-none"
                  autoComplete="name"
                />
              </div>
            </div>
          )}

          <div>
            <label className="mb-1.5 block text-[12px] font-medium text-zinc-400">E-posta</label>
            <div className="flex items-center gap-2 rounded-xl border border-zinc-700 bg-[#101013] px-3 py-2.5 transition focus-within:border-violet-500">
              <Mail size={15} className="shrink-0 text-zinc-500" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="ornek@email.com"
                className="min-w-0 flex-1 bg-transparent text-[13.5px] text-zinc-100 placeholder-zinc-600 outline-none"
                autoComplete="email"
              />
            </div>
          </div>

          <div>
            <label className="mb-1.5 block text-[12px] font-medium text-zinc-400">Şifre</label>
            <div className="flex items-center gap-2 rounded-xl border border-zinc-700 bg-[#101013] px-3 py-2.5 transition focus-within:border-violet-500">
              <Lock size={15} className="shrink-0 text-zinc-500" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="min-w-0 flex-1 bg-transparent text-[13.5px] text-zinc-100 placeholder-zinc-600 outline-none"
                autoComplete={isRegister ? "new-password" : "current-password"}
              />
            </div>
          </div>

          {error && (
            <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-3 py-2 text-[12.5px] text-red-300">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={busy}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-fuchsia-600 py-2.5 text-[14px] font-semibold text-white shadow-lg shadow-violet-900/40 transition hover:from-violet-500 hover:to-fuchsia-500 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {busy ? (
              <>
                <Loader2 size={15} className="animate-spin" />
                {isRegister ? "Hesap oluşturuluyor..." : "Giriş yapılıyor..."}
              </>
            ) : isRegister ? (
              "Hesap Oluştur"
            ) : (
              "Giriş Yap"
            )}
          </button>

          <p className="pt-1 text-center text-[12.5px] text-zinc-500">
            {isRegister ? "Zaten hesabın var mı?" : "Hesabın yok mu?"}{" "}
            <button
              type="button"
              onClick={() => onSwitchMode(isRegister ? "login" : "register")}
              className="font-semibold text-violet-400 transition hover:text-violet-300"
            >
              {isRegister ? "Giriş Yap" : "Hemen Kayıt Ol"}
            </button>
          </p>
        </form>

        {isRegister && (
          <div className="flex items-center justify-center gap-4 border-t border-zinc-800/70 bg-[#111116] px-6 py-3 text-[11px] text-zinc-500">
            <span className="flex items-center gap-1">
              <FolderOpen size={12} className="text-violet-400" /> Bulut projeler
            </span>
            <span className="flex items-center gap-1">
              <MessagesSquare size={12} className="text-violet-400" /> AI geçmişi
            </span>
            <span className="flex items-center gap-1">
              <Zap size={12} className="text-violet-400" /> Hızlı giriş
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
