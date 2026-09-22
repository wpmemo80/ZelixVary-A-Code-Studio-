"use client";

import { useState } from "react";
import {
  Bot,
  Check,
  ExternalLink,
  Eye,
  EyeOff,
  KeyRound,
  Search,
  Star,
  X,
} from "lucide-react";
import type { ApiKeys, ProviderId } from "@/lib/types";
import { PROVIDERS, type ProviderConfig } from "@/lib/providers";
import { useLang } from "@/lib/language-context";

interface SettingsModalProps {
  keys: ApiKeys;
  onClose: () => void;
  onSave: (keys: ApiKeys) => void;
  /**
   * settings = klasik API ayarları paneli (varsayılan)
   * select   = mod seçiminden sonra gelen yapay zeka seçim ekranı
   *             (X yok, arka plana tıkla kapanmaz, footer'da "Başla" var)
   */
  variant?: "settings" | "select";
}

const FAVORITES_KEY = "zelixvary:favorites";

/** localStorage'dan kaydedilmiş modeli oku — artık yalnızca sağlayıcının
 *  aktif modelleri arasından kabul eder (kaldırılmış/decommissioned modeller
 *  defaultModel'e düşer). */
function getSavedModel(providerId: string, defaultModel: string, validModels: string[]): string {
  try {
    const saved = localStorage.getItem(`zelixvary:model:${providerId}`);
    if (saved && validModels.includes(saved)) return saved;
  } catch { /* yut */ }
  return defaultModel;
}

/** localStorage'dan favori model listesini oku ("providerId:model") */
function loadFavorites(): string[] {
  try {
    const raw = localStorage.getItem(FAVORITES_KEY);
    if (raw) {
      const parsed: unknown = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        return parsed.filter((x): x is string => typeof x === "string");
      }
    }
  } catch { /* yut */ }
  return [];
}

/** Tek bir model çipi: model adı + açıklama + seçim + ★ favori */
function ModelChip({
  providerId,
  model,
  info,
  selected,
  faved,
  onSelect,
  onToggleFav,
}: {
  providerId: string;
  model: string;
  info?: string;
  selected: boolean;
  faved: boolean;
  onSelect: () => void;
  onToggleFav: () => void;
}) {
  const { t } = useLang();
  return (
    <div
      className={`group flex items-stretch overflow-hidden rounded-md border transition ${
        selected
          ? "border-violet-500/70 bg-violet-600/20"
          : "border-zinc-800 bg-[#101013] hover:border-zinc-600"
      }`}
    >
      <button
        type="button"
        onClick={onSelect}
        title={model}
        className="min-w-0 flex-1 px-2.5 py-1.5 text-left"
      >
        <span className="flex items-center gap-1">
          <span
            className={`truncate font-mono text-[11.5px] ${
              selected ? "text-violet-200" : "text-zinc-300"
            }`}
          >
            {model}
          </span>
          {selected && <Check size={11} className="shrink-0 text-violet-400" />}
        </span>
        {info && (
          <span className="mt-0.5 block text-[10px] leading-snug text-zinc-500">{info}</span>
        )}
      </button>
      <button
        type="button"
        onClick={onToggleFav}
        title={faved ? t("settings.removeFav") : t("settings.addFav")}
        aria-label={faved ? t("settings.removeFav") : t("settings.addFav")}
        className="flex w-7 shrink-0 items-center justify-center border-l border-zinc-800 transition hover:bg-zinc-800/60"
      >
        <Star
          size={12}
          className={faved ? "fill-amber-400 text-amber-400" : "text-zinc-600 group-hover:text-zinc-400"}
        />
      </button>
    </div>
  );
}

