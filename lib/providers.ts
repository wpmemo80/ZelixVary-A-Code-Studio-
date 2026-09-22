import type { ProviderId } from "./types";

/** Model bazlı açıklama (TR/EN) — ayarlar panelinde modelin altında görünür */
export interface ModelInfo {
  tr: string;
  en: string;
}

export interface ProviderConfig {
  id: ProviderId;
  name: string;
  short: string;
  icon: string;
  color: string;
  description: string;
  descriptionEn?: string;
  models: string[];
  defaultModel: string;
  keyUrl: string;
  apiStyle: "google" | "openai" | "anthropic";
  modelInfo?: Record<string, ModelInfo>;
}

export const PROVIDERS: ProviderConfig[] = [
  {
    id: "gemini",
    name: "Google Gemini",
    short: "Gemini",
    icon: "✦",
    color: "#4285f4",
    description: "Hızlı UI üretimi ve görsel kodlama — ücretsiz modeller mevcut",
    descriptionEn: "Fast UI generation and visual coding — free models available",
    // Google AI Studio güncel liste — 1.5/2.0 sürümleri 404'e düştü
    // ("This model is no longer available").
    models: ["gemini-3.6-flash", "gemini-2.5-flash", "gemini-2.5-pro"],
    defaultModel: "gemini-3.6-flash",
    keyUrl: "https://aistudio.google.com/app/apikey",
    apiStyle: "google",
    modelInfo: {
      "gemini-3.6-flash": {
        tr: "Resmi önerilen varsayılan ve hızlı model",
        en: "Officially recommended default & fast model",
      },
      "gemini-2.5-flash": {
        tr: "Stabil alternatif",
        en: "Stable alternative",
      },
      "gemini-2.5-pro": {
        tr: "Karmaşık işlemler için",
        en: "For complex tasks",
      },
    },
  },
  {
    id: "deepseek",
    name: "DeepSeek",
    short: "DeepSeek",
    icon: "🐋",
    color: "#4d6bfe",
    description: "Kod analizi, mantık hataları ve refactoring",
    descriptionEn: "Code analysis, logic bugs and refactoring",
    models: ["deepseek-chat", "deepseek-reasoner"],
    defaultModel: "deepseek-chat",
    keyUrl: "https://platform.deepseek.com/api_keys",
    apiStyle: "openai",
  },
  {
    id: "grok",
    name: "Grok (xAI)",
    short: "Grok",
    icon: "🕶",
    color: "#a855f7",
    description: "Hızlı mantık yürütme ve genel kodlama",
    descriptionEn: "Fast reasoning and general coding",
    models: ["grok-4.6", "grok-4.5", "grok-4.3", "grok-3.5", "grok-3"],
    defaultModel: "grok-4.6",
    keyUrl: "https://console.x.ai",
    apiStyle: "openai",
  },
  {
    id: "openai",
    name: "OpenAI",
    short: "OpenAI",
    icon: "◉",
    color: "#10a37f",
    description: "GPT-4o / GPT-4o-mini — en popüler yapay zeka",
    descriptionEn: "GPT-4o / GPT-4o-mini — the most popular AI",
    models: ["gpt-4o", "gpt-4o-mini", "gpt-4.1", "gpt-4.1-mini", "o3-mini", "o4-mini"],
    defaultModel: "gpt-4o-mini",
    keyUrl: "https://platform.openai.com/api-keys",
    apiStyle: "openai",
  },
  {
    id: "claude",
    name: "Anthropic Claude",
    short: "Claude",
    icon: "🧠",
    color: "#d97706",
    description: "Uzun kod analizi, uzun bağlam ve mantıksal düşünme",
    descriptionEn: "Deep code analysis, long context and logical thinking",
    models: [
      "claude-sonnet-4-20250514",
      "claude-3-5-sonnet-20241022",
      "claude-3-5-haiku-20241022",
      "claude-3-opus-20240229",
    ],
    defaultModel: "claude-sonnet-4-20250514",
    keyUrl: "https://console.anthropic.com/settings/keys",
    apiStyle: "anthropic",
  },
  {
    id: "groq",
    name: "Groq Cloud",
    short: "Groq",
    icon: "⚡",
    color: "#f55036",
    description: "Ultra hızlı LPU inferansı — cömert ücretsiz kota, saniyelerde yanıt",
    descriptionEn: "Ultra-fast LPU inference — generous free tier, replies in seconds",
    // Uç nokta: https://api.groq.com/openai/v1/chat/completions (openai tarzı).
    // 2026-09 Groq resmi liste: llama-3.1-8b-instant & llama-3.3-70b-versatile
    // artık "Enterprise / Contact Sales" — developer anahtarlarıyla
    // 404 "no access" döner. deepseek-r1-distill-qwen-32b /
    // qwen-2.5-coder-32b listeden tamamen silindi.
    // Developer plan'da gerçekten çalışan modeller:
    models: ["openai/gpt-oss-120b", "openai/gpt-oss-20b", "qwen/qwen3.8-27b"],
    defaultModel: "openai/gpt-oss-120b",
    keyUrl: "https://console.groq.com/keys",
    apiStyle: "openai",
    modelInfo: {
      "openai/gpt-oss-120b": {
        tr: "OpenAI amiral gemisi — akıl yürütme + araç kullanımı (120B)",
        en: "OpenAI flagship — reasoning + tool use (120B)",
      },
      "openai/gpt-oss-20b": {
        tr: "Çok hızlı ve ucuz (~1000 token/sn)",
        en: "Very fast & cheap (~1000 tokens/sec)",
      },
      "qwen/qwen3.8-27b": {
        tr: "Önizleme — hızlı Qwen 3.8 modeli (~450 t/sn)",
        en: "Preview — fast Qwen 3.8 model (~450 t/s)",
      },
    },
  },
  {
    id: "cerebras",
    name: "Cerebras Inference",
    short: "Cerebras",
    icon: "🔶",
    color: "#f97316",
    description: "Wafer-seviye çiplerde aşırı hızlı inferans",
    descriptionEn: "Blazing-fast inference on wafer-scale chips",
    // Cerebras resmi katalog (2026-09): public endpoint'te SADECE 2 model var.
    // llama3.1-70b / llama3.1-8b silindi → 404 "Model does not exist" döner.
    models: ["gpt-oss-120b", "qwen-3.8-27b"],
    defaultModel: "gpt-oss-120b",
    keyUrl: "https://cloud.cerebras.ai/",
    apiStyle: "openai",
    modelInfo: {
      "gpt-oss-120b": {
        tr: "OpenAI amiral gemisi 120B — ~3000 token/sn inanılmaz hızlı",
        en: "OpenAI 120B flagship — blazing fast ~3000 tokens/sec",
      },
      "qwen-3.8-27b": {
        tr: "Hızlı Qwen 3.8 — ~1850 token/sn",
        en: "Fast Qwen 3.8 — ~1850 tokens/sec",
      },
    },
  },
  {
    id: "mistral",
    name: "Mistral AI",
    short: "Mistral",
    icon: "🌬️",
    color: "#fa520f",
    description: "Kodlama odaklı Avrupa modelleri — codestral ile hızlı üretim",
    descriptionEn: "Coding-focused European models — fast generation with codestral",
    models: ["codestral-latest", "mistral-small-latest"],
    defaultModel: "codestral-latest",
    keyUrl: "https://console.mistral.ai/api-keys",
    apiStyle: "openai",
    modelInfo: {
      "codestral-latest": {
        tr: "Kodlama projeleri için özel model",
        en: "Specialized model for coding projects",
      },
      "mistral-small-latest": {
        tr: "Genel hafif görevler için",
        en: "For general lightweight tasks",
      },
    },
  },
  {
    id: "openrouter",
    name: "OpenRouter",
    short: "OpenRouter",
    icon: "🌐",
    color: "#0ea5e9",
    description:
      "Tek API ile yüzlerce model — ücretsiz (:free) modeller dahil. Model isminde `:free` eki zorunlu!",
    descriptionEn:
      "Hundreds of models through one API — including free (:free) models. The `:free` suffix is required!",
    // Canlı /api/v1/models listesinden (2026-09): eski :free slug'ları
    // ("qwen-2.5-coder", "deepseek-r1", "llama-3.3-70b") tamamen kaldırıldı →
    // "unavailable for free" 404 döner. Güncel çalışan ücretsiz modeller:
    models: [
      "z-ai/glm-5.2:free",
      "qwen/qwen3.8-27b:free",
      "nvidia/nemotron-3-super-120b-a12b:free",
      "cohere/north-mini-code:free",
    ],
    defaultModel: "z-ai/glm-5.2:free",
    keyUrl: "https://openrouter.ai/keys",
    apiStyle: "openai",
    modelInfo: {
      "z-ai/glm-5.2:free": {
        tr: "Ücretsiz — kodlamada en güçlü modellerden (1M context)",
        en: "Free — one of the strongest free coding models (1M ctx)",
      },
      "qwen/qwen3.8-27b:free": {
        tr: "Ücretsiz — dengeli ve hızlı genel model",
        en: "Free — balanced & fast general model",
      },
      "nvidia/nemotron-3-super-120b-a12b:free": {
        tr: "Ücretsiz — 120B MoE güçlü akıl yürütme",
        en: "Free — powerful 120B MoE reasoning",
      },
      "cohere/north-mini-code:free": {
        tr: "Ücretsiz — kodlama odaklı mini model",
        en: "Free — code-focused mini model",
      },
    },
  },
];

export const AUTO_ROUTER_ID = "__auto__";

export function getProvider(id: ProviderId): ProviderConfig {
  return PROVIDERS.find((p) => p.id === id) ?? PROVIDERS[0];
}

export function providerBaseUrl(id: ProviderId): string {
  switch (id) {
    case "gemini":
      return "https://generativelanguage.googleapis.com/v1beta";
    case "deepseek":
      return "https://api.deepseek.com";
    case "grok":
      return "https://api.x.ai/v1";
    case "openai":
      return "https://api.openai.com/v1";
    case "claude":
      return "https://api.anthropic.com/v1";
    case "groq":
      return "https://api.groq.com/openai/v1";
    case "cerebras":
      return "https://api.cerebras.ai/v1";
    case "mistral":
      return "https://api.mistral.ai/v1";
    case "openrouter":
      return "https://openrouter.ai/api/v1";
  }
}
