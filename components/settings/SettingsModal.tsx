"use client";

import { useState } from "react";
import { Check, ExternalLink, Eye, EyeOff, KeyRound, X } from "lucide-react";
import type { ApiKeys, ProviderId } from "@/lib/types";
import { PROVIDERS } from "@/lib/providers";

interface SettingsModalProps {
  keys: ApiKeys;
  onClose: () => void;
  onSave: (keys: ApiKeys) => void;
}

export default function SettingsModal({ keys, onClose, onSave }: SettingsModalProps) {
  const [draft, setDraft] = useState<ApiKeys>(keys);
  const [visible, setVisible] = useState<Partial<Record<ProviderId, boolean>>>({});
  const [saved, setSaved] = useState(false);

  function handleSave() {
    onSave(draft);
    setSaved(true);
    setTimeout(onClose, 500);
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="w-full max-w-xl overflow-hidden rounded-xl border border-zinc-700 bg-[#1c1c1f] shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-zinc-800 bg-[#232328] px-4 py-3">
          <div className="flex items-center gap-2">
            <KeyRound size={16} className="text-violet-400" />
            <h2 className="text-sm font-semibold text-zinc-100">ZelixVary AI Hub — API Anahtarları</h2>
          </div>
          <button
            onClick={onClose}
            className="flex h-7 w-7 items-center justify-center rounded text-zinc-400 transition hover:bg-zinc-700/50 hover:text-zinc-100"
          >
            <X size={15} />
          </button>
        </div>

        <div className="max-h-[60vh] space-y-3 overflow-y-auto p-4">
          {saved && (
            <div className="flex items-center gap-2 rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-3 py-2 text-[13px] text-emerald-300">
              <Check size={14} /> Anahtarlar kaydedildi.
            </div>
          )}

          {PROVIDERS.map((p) => {
            const isVisible = visible[p.id];
            return (
              <div key={p.id} className="rounded-lg border border-zinc-800 bg-[#18181b] p-3">
                <div className="mb-2 flex items-center gap-2">
                  <span
                    className="flex h-6 w-6 items-center justify-center rounded text-[12px]"
                    style={{ backgroundColor: `${p.color}22`, color: p.color }}
                  >
                    {p.icon}
                  </span>
                  <div className="min-w-0">
                    <p className="text-[13px] font-semibold text-zinc-100">{p.name}</p>
                    <p className="text-[11px] text-zinc-500">{p.description}</p>
                  </div>
                  <a
                    href={p.keyUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="ml-auto flex shrink-0 items-center gap-1 rounded px-2 py-1 text-[11px] text-violet-300 transition hover:bg-violet-500/10 hover:text-violet-200"
                  >
                    Anahtar al <ExternalLink size={10} />
                  </a>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type={isVisible ? "text" : "password"}
                    value={draft[p.id] ?? ""}
                    onChange={(e) => setDraft((d) => ({ ...d, [p.id]: e.target.value }))}
                    placeholder={`${p.name} API anahtarı...`}
                    className="min-w-0 flex-1 rounded-md border border-zinc-700 bg-[#101013] px-3 py-1.5 text-[12.5px] font-mono text-zinc-100 placeholder-zinc-600 outline-none transition focus:border-violet-500"
                    spellCheck={false}
                    autoComplete="off"
                  />
                  <button
                    onClick={() => setVisible((v) => ({ ...v, [p.id]: !v[p.id] }))}
                    className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md border border-zinc-700 text-zinc-400 transition hover:bg-zinc-700/40 hover:text-zinc-100"
                    title={isVisible ? "Gizle" : "Göster"}
                  >
                    {isVisible ? <EyeOff size={14} /> : <Eye size={14} />}
                  </button>
                </div>
              </div>
            );
          })}

          <p className="px-1 text-[11px] leading-relaxed text-zinc-500">
            🔒 Anahtarlar yalnızca <code className="text-zinc-400">localStorage</code> içinde saklanır ve
            istekler ZelixVary proxy sunucusu üzerinden gönderilir; sunucuya asla kaydedilmez. Tarayıcınızı
            temizlerseniz anahtarlar silinir.
          </p>
        </div>

        <div className="flex items-center justify-end gap-2 border-t border-zinc-800 bg-[#232328] px-4 py-3">
          <button
            onClick={onClose}
            className="rounded-lg px-4 py-1.5 text-[13px] text-zinc-300 transition hover:bg-zinc-700/40"
          >
            İptal
          </button>
          <button
            onClick={handleSave}
            className="flex items-center gap-1.5 rounded-lg bg-violet-600 px-4 py-1.5 text-[13px] font-medium text-white transition hover:bg-violet-500 active:scale-95"
          >
            {saved ? <Check size={14} /> : <KeyRound size={14} />}
            {saved ? "Kaydedildi" : "Kaydet"}
          </button>
        </div>
      </div>
    </div>
  );
}
