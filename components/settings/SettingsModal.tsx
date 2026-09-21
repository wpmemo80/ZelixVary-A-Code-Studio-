"use client";

import { useEffect, useState } from "react";
import { Check, ChevronDown, ExternalLink, Eye, EyeOff, KeyRound, X } from "lucide-react";
import type { ApiKeys, ProviderId } from "@/lib/types";
import { PROVIDERS } from "@/lib/providers";

interface SettingsModalProps {
  keys: ApiKeys;
  onClose: () => void;
  onSave: (keys: ApiKeys) => void;
}

/** localStorage'dan kaydedilmiş modeli oku */
function getSavedModel(providerId: string, defaultModel: string): string {
  try {
    const saved = localStorage.getItem(`zelixvary:model:${providerId}`);
    if (saved) return saved;
  } catch { /* yut */ }
  return defaultModel;
}

export default function SettingsModal({ keys, onClose, onSave }: SettingsModalProps) {
  const [draft, setDraft] = useState<ApiKeys>(keys);
  const [visible, setVisible] = useState<Partial<Record<ProviderId, boolean>>>({});
  const [saved, setSaved] = useState(false);
  const [selectedModels, setSelectedModels] = useState<Partial<Record<ProviderId, string>>>(() => {
    // Başlangıçta localStorage'dan kaydedilmiş modelleri yükle
    const initial: Partial<Record<ProviderId, string>> = {};
    for (const p of PROVIDERS) {
      initial[p.id] = getSavedModel(p.id, p.defaultModel);
    }
    return initial;
  });
  const [expandedProvider, setExpandedProvider] = useState<ProviderId | null>(null);

  function handleSave() {
    // Seçili modelleri localStorage'a kaydet
    for (const [id, model] of Object.entries(selectedModels)) {
      if (model) {
        try {
          localStorage.setItem(`zelixvary:model:${id}`, model);
        } catch { /* yut */ }
      }
    }
    onSave(draft);
    setSaved(true);
    setTimeout(onClose, 500);
  }

  function getApiKeyStatus(p: ProviderId): "none" | "has-key" {
    return draft[p]?.trim() ? "has-key" : "none";
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
            <h2 className="text-sm font-semibold text-zinc-100">ZelixVary AI Hub — API Anahtarları & Modeller</h2>
          </div>
          <button
            onClick={onClose}
            className="flex h-7 w-7 items-center justify-center rounded text-zinc-400 transition hover:bg-zinc-700/50 hover:text-zinc-100"
          >
            <X size={15} />
          </button>
        </div>

        <div className="max-h-[65vh] space-y-3 overflow-y-auto p-4">
          {saved && (
            <div className="flex items-center gap-2 rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-3 py-2 text-[13px] text-emerald-300">
              <Check size={14} /> Anahtarlar ve modeller kaydedildi.
            </div>
          )}

          {PROVIDERS.map((p) => {
            const isVisible = visible[p.id];
            const isExpanded = expandedProvider === p.id;
            const keyStatus = getApiKeyStatus(p.id);
            const currentModel = selectedModels[p.id] ?? p.defaultModel;

            return (
              <div
                key={p.id}
                className={`rounded-lg border bg-[#18181b] p-3 transition ${
                  keyStatus === "has-key"
                    ? "border-emerald-600/40"
                    : "border-zinc-800"
                }`}
              >
                {/* Başlık */}
                <div className="mb-2 flex items-center gap-2">
                  <span
                    className="flex h-6 w-6 items-center justify-center rounded text-[12px]"
                    style={{ backgroundColor: `${p.color}22`, color: p.color }}
                  >
                    {p.icon}
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <p className="text-[13px] font-semibold text-zinc-100">{p.name}</p>
                      {keyStatus === "has-key" && (
                        <span className="rounded-full bg-emerald-500/20 px-1.5 py-0.5 text-[9px] font-bold text-emerald-400">
                          AKTİF
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-zinc-500">{p.description}</p>
                  </div>
                  <a
                    href={p.keyUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="flex shrink-0 items-center gap-1 rounded px-2 py-1 text-[11px] text-violet-300 transition hover:bg-violet-500/10 hover:text-violet-200"
                  >
                    Anahtar al <ExternalLink size={10} />
                  </a>
                </div>

                {/* API Key Input */}
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

                {/* Model Seçimi */}
                <div className="mt-2">
                  <button
                    onClick={() => setExpandedProvider(isExpanded ? null : p.id)}
                    className="flex w-full items-center justify-between rounded-md border border-zinc-700 bg-[#101013] px-3 py-1.5 text-[12px] text-zinc-300 transition hover:border-violet-500/50"
                  >
                    <span className="flex items-center gap-1.5">
                      <span className="text-zinc-500">Model:</span>
                      <span className="font-medium text-zinc-200">{currentModel}</span>
                    </span>
                    <ChevronDown
                      size={14}
                      className={`text-zinc-500 transition-transform ${isExpanded ? "rotate-180" : ""}`}
                    />
                  </button>

                  {isExpanded && (
                    <div className="mt-1 max-h-40 space-y-0.5 overflow-y-auto rounded-md border border-zinc-800 bg-[#101013] p-1">
                      {p.models.map((model) => (
                        <button
                          key={model}
                          onClick={() => {
                            setSelectedModels((prev) => ({ ...prev, [p.id]: model }));
                            setExpandedProvider(null);
                          }}
                          className={`flex w-full items-center justify-between rounded px-2.5 py-1.5 text-left text-[12px] transition ${
                            currentModel === model
                              ? "bg-violet-600/20 text-violet-300"
                              : "text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200"
                          }`}
                        >
                          <span className="font-mono text-[11.5px]">{model}</span>
                          {currentModel === model && (
                            <Check size={12} className="text-violet-400" />
                          )}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {keyStatus === "has-key" && (
                  <p className="mt-1.5 text-[10px] text-emerald-500/70">
                    ✅ API anahtarı girildi
                  </p>
                )}
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
