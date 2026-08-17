import { NextRequest, NextResponse } from "next/server";
import type { ChatMessage, ProviderId } from "@/lib/types";
import { getProvider, providerBaseUrl } from "@/lib/providers";

export const runtime = "nodejs";
export const maxDuration = 120;

const VALID_PROVIDERS: ProviderId[] = ["gemini", "deepseek", "grok", "openai"];

interface Payload {
  provider?: ProviderId;
  model?: string;
  apiKey?: string;
  messages?: ChatMessage[];
  temperature?: number;
  stream?: boolean;
}

function sseEncode(obj: unknown): Uint8Array {
  const encoder = new TextEncoder();
  return encoder.encode(`data: ${JSON.stringify(obj)}\n\n`);
}

/**
 * Her sağlayıcının ham SSE akışını ZelixVary'nin ortak formatına çevirir:
 *   data: {"content": "..."}
 */
function normalizeSseStream(
  upstream: ReadableStream<Uint8Array>,
  provider: ProviderId,
): ReadableStream<Uint8Array> {
  const decoder = new TextDecoder();
  const encoder = new TextEncoder();
  let buffer = "";

  const extract = (line: string): string => {
    if (provider === "gemini") {
      try {
        const json = JSON.parse(line) as {
          candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }>;
        };
        return (
          json.candidates?.[0]?.content?.parts
            ?.map((p) => p.text ?? "")
            .join("") ?? ""
        );
      } catch {
        return "";
      }
    }
    try {
      const json = JSON.parse(line) as {
        choices?: Array<{ delta?: { content?: string; reasoning_content?: string } }>;
      };
      const delta = json.choices?.[0]?.delta;
      return (delta?.content ?? "") + (delta?.reasoning_content ?? "");
    } catch {
      return "";
    }
  };

  return new ReadableStream({
    async start(controller) {
      const reader = upstream.getReader();
      try {
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
              if (!data || data === "[DONE]") continue;
              const content = extract(data);
              if (content) controller.enqueue(sseEncode({ content }));
            }
          }
        }
        controller.enqueue(encoder.encode("data: [DONE]\n\n"));
      } catch (err) {
        const msg = err instanceof Error ? err.message : "Stream hatası";
        controller.enqueue(sseEncode({ error: msg }));
      } finally {
        controller.close();
      }
    },
  });
}

/**
 * ZelixVary AI Proxy
 * - API anahtarları asla sunucuda saklanmaz; yalnızca bu istek için kullanılır.
 * - CORS kısıtlamalarını (OpenAI / Grok / DeepSeek) aşar.
 * - Streaming yanıtları ortak SSE formatına normalleştirir.
 */
export async function POST(request: NextRequest) {
  let body: Payload;
  try {
    body = (await request.json()) as Payload;
  } catch {
    return NextResponse.json({ error: "Geçersiz istek gövdesi." }, { status: 400 });
  }

  const { provider, model, apiKey, messages, temperature = 0.7, stream = true } = body;

  if (!provider || !VALID_PROVIDERS.includes(provider)) {
    return NextResponse.json({ error: "Bilinmeyen sağlayıcı." }, { status: 400 });
  }
  if (!model || !apiKey || !Array.isArray(messages) || messages.length === 0) {
    return NextResponse.json({ error: "model, apiKey ve messages zorunludur." }, { status: 400 });
  }

  const cfg = getProvider(provider);
  const baseUrl = providerBaseUrl(provider);

  let url: string;
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  let upstreamBody: string;

  if (cfg.apiStyle === "google") {
    url = `${baseUrl}/models/${model}:generateContent?key=${encodeURIComponent(apiKey)}${stream ? "&alt=sse" : ""}`;
    upstreamBody = JSON.stringify({
      systemInstruction: {
        parts: [{ text: messages.find((m) => m.role === "system")?.content ?? "" }],
      },
      contents: messages
        .filter((m) => m.role !== "system")
        .map((m) => ({
          role: m.role === "assistant" ? "model" : "user",
          parts: [{ text: m.content }],
        })),
      generationConfig: { temperature },
    });
  } else {
    url = `${baseUrl}/chat/completions`;
    headers.Authorization = `Bearer ${apiKey}`;
    upstreamBody = JSON.stringify({
      model,
      messages: messages.filter((m) => m.content.trim() !== ""),
      temperature,
      stream,
    });
  }

  let upstream: Response;
  try {
    upstream = await fetch(url, {
      method: "POST",
      headers,
      body: upstreamBody,
      signal: AbortSignal.timeout(90_000),
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Ağ hatası";
    return NextResponse.json({ error: `Sağlayıcıya ulaşılamadı: ${msg}` }, { status: 502 });
  }

  if (!upstream.ok) {
    const text = await upstream.text().catch(() => "");
    return NextResponse.json(
      { error: `${cfg.name} API hatası (${upstream.status}): ${text.slice(0, 500)}` },
      { status: upstream.status },
    );
  }

  if (stream && upstream.body) {
    return new NextResponse(normalizeSseStream(upstream.body, provider), {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache, no-transform",
        Connection: "keep-alive",
      },
    });
  }

  const data = await upstream.json();
  const content =
    cfg.apiStyle === "google"
      ? data?.candidates?.[0]?.content?.parts?.map((p: { text?: string }) => p.text ?? "").join("") ?? ""
      : data?.choices?.[0]?.message?.content ?? "";

  return NextResponse.json({ content });
}
