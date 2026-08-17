import type { ProviderId, RouterDecision } from "../types";
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
  return { provider: providerId, model: cfg.defaultModel, reason };
}

/**
 * ZelixVary Smart Router:
 * Prompt'u analiz edip kullanilabilir saglayicilar arasindan en uygun modeli secer.
 * - Kod analizi / debug / refactor  -> DeepSeek
 * - Hizli UI / HTML / CSS tasarimi  -> Gemini
 * - Genel sohbet / algoritma        -> Grok -> OpenAI -> DeepSeek -> Gemini
 */
export function smartRoute(prompt: string, available: ProviderId[]): RouterDecision {
  const lower = prompt.toLowerCase();
  const debugScore = countScore(lower, DEBUG_RULE.keywords);
  const uiScore = countScore(lower, UI_RULE.keywords);

  if (debugScore > 0 && debugScore >= uiScore) {
    if (available.includes("deepseek")) {
      return pick("deepseek", `İstem kod analizi/debug ağırlıklı (${debugScore} puan) → DeepSeek seçildi`);
    }
  }

  if (uiScore > 0 && uiScore >= debugScore) {
    if (available.includes("gemini")) {
      return pick("gemini", `İstem UI/tasarım ağırlıklı (${uiScore} puan) → Gemini seçildi`);
    }
  }

  const generalOrder: ProviderId[] = ["grok", "openai", "deepseek", "gemini"];
  for (const id of generalOrder) {
    if (available.includes(id)) {
      const name = getProvider(id).short;
      return pick(id, `Genel amaçlı istem → ${name} seçildi (Smart Router)`);
    }
  }

  const fallback = PROVIDERS.find((p) => available.includes(p.id));
  if (fallback) {
    return { provider: fallback.id, model: fallback.defaultModel, reason: "Fallback sağlayıcı kullanıldı" };
  }

  return { provider: "grok", model: "grok-4.6", reason: "Anahtar bulunamadı" };
}
