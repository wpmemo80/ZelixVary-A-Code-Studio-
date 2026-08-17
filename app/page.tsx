"use client";

import { Loader2 } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import LandingPage from "@/components/landing/LandingPage";
import Studio from "@/components/studio/Studio";

export default function Home() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#0b0b0f]">
        <div className="text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-600 to-fuchsia-600 shadow-lg shadow-violet-900/40">
            <Loader2 size={26} className="animate-spin text-white" />
          </div>
          <p className="text-[13px] text-zinc-500">ZelixVary yükleniyor...</p>
        </div>
      </div>
    );
  }

  return user ? <Studio /> : <LandingPage />;
}
