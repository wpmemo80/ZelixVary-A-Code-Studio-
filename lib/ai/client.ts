import type { ChatMessage, ProviderId } from "../types";

interface ChatCallParams {
  provider: ProviderId;
  model: string;
  apiKey: string;
  messages: ChatMessage[];
  temperature?: number;
  onDelta?: (delta: string) => void;
}

async function parseSSE(body: ReadableStream<Uint8Array> | null, onEvent: (data: string) => void) {
  if (!body) return;
  const reader = body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });
    let idx: number;
    while ((idx = buffer.indexOf("\n")) >= 0) {
      const line = buffer.slice(0, idx).trim();
      buffer = buffer.slice(idx + 1);
      if (line.startsWith("data:")) {
        const data = line.slice(5).trim();
        if (data && data !== "[DONE]") onEvent(data);
      }
    }
  }
}

async function unwrapErrorText(text: string): Promise<string> {
  let current = text.trim();
  for (let i = 0; i < 3; i++) {
    try {
      const parsed = JSON.parse(current) as { error?: unknown };
      if (parsed.error !== undefined) {
        current = String(parsed.error);
      } else {
        break;
      }
    } catch {
      break;
    }
  }
  return current.slice(0, 600);
}

/**
 * ZelixVary AI Client — tüm sağlayıcılar tek arayüzden çağrılır.
 * İstekler /api/ai/chat proxy'si üzerinden gider (CORS sorununu çözer,
 * API anahtarları sunucuda saklanmaz, her istekte geçicidir).
 * onDelta verilirse akışlı (streaming) mod çalışır.
 */
export async function chatCompletions({
  provider,
  model,
  apiKey,
  messages,
  temperature = 0.7,
  onDelta,
}: ChatCallParams): Promise<string> {
  const res = await fetch("/api/ai/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      provider,
      model,
      apiKey,
      messages,
      temperature,
      stream: Boolean(onDelta),
    }),
  });

  if (!res.ok) {
    const raw = await res.text().catch(() => "");
    const msg = await unwrapErrorText(raw);
    throw new Error(`${provider.toUpperCase()} API hatası (${res.status}): ${msg}`);
  }

  if (!onDelta) {
    const data = await res.json();
    return (data.content as string) ?? "";
  }

  // Streaming: proxy normalize edilmiş `data: {"content":"..."}` olayları döner
  let full = "";
  await parseSSE(res.body, (data) => {
    try {
      const json = JSON.parse(data) as { content?: string };
      if (json.content) {
        full += json.content;
        onDelta(json.content);
      }
    } catch {
      // geçersiz chunk'ları yut
    }
  });
  return full;
}