export default function SettingsModal({
  keys,
  onClose,
  onSave,
  variant = "settings",
}: SettingsModalProps) {
  const isSelect = variant === "select";
  const [draft, setDraft] = useState<ApiKeys>(keys);
  const [visible, setVisible] = useState<Partial<Record<ProviderId, boolean>>>({});
  const [saved, setSaved] = useState(false);
  const { t, lang } = useLang();
  const [selectedModels, setSelectedModels] = useState<Partial<Record<ProviderId, string>>>(() => {
    // Başlangıçta localStorage'dan kaydedilmiş modelleri yükle
    const initial: Partial<Record<ProviderId, string>> = {};
    for (const p of PROVIDERS) {
      initial[p.id] = getSavedModel(p.id, p.defaultModel, p.models);
    }
    return initial;
  });
  const [query, setQuery] = useState("");
  const [favorites, setFavorites] = useState<string[]>(() => loadFavorites());

  const isFav = (providerId: string, model: string) =>
    favorites.includes(`${providerId}:${model}`);

  function toggleFav(providerId: string, model: string) {
    setFavorites((prev) => {
      const key = `${providerId}:${model}`;
      const next = prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key];
      try {
        localStorage.setItem(FAVORITES_KEY, JSON.stringify(next));
      } catch { /* yut */ }
      return next;
    });
  }

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

  /** Favorilere göre sırala (favoriler önce) */
  function sortModels(providerId: string, models: string[]): string[] {
    return [...models].sort(
      (a, b) => Number(isFav(providerId, b)) - Number(isFav(providerId, a)),
    );
  }

  // ── Arama filtresi (sağlayıcı adı, açıklama, model adı, model açıklaması) ──
  const q = query.trim().toLowerCase();
  const matches: Array<{ provider: ProviderConfig; models: string[] }> = [];
  for (const p of PROVIDERS) {
    if (!q) {
      matches.push({ provider: p, models: sortModels(p.id, p.models) });
      continue;
    }
    const haystack =
      `${p.name} ${p.short} ${p.description} ${p.descriptionEn ?? ""}`.toLowerCase();
    if (haystack.includes(q)) {
      matches.push({ provider: p, models: sortModels(p.id, p.models) });
      continue;
    }
    const modelHits = p.models.filter((m) => {
      if (m.toLowerCase().includes(q)) return true;
      const info = p.modelInfo?.[m];
      return !!info && (info.tr.toLowerCase().includes(q) || info.en.toLowerCase().includes(q));
    });
    if (modelHits.length > 0) {
      matches.push({ provider: p, models: sortModels(p.id, modelHits) });
    }
  }

  // ── Favori girdileri (sağlayıcı + model eşleşmesi zorunlu) ──
  const favoriteEntries = favorites
    .map((k) => {
      const idx = k.indexOf(":");
      if (idx < 0) return null;
      const pid = k.slice(0, idx);
      const model = k.slice(idx + 1);
      const provider = PROVIDERS.find((x) => x.id === pid);
      if (!provider || !provider.models.includes(model)) return null;
      return { provider, model };
    })
    .filter((x): x is { provider: ProviderConfig; model: string } => x !== null);

  const showFavorites = !q && favoriteEntries.length > 0;

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-sm ${
        isSelect ? "bg-[#0b0b0f]" : "bg-black/70"
      }`}
      onClick={isSelect ? undefined : onClose}
    >
      <div
        className={`relative w-full overflow-hidden rounded-xl border border-zinc-700 bg-[#1c1c1f] shadow-2xl ${
          isSelect ? "max-w-5xl" : "max-w-4xl"
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* ── Başlık ── */}
        <div className="flex items-start justify-between gap-3 border-b border-zinc-800 bg-[#232328] px-4 py-3">
          <div className="flex items-start gap-2.5">
            <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-violet-500/15 text-violet-400">
              {isSelect ? <Bot size={16} /> : <KeyRound size={16} />}
            </span>
            <div className="min-w-0">
              <h2 className="text-sm font-semibold text-zinc-100">
                {isSelect ? t("select.title") : t("settings.title")}
              </h2>
              {isSelect && (
                <p className="mt-0.5 max-w-3xl text-[11.5px] leading-relaxed text-zinc-500">
                  {t("select.subtitle")}
                </p>
              )}
            </div>
          </div>
          {!isSelect && (
            <button
              onClick={onClose}
              className="flex h-7 w-7 shrink-0 items-center justify-center rounded text-zinc-400 transition hover:bg-zinc-700/50 hover:text-zinc-100"
            >
              <X size={15} />
            </button>
          )}
        </div>

        {/* ── Arama çubuğu ── */}
        <div className="border-b border-zinc-800 bg-[#1f1f24] px-4 py-2.5">
          <div className="flex items-center gap-2 rounded-lg border border-zinc-700 bg-[#101013] px-3 py-2 transition focus-within:border-violet-500">
            <Search size={14} className="shrink-0 text-zinc-500" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={t("settings.search")}
              className="min-w-0 flex-1 bg-transparent text-[13px] text-zinc-100 placeholder-zinc-600 outline-none"
              spellCheck={false}
              autoComplete="off"
            />
            {query && (
              <button
                onClick={() => setQuery("")}
                className="flex h-5 w-5 shrink-0 items-center justify-center rounded text-zinc-500 transition hover:bg-zinc-800 hover:text-zinc-200"
                title="X"
              >
                <X size={12} />
              </button>
            )}
          </div>
        </div>

        {/* ── Gövde ── */}
        <div className="max-h-[62vh] space-y-3 overflow-y-auto p-4">
          {saved && (
            <div className="flex items-center gap-2 rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-3 py-2 text-[13px] text-emerald-300">
              <Check size={14} /> {t("settings.saved")}
            </div>
          )}

          {/* ── Favoriler ── */}
          {showFavorites && (
            <div className="rounded-lg border border-amber-500/25 bg-amber-500/[0.04] p-3">
              <div className="mb-2 flex items-center justify-between">
                <p className="text-[11.5px] font-semibold uppercase tracking-wider text-amber-400/90">
                  {t("settings.favorites")}
                </p>
                <p className="text-[10.5px] text-zinc-600">
                  {favoriteEntries.length} {t("settings.favCount")}
                </p>
              </div>
              <div className="grid grid-cols-1 gap-1.5 sm:grid-cols-2">
                {favoriteEntries.map(({ provider, model }) => (
                  <ModelChip
                    key={`${provider.id}:${model}`}
                    providerId={provider.id}
                    model={model}
                    info={provider.modelInfo?.[model]?.[lang]}
                    selected={(selectedModels[provider.id] ?? provider.defaultModel) === model}
                    faved
                    onSelect={() =>
                      setSelectedModels((prev) => ({ ...prev, [provider.id]: model }))
                    }
                    onToggleFav={() => toggleFav(provider.id, model)}
                  />
                ))}
              </div>
            </div>
          )}

          {/* ── Sağlayıcılar ── */}
          {matches.map(({ provider: p, models }) => {
            const isVisible = visible[p.id];
            const keyStatus = getApiKeyStatus(p.id);
            const currentModel = selectedModels[p.id] ?? p.defaultModel;
            const description = lang === "en" && p.descriptionEn ? p.descriptionEn : p.description;
            const favCount = p.models.filter((m) => isFav(p.id, m)).length;

            return (
              <div
                key={p.id}
                className={`rounded-lg border bg-[#18181b] p-3 transition ${
                  keyStatus === "has-key" ? "border-emerald-600/40" : "border-zinc-800"
                }`}
              >
                {/* Başlık */}
                <div className="mb-2 flex items-center gap-2">
                  <span
                    className="flex h-6 w-6 shrink-0 items-center justify-center rounded text-[12px]"
                    style={{ backgroundColor: `${p.color}22`, color: p.color }}
                  >
                    {p.icon}
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="text-[13px] font-semibold text-zinc-100">{p.name}</p>
                      {keyStatus === "has-key" && (
                        <span className="rounded-full bg-emerald-500/20 px-1.5 py-0.5 text-[9px] font-bold text-emerald-400">
                          {t("settings.active")}
                        </span>
                      )}
                      {favCount > 0 && (
                        <span className="flex items-center gap-0.5 rounded-full bg-amber-500/15 px-1.5 py-0.5 text-[9px] font-bold text-amber-400">
                          ★ {favCount}
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-zinc-500">{description}</p>
                  </div>
                  <a
                    href={p.keyUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="flex shrink-0 items-center gap-1 rounded px-2 py-1 text-[11px] text-violet-300 transition hover:bg-violet-500/10 hover:text-violet-200"
                  >
                    {t("settings.getKey")} <ExternalLink size={10} />
                  </a>
                </div>

                {/* API Key Input */}
                <div className="flex items-center gap-2">
                  <input
                    type={isVisible ? "text" : "password"}
                    value={draft[p.id] ?? ""}
                    onChange={(e) => setDraft((d) => ({ ...d, [p.id]: e.target.value }))}
                    placeholder={`${p.name} ${t("settings.keyPh")}`}
                    className="min-w-0 flex-1 rounded-md border border-zinc-700 bg-[#101013] px-3 py-1.5 text-[12.5px] font-mono text-zinc-100 placeholder-zinc-600 outline-none transition focus:border-violet-500"
                    spellCheck={false}
                    autoComplete="off"
                  />
                  <button
                    onClick={() => setVisible((v) => ({ ...v, [p.id]: !v[p.id] }))}
                    className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md border border-zinc-700 text-zinc-400 transition hover:bg-zinc-700/40 hover:text-zinc-100"
                    title={isVisible ? t("settings.hideKey") : t("settings.showKey")}
                  >
                    {isVisible ? <EyeOff size={14} /> : <Eye size={14} />}
                  </button>
                </div>

                {keyStatus === "has-key" && (
                  <p className="mt-1.5 text-[10px] text-emerald-500/70">
                    {t("settings.keySaved")}
                  </p>
                )}

                {/* ── Modeller: 2'li grid ── */}
                <div className="mt-2.5 flex items-center justify-between">
                  <p className="text-[11px] font-semibold uppercase tracking-wider text-zinc-500">
                    {t("settings.models")} ({models.length})
                  </p>
                  <p className="truncate text-[10.5px] text-zinc-600">
                    {t("settings.modelLabel")}{" "}
                    <span className="font-mono text-zinc-400">{currentModel}</span>
                  </p>
                </div>
                <div className="mt-1.5 grid grid-cols-1 gap-1.5 sm:grid-cols-2">
                  {models.map((model) => (
                    <ModelChip
                      key={model}
                      providerId={p.id}
                      model={model}
                      info={p.modelInfo?.[model]?.[lang]}
                      selected={currentModel === model}
                      faved={isFav(p.id, model)}
                      onSelect={() =>
                        setSelectedModels((prev) => ({ ...prev, [p.id]: model }))
                      }
                      onToggleFav={() => toggleFav(p.id, model)}
                    />
                  ))}
                </div>
              </div>
            );
          })}

          {/* ── Arama boş durumu ── */}
          {matches.length === 0 && (
            <div className="rounded-lg border border-dashed border-zinc-700 p-8 text-center">
              <p className="text-[13.5px] font-medium text-zinc-400">{t("settings.noResults")}</p>
              <p className="mt-1 text-[12px] text-zinc-600">{t("settings.noResultsHint")}</p>
            </div>
          )}

          <p className="px-1 text-[11px] leading-relaxed text-zinc-500">
            {t("settings.privacyNote")}
          </p>
        </div>

        {/* ── Alt bar ── */}
        <div className="flex items-center justify-between gap-3 border-t border-zinc-800 bg-[#232328] px-4 py-3">
          <p className="hidden text-[11px] leading-relaxed text-zinc-600 md:block">
            {isSelect ? t("select.changeHint") : ""}
          </p>
          <div className="ml-auto flex items-center gap-2">
            {isSelect ? (
              <>
                <button
                  onClick={onClose}
                  className="rounded-lg px-4 py-1.5 text-[13px] text-zinc-400 transition hover:bg-zinc-700/40 hover:text-zinc-200"
                >
                  {t("select.skip")}
                </button>
                <button
                  onClick={handleSave}
                  className="flex items-center gap-1.5 rounded-lg bg-gradient-to-r from-violet-600 to-fuchsia-600 px-5 py-1.5 text-[13px] font-semibold text-white shadow-lg shadow-violet-900/40 transition hover:from-violet-500 hover:to-fuchsia-500 active:scale-95"
                >
                  🚀 {t("select.continue")}
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={onClose}
                  className="rounded-lg px-4 py-1.5 text-[13px] text-zinc-300 transition hover:bg-zinc-700/40"
                >
                  {t("settings.cancel")}
                </button>
                <button
                  onClick={handleSave}
                  className="flex items-center gap-1.5 rounded-lg bg-violet-600 px-4 py-1.5 text-[13px] font-medium text-white transition hover:bg-violet-500 active:scale-95"
                >
                  {saved ? <Check size={14} /> : <KeyRound size={14} />}
                  {saved ? t("settings.saved2") : t("settings.save")}
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
