"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { useLang } from "@/lib/language-context";
import LandingPage from "@/components/landing/LandingPage";
import ModeSelection from "@/components/landing/ModeSelection";
import AiSelectScreen from "@/components/settings/AiSelectScreen";
import Studio from "@/components/studio/Studio";
import UpdatePanel from "@/components/update/UpdatePanel";

export default function Home() {
  const { user, loading } = useAuth();
  const { t } = useLang();
  const [mode, setMode] = useState<"local" | "file" | null>(null);
  const [aiChosen, setAiChosen] = useState(false);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#0b0b0f]">
        <div className="text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-600 to-fuchsia-600 shadow-lg shadow-violet-900/40">
            <Loader2 size={26} className="animate-spin text-white" />
          </div>
          <p className="text-[13px] text-zinc-500">{t("studio.loading")}</p>
        </div>
      </div>
    );
  }

  // Giriş yapmadıysa landing page göster
  if (!user) {
    return (
      <>
        <LandingPage />
        <UpdatePanel />
      </>
    );
  }

  // Giriş yaptı ama mod seçmediyse seçim ekranı göster
  if (!mode) {
    return (
      <>
        <ModeSelection
          onSelect={(m) => {
            setMode(m);
            setAiChosen(false); // her mod seçiminde yapay zeka seçim ekranı gelsin
          }}
        />
        <UpdatePanel />
      </>
    );
  }

  // Mod seçildi ama yapay zeka seçilmediyse seçim ekranını göster
  if (!aiChosen) {
    return (
      <>
        <AiSelectScreen onDone={() => setAiChosen(true)} />
        <UpdatePanel />
      </>
    );
  }

  // Mod + yapay zeka seçildi — Studio'yu aç
  return (
    <>
      <Studio mode={mode} onBackToSelection={() => setMode(null)} />
      <UpdatePanel />
    </>
  );
}
