import type { ProviderId } from "./types";

export interface ProviderConfig {
  id: ProviderId;
  name: string;
  short: string;
  icon: string;
  color: string;
  description: string;
  models: string[];
  defaultModel: string;
  keyUrl: string;
  apiStyle: "google" | "openai";
}

export const PROVIDERS: ProviderConfig[] = [
  {
    id: "gemini",
    name: "Google Gemini",
    short: "Gemini",
    icon: "✦",
    color: "#4285f4",
    description: "Hızlı UI üretimi ve görsel kodlama",
    models: [
      "gemini-3.6-flash",
      "gemini-3.5-flash",
      "gemini-3.5-flash-lite",
      "gemini-3.1-pro-preview",
      "gemini-3-flash-preview",
    ],
    defaultModel: "gemini-3.6-flash",
    keyUrl: "https://aistudio.google.com/app/apikey",
    apiStyle: "google",
  },
  {
    id: "deepseek",
    name: "DeepSeek",
    short: "DeepSeek",
    icon: "🐋",
    color: "#4d6bfe",
    description: "Kod analizi, mantık hataları ve refactoring",
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
    models: ["grok-4.6", "grok-4.5", "grok-4.3"],
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
    description: "GPT-4o / GPT-4o-mini",
    models: ["gpt-4o", "gpt-4o-mini", "gpt-4.1", "gpt-4.1-mini", "o3-mini"],
    defaultModel: "gpt-4o",
    keyUrl: "https://platform.openai.com/api-keys",
    apiStyle: "openai",
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
  }
}
