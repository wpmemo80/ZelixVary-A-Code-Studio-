import type { ProviderId, RouterDecision } from "../types";
import type { Lang } from "../i18n";
import { getProvider, PROVIDERS } from "../providers";

interface Rule {
  provider: ProviderId;
  keywords: string[];
}

const DEBUG_RULE: Rule = {
  provider: "deepseek",
  keywords: [
    "debug", "bug", "hatayı", "hata", "hatası", "çalışmıyor", "neden çalışmıyor",
    "düzelt", "fix", "error", "exception", "mantık hatası", "stack trace",
    "analyze", "analiz", "analiz et", "kod analizi", "incele", "yorumla",
    "refactor", "refactoring", "yeniden yaz", "temizle", "temiz kod", "clean code",
    "optimize", "optimizasyon", "performans", "yavaş", "kötü kod", "smell", "geliştir",
    // İngilizce istemler için de eşleşsin
    "analyze code", "find bugs", "fix this", "rewrite", "improve performance",
  ],
};

const UI_RULE: Rule = {
  provider: "gemini",
  keywords: [
    "ui", "ux", "interface", "arayüz", "tasarım", "design", "sayfa", "web sayfası",
    "html", "css", "görsel", "görünüm", "landing", "landing page", "buton", "butonlar",
    "renk", "renkleri", "renk paleti", "animasyon", "gradient", "layout", "düzen",
    "navbar", "menü", "menüsü", "form", "login", "giriş sayfası", "register",
    "responsive", "mobil uyumlu", "card", "kart", "hero", "banner", "slider",
    "arayüz tasarla", "ekran tasarla", "maket", "mockup", "dashboard tasarla",
    // İngilizce istemler için de eşleşsin
    "dashboard", "color palette", "design a page", "build a page", "landing hero",
  ],
};

function countScore(text: string, keywords: string[]): number {
  let score = 0;
  for (const kw of keywords) {
    if (text.includes(kw)) {
      // daha uzun anahtar kelimeler daha anlamli
      score += kw.length >= 6 ? 3 : 1;
    }
  }
  return score;
}

function pick(providerId: ProviderId, reason: string): RouterDecision {
  const cfg = getProvider(providerId);
  // localStorage'dan kaydedilmiş modeli kontrol et
  let model = cfg.defaultModel;
  try {
    const saved = localStorage.getItem(`zelixvary:model:${providerId}`);
    if (saved && cfg.models.includes(saved)) model = saved;
  } catch { /* yut */ }
  return { provider: providerId, model, reason };
}

/**
 * ZelixVary Smart Router:
 * Prompt'u analiz edip kullanilabilir saglayicilar arasindan en uygun modeli secer.
 * - Kod analizi / debug / refactor  -> DeepSeek
 * - Hizli UI / HTML / CSS tasarimi  -> Gemini
 * - Genel sohbet / algoritma        -> Grok -> OpenAI -> DeepSeek -> Gemini
 * Yönlendirme gerekçesi seçili dile göre üretilir (TR/EN).
 */
export function smartRoute(
  prompt: string,
  available: ProviderId[],
  lang: Lang = "tr",
): RouterDecision {
  /** Gerekçe metnini seçili dile göre üretir. */
  const R = (tr: string, en: string) => (lang === "en" ? en : tr);

  const lower = prompt.toLowerCase();
  const debugScore = countScore(lower, DEBUG_RULE.keywords);
  const uiScore = countScore(lower, UI_RULE.keywords);

  if (debugScore > 0 && debugScore >= uiScore) {
    if (available.includes("deepseek")) {
      return pick(
        "deepseek",
        R(
          `İstem kod analizi/debug ağırlıklı (${debugScore} puan) → DeepSeek seçildi`,
          `Prompt looks code-analysis/debug-heavy (${debugScore} pts) → DeepSeek selected`,
        ),
      );
    }
  }

  if (uiScore > 0 && uiScore >= debugScore) {
    if (available.includes("gemini")) {
      return pick(
        "gemini",
        R(
          `İstem UI/tasarım ağırlıklı (${uiScore} puan) → Gemini seçildi`,
          `Prompt looks UI/design-heavy (${uiScore} pts) → Gemini selected`,
        ),
      );
    }
  }

  const generalOrder: ProviderId[] = [
    "grok",
    "openai",
    "claude",
    "deepseek",
    "gemini",
    "mistral",
    "groq",
    "cerebras",
    "openrouter",
  ];
  for (const id of generalOrder) {
    if (available.includes(id)) {
      const name = getProvider(id).short;
      return pick(
        id,
        R(
          `Genel amaçlı istem → ${name} seçildi (Smart Router)`,
          `General prompt → ${name} selected (Smart Router)`,
        ),
      );
    }
  }

  const fallback = PROVIDERS.find((p) => available.includes(p.id));
  if (fallback) {
    return {
      provider: fallback.id,
      model: fallback.defaultModel,
      reason: R("Fallback sağlayıcı kullanıldı", "Fallback provider used"),
    };
  }

  return {
    provider: "grok",
    model: "grok-4.6",
    reason: R("Anahtar bulunamadı", "No API key found"),
  };
}
