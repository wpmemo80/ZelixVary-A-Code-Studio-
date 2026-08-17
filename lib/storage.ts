import type { ApiKeys, RightTab } from "./types";

const KEYS_STORAGE = "zelixvary:api-keys";
const CODE_STORAGE = "zelixvary:code";
const SPLIT_STORAGE = "zelixvary:split";
const TAB_STORAGE = "zelixvary:tab";

export function loadApiKeys(): ApiKeys {
  if (typeof window === "undefined") return {};
  try {
    const raw = window.localStorage.getItem(KEYS_STORAGE);
    return raw ? (JSON.parse(raw) as ApiKeys) : {};
  } catch {
    return {};
  }
}

export function saveApiKeys(keys: ApiKeys): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(KEYS_STORAGE, JSON.stringify(keys));
}

export function hasAnyKey(keys: ApiKeys): boolean {
  return PROVIDER_IDS.some((id) => Boolean(keys[id]?.trim()));
}

const PROVIDER_IDS = ["gemini", "deepseek", "grok", "openai"] as const;

export function loadCode(): string | null {
  if (typeof window === "undefined") return null;
  try {
    return window.localStorage.getItem(CODE_STORAGE);
  } catch {
    return null;
  }
}

export function saveCode(code: string): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(CODE_STORAGE, code);
  } catch {
    // kotu yazma hatalarini yut
  }
}

export function loadSplit(): number | null {
  if (typeof window === "undefined") return null;
  const v = window.localStorage.getItem(SPLIT_STORAGE);
  return v ? Number(v) : null;
}

export function saveSplit(ratio: number): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(SPLIT_STORAGE, String(ratio));
}

export function loadTab(): RightTab | null {
  if (typeof window === "undefined") return null;
  const v = window.localStorage.getItem(TAB_STORAGE);
  return v === "ai" || v === "preview" ? v : null;
}
