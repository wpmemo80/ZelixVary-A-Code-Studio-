export type ProviderId = "gemini" | "deepseek" | "grok" | "openai";

export type ChatRole = "system" | "user" | "assistant";

export interface ChatMessage {
  role: ChatRole;
  content: string;
  provider?: string;
}

export interface ApiKeys {
  gemini?: string;
  deepseek?: string;
  grok?: string;
  openai?: string;
}

export interface ChatRequest {
  provider: ProviderId;
  model: string;
  apiKey: string;
  messages: ChatMessage[];
  temperature?: number;
  stream?: boolean;
}

export interface RouterDecision {
  provider: ProviderId;
  model: string;
  reason: string;
}

export type ChatAction = "debug" | "refactor" | "ui" | "chat";

export type RightTab = "preview" | "ai";
