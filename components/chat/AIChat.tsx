"use client";

import {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from "react";
import {
  Bot,
  Bug,
  Check,
  CircleCheck,
  CircleX,
  FileCode2,
  History,
  Loader2,
  Lock,
  MessageSquare,
  Plus,
  Save,
  Send,
  Settings,
  Sparkles,
  Trash2,
  Wand2,
  X,
} from "lucide-react";
import type { ApiKeys, ChatAction, ChatMessage } from "@/lib/types";
import { AUTO_ROUTER_ID, getProvider, PROVIDERS } from "@/lib/providers";
import { chatCompletions } from "@/lib/ai/client";
import { smartRoute } from "@/lib/ai/router";
import {
  buildDebugPrompt,
  buildRefactorPrompt,
  buildUiPrompt,
  SYSTEM_PROMPT,
} from "@/lib/ai/prompts";
import type { ExtractedCode } from "@/lib/ai/extract";
import {
  chatDocId,
  deleteChat,
  listChats,
  loadChatById,
  saveChatHistory,
  type ChatListItem,
  type SavedChat,
} from "@/lib/chat/store";
import { isValidPin } from "@/lib/chat/crypto";
import { useAuth } from "@/lib/auth-context";
import Markdown from "./Markdown";

export interface AIChatHandle {
  runAction: (action: ChatAction, extra?: string) => void;
}

interface AIChatProps {
  code: string;
  /** Proje modunda: yol → içerik. Doluysa hızlı eylemler dosya seçici açar. */
  files?: Record<string, string>;
  apiKeys: ApiKeys;
  projectId: string | null;
  chatLabel?: string | null;
  onApplyCode: (code: string) => void;
  onOpenSettings: () => void;
}

interface UiMessage extends ChatMessage {
  id: number;
  providerLabel?: string;
}

const QUICK_ACTIONS: { action: ChatAction; label: string; icon: React.ReactNode }[] = [
  { action: "debug", label: "Kodu Analiz Et & Hata Bul", icon: <Bug size={13} /> },
  { action: "refactor", label: "Kodu Yeniden Yaz (Refactor)", icon: <Wand2 size={13} /> },
  { action: "ui", label: "Modern UI Oluştur", icon: <Sparkles size={13} /> },
];

const ACTION_LABELS: Record<ChatAction, string> = {
  debug: "🔍 **Kod Analizi & Hata Bulma** isteği gönderdim. Kodun inceleniyor...",
  refactor: "✨ **Refactor (Kodu Yeniden Yaz)** isteği gönderdim. Kodun yeniden yazılıyor...",
  ui: "🎨 **Modern UI Oluşturma** isteği gönderdim. Arayüz tasarlanıyor...",
  chat: "",
};

const WELCOME = `Merhaba! Ben **ZelixVary AI Asistan** 👋

Aşağıdakileri yapabilirim:
- 🔍 **Kod analizi & hata bulma** — editördeki kodunu inceleyip düzeltilmiş halini veririm
- ✨ **Refactor** — kodunu temiz ve performanslı hale getiririm
- 🎨 **Modern UI oluşturma** — "bana modern bir dashboard tasarla" gibi isteklerle hazır arayüz üretirim
- 💬 **Genel kodlama** — her türlü algoritma ve kod sorusu

Üstteki model menüsünden **🤖 Auto Router**'ı seçersen; istemine göre en uygun yapay zekayı (DeepSeek, Gemini, Grok, OpenAI) ben seçerim.`;

const AIChat = forwardRef<AIChatHandle, AIChatProps>(function AIChat(
  { code, files = {}, apiKeys, projectId, chatLabel, onApplyCode, onOpenSettings },
  ref,
) {
  const { user } = useAuth();
  const [messages, setMessages] = useState<UiMessage[]>([]);
  const [input, setInput] = useState("");
  const [isBusy, setIsBusy] = useState(false);
  const [selection, setSelection] = useState<string>(AUTO_ROUTER_ID);
  const [routerReason, setRouterReason] = useState<string | null>(null);
  const [historyLoaded, setHistoryLoaded] = useState(false);
  const [activeChatId, setActiveChatId] = useState<string | null>(null);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [chatList, setChatList] = useState<ChatListItem[]>([]);
  const [saveOpen, setSaveOpen] = useState(false);
  const [saveName, setSaveName] = useState("");
  const [saveLock, setSaveLock] = useState<"none" | "locked">("none");
  const [savePin, setSavePin] = useState("");
  const [savePinConfirm, setSavePinConfirm] = useState("");
  const [saveMsg, setSaveMsg] = useState<{ kind: "ok" | "error"; text: string } | null>(null);
  const [pinPrompt, setPinPrompt] = useState<{ id: string; name: string } | null>(null);
  const [pinInput, setPinInput] = useState("");
  const [pinError, setPinError] = useState<string | null>(null);
  const [savingChat, setSavingChat] = useState(false);
  const [pickTarget, setPickTarget] = useState<ChatAction | null>(null);
  const [pickedPaths, setPickedPaths] = useState<string[]>([]);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const chatNameRef = useRef<string | null>(null);
  const activePinRef = useRef<string | null>(null);
  const activeEncryptedRef = useRef(false);
  const saveMsgTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const idRef = useRef(1);

  const uid = user?.uid ?? null;

  function showSaveMsg(kind: "ok" | "error", text: string) {
    setSaveMsg({ kind, text });
    if (saveMsgTimerRef.current) clearTimeout(saveMsgTimerRef.current);
    saveMsgTimerRef.current = setTimeout(() => setSaveMsg(null), 6000);
  }

  // ── Sohbet geçmişini Firestore'dan yükle ─────────────────────
  useEffect(() => {
    if (!uid) return;
    let cancelled = false;
    const targetId = chatDocId(uid, projectId);
    chatNameRef.current = null;
    activePinRef.current = null;
    setActiveChatId(targetId);
    setHistoryLoaded(false);
    loadChatById(uid, targetId).then((chat) => {
      if (cancelled) return;
      if (!chat) {
        activeEncryptedRef.current = false;
        setMessages([]);
      } else if (chat.encrypted) {
        // Şifre bilinmiyor: içeriği göstermeyiz ve otomatik kayıtla ezmeyiz.
        activeEncryptedRef.current = true;
        chatNameRef.current = chat.name;
        setMessages([]);
      } else {
        activeEncryptedRef.current = false;
        chatNameRef.current = chat.name;
        const restored: UiMessage[] = chat.messages.map((m) => ({
          ...m,
          id: idRef.current++,
          providerLabel: m.provider ?? undefined,
        }));
        setMessages(restored);
      }
      setHistoryLoaded(true);
    });
    return () => {
      cancelled = true;
    };
  }, [uid, projectId]);

  // ── Değişen mesajları Firestore'a kaydet (debounce'lu) ──────
  useEffect(() => {
    if (!uid || !historyLoaded || !activeChatId) return;
    // Şifreli sohbet bilinmeyen kodla açılmadıysa asla üzerine yazma (veri/kilit koruması).
    if (activeEncryptedRef.current && !activePinRef.current) return;
    if (messages.length === 0) return;
    const t = setTimeout(() => {
      const slim: ChatMessage[] = messages.map((m) => {
        const provider = m.providerLabel ?? m.provider;
        return {
          role: m.role,
          content: m.content,
          ...(provider ? { provider } : {}),
        };
      });
      saveChatHistory(uid, activeChatId, slim, {
        name: chatNameRef.current ?? chatLabel ?? undefined,
        pin: activePinRef.current,
      }).catch(() => {
        // kayıt hatası yut (çevrimdışı vb.)
      });
    }, 800);
    return () => clearTimeout(t);
  }, [messages, uid, activeChatId, historyLoaded, chatLabel]);

  function handleNewChat() {
    if (isBusy) return;
    idRef.current = 1;
    setActiveChatId(null);
    activeEncryptedRef.current = false;
    activePinRef.current = null;
    setMessages([]);
  }

  function handleDeleteClick(id: string) {
    if (confirmDeleteId === id) {
      setConfirmDeleteId(null);
      if (!uid) return;
      deleteChat(uid, id)
        .then(() => {
          setChatList((l) => l.filter((c) => c.id !== id));
          if (activeChatId === id) {
            setActiveChatId(null);
            activeEncryptedRef.current = false;
            activePinRef.current = null;
            chatNameRef.current = null;
            setMessages([]);
          }
        })
        .catch(() => {
          // yut
        });
    } else {
      setConfirmDeleteId(id);
      window.setTimeout(
        () => setConfirmDeleteId((cur) => (cur === id ? null : cur)),
        2500,
      );
    }
  }

  function toggleHistory() {
    const next = !historyOpen;
    setHistoryOpen(next);
    if (next && uid) {
      listChats(uid)
        .then(setChatList)
        .catch(() => {
          // yut
        });
    }
  }

  async function selectChat(chat: ChatListItem) {
    setHistoryOpen(false);
    if (!uid) return;
    if (chat.encrypted) {
      setPinPrompt({ id: chat.id, name: chat.name });
      setPinInput("");
      setPinError(null);
      return;
    }
    await openChat(chat.id, null);
  }

  async function openChat(id: string, pin: string | null) {
    if (!uid) return;
    setHistoryLoaded(false);
    setRouterReason(null);
    let loaded: SavedChat | null = null;
    try {
      loaded = await loadChatById(uid, id, pin ?? undefined);
    } catch {
      setPinError("Şifre yanlış. Tekrar dene.");
      setHistoryLoaded(true);
      return;
    }
    setActiveChatId(id);
    chatNameRef.current = loaded?.name ?? chatNameRef.current;
    activePinRef.current = pin;
    activeEncryptedRef.current = loaded?.encrypted === true;
    if (loaded && loaded.messages.length > 0) {
      const restored: UiMessage[] = loaded.messages.map((m) => ({
        ...m,
        id: idRef.current++,
        providerLabel: m.provider ?? undefined,
      }));
      setMessages(restored);
    } else {
      setMessages([]);
    }
    setPinPrompt(null);
    setHistoryLoaded(true);
  }

  async function handleSaveChat() {
    if (!uid || !activeChatId || savingChat) return;
    if (saveLock === "locked") {
      if (!isValidPin(savePin) || savePin !== savePinConfirm) {
        showSaveMsg("error", "Şifre 4 haneli rakam olmalı ve iki alan da aynı olmalı.");
        return;
      }
    }
    const name = saveName.trim() || chatNameRef.current || "Genel Sohbet";
    setSavingChat(true);
    try {
      const slim: ChatMessage[] = messages.map((m) => {
        const provider = m.providerLabel ?? m.provider;
        return {
          role: m.role,
          content: m.content,
          ...(provider ? { provider } : {}),
        };
      });
      await saveChatHistory(uid, activeChatId, slim, {
        name,
        pin: saveLock === "locked" ? savePin : null,
      });
      chatNameRef.current = name;
      activePinRef.current = saveLock === "locked" ? savePin : null;
      setSaveOpen(false);
      setSaveName("");
      setSavePin("");
      setSavePinConfirm("");
      setSaveLock("none");
      showSaveMsg(
        "ok",
        saveLock === "locked"
          ? `"${name}" şifreli olarak kaydedildi 🔐`
          : `"${name}" kaydedildi ✅`,
      );
      listChats(uid)
        .then(setChatList)
        .catch(() => {
          // yut
        });
    } catch (err) {
      showSaveMsg("error", `Kayıt başarısız: ${err instanceof Error ? err.message : String(err).slice(0, 200)}`);
    } finally {
      setSavingChat(false);
    }
  }
  const busyRef = useRef(false);
  const streamBuffer = useRef(new Map<number, string>());

  const availableProviders = PROVIDERS.filter((p) => apiKeys[p.id]?.trim());
  const hasKeys = availableProviders.length > 0;

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  useEffect(() => {
    busyRef.current = isBusy;
  }, [isBusy]);

  function pushMessage(partial: Omit<UiMessage, "id">): number {
    const id = idRef.current++;
    setMessages((prev) => [...prev, { ...partial, id }]);
    return id;
  }

  function updateMessage(id: number, patch: Partial<UiMessage>) {
    setMessages((prev) => prev.map((m) => (m.id === id ? { ...m, ...patch } : m)));
  }

  const determineProvider = useCallback(
    (prompt: string): { provider: Parameters<typeof chatCompletions>[0]["provider"]; model: string; reason: string } => {
      if (selection !== AUTO_ROUTER_ID) {
        const cfg = getProvider(selection as Parameters<typeof chatCompletions>[0]["provider"]);
        return { provider: cfg.id, model: cfg.defaultModel, reason: "" };
      }
      const decision = smartRoute(prompt, availableProviders.map((p) => p.id));
      return { provider: decision.provider, model: decision.model, reason: decision.reason };
    },
    [selection, availableProviders],
  );

  const sendToAi = useCallback(
    async (userText: string, history: UiMessage[]) => {
      const { provider, model, reason } = determineProvider(userText);
      setRouterReason(reason || null);

      pushMessage({ role: "user", content: userText });
      const replyId = pushMessage({ role: "assistant", content: "", providerLabel: getProvider(provider).short });
      setIsBusy(true);
      streamBuffer.current.set(replyId, "");

      const systemMsg: ChatMessage = { role: "system", content: SYSTEM_PROMPT };
      const historyMsgs: ChatMessage[] = history.map((m) => ({ role: m.role, content: m.content }));
      const apiMessages = [systemMsg, ...historyMsgs, { role: "user" as const, content: userText }];

      try {
        const full = await chatCompletions({
          provider,
          model,
          apiKey: apiKeys[provider] ?? "",
          messages: apiMessages,
          temperature: 0.7,
          onDelta: (delta) => {
            const acc = (streamBuffer.current.get(replyId) ?? "") + delta;
            streamBuffer.current.set(replyId, acc);
            updateMessage(replyId, { content: acc });
          },
        });
        streamBuffer.current.delete(replyId);
        updateMessage(replyId, { content: full });
      } catch (err) {
        streamBuffer.current.delete(replyId);
        const msg = err instanceof Error ? err.message : "Bilinmeyen hata";
        updateMessage(replyId, {
          content: `⚠️ **İstek başarısız oldu**\n\n\`\`\`\n${msg}\n\`\`\`\n\n> Ayarlar'dan API anahtarını kontrol et veya başka bir sağlayıcı seç.`,
        });
      } finally {
        setIsBusy(false);
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [apiKeys, determineProvider, selection],
  );

  function handleSend(text?: string) {
    const prompt = (text ?? input).trim();
    if (!prompt || isBusy) return;
    if (!hasKeys) {
      setRouterReason(null);
      pushMessage({ role: "user", content: prompt });
      pushMessage({
        role: "assistant",
        content:
          "⚠️ **API anahtarı tanımlı değil.**\n\nSağ üstteki **Ayarlar** (⚙️) butonundan Gemini, DeepSeek, Grok veya OpenAI anahtarlarını ekle. Anahtarlar yalnızca tarayıcında (localStorage) saklanır.",
        providerLabel: "ZelixVary",
      });
      setInput("");
      return;
    }
    setInput("");
    const history = messages;
    sendToAi(prompt, history);
  }

  function runAction(action: ChatAction, extra?: string) {
    if (isBusy) return;
    if (!hasKeys) {
      pushMessage({
        role: "assistant",
        content:
          "⚠️ Bu işlem için önce bir API anahtarı gerekli. **Ayarlar** (⚙️) butonundan anahtar ekle.",
        providerLabel: "ZelixVary",
      });
      return;
    }
    const filePaths = Object.keys(files);
    if (filePaths.length > 0) {
      // Proje modu: hangi dosyaların analiz edileceğini sor.
      setPickTarget(action);
      setPickedPaths(filePaths);
      return;
    }
    if (!code.trim()) return;
    const prompts: Record<ChatAction, string> = {
      debug: buildDebugPrompt(code),
      refactor: buildRefactorPrompt(code),
      ui: buildUiPrompt(extra ?? code),
      chat: input,
    };
    const history = messages;
    pushMessage({ role: "user", content: ACTION_LABELS[action] });
    sendToAi(prompts[action], history);
  }

  function confirmPick() {
    if (!pickTarget) return;
    const target = pickTarget;
    const combined = Object.entries(files)
      .filter(([p]) => pickedPaths.includes(p))
      .map(([p, c]) => `//──────── ${p} ────────\n${c}`)
      .join("\n\n");
    setPickTarget(null);
    if (!combined.trim()) return;
    const prompts: Record<ChatAction, string> = {
      debug: buildDebugPrompt(combined),
      refactor: buildRefactorPrompt(combined),
      ui: buildUiPrompt(combined),
      chat: "",
    };
    const history = messages;
    pushMessage({ role: "user", content: ACTION_LABELS[target] });
    sendToAi(prompts[target], history);
  }

  useImperativeHandle(ref, () => ({
    runAction,
  }));

  function handleApply(block: ExtractedCode) {
    onApplyCode(block.code);
    pushMessage({
      role: "assistant",
      content: `✅ Kod editöre uygulandı (${block.language}). Önizleme sekmesi güncelleniyor...`,
      providerLabel: "ZelixVary",
    });
  }

  return (
    <div className="relative flex h-full min-h-0 flex-col bg-[#18181b]">
      <div className="flex shrink-0 items-center gap-2 border-b border-zinc-800 bg-[#232328] px-3 py-2">
        <Bot size={16} className="text-violet-400" />
        <span className="text-[13px] font-semibold text-zinc-100">ZelixVary AI Asistan</span>
        {historyLoaded && chatNameRef.current && messages.length > 0 && (
          <button
            onClick={handleNewChat}
            className="ml-1 flex items-center gap-1 rounded px-1.5 py-0.5 text-[10.5px] text-zinc-500 transition hover:bg-zinc-800 hover:text-violet-300"
            title="Yeni sohbet başlat (geçerli sohbet Firestore'da saklanır)"
          >
            <Plus size={11} />
            Yeni Sohbet
          </button>
        )}
        <div className="relative ml-auto flex items-center gap-1.5">
          <button
            onClick={toggleHistory}
            className={`flex items-center gap-1.5 rounded-md border px-2 py-1 text-[11.5px] transition ${
              historyOpen
                ? "border-violet-500/60 bg-violet-600/15 text-violet-300"
                : "border-zinc-700 text-zinc-300 hover:border-violet-500/60 hover:text-violet-300"
            }`}
            title="Hesabındaki kayıtlı sohbetler"
          >
            <History size={12} />
            Geçmiş
          </button>

          {historyOpen && (
            <div className="absolute right-0 top-full z-30 mt-1.5 max-h-80 w-72 overflow-y-auto rounded-xl border border-zinc-700 bg-[#1c1c1f] p-1.5 shadow-2xl">
              <div className="px-2 py-1.5 text-[10.5px] font-semibold uppercase tracking-wider text-zinc-500">
                Kayıtlı Sohbetler
              </div>
              {chatList.length === 0 ? (
                <div className="px-2 py-4 text-center text-[12px] text-zinc-600">
                  Henüz kayıtlı sohbet yok. Biraz konuş, otomatik kaydedilsin.
                </div>
              ) : (
                chatList.map((c) => (
                  <div
                    key={c.id}
                    className={`group flex items-center gap-1 rounded-lg transition hover:bg-zinc-800 ${
                      c.id === activeChatId ? "bg-violet-600/15" : ""
                    }`}
                  >
                    <button
                      onClick={() => selectChat(c)}
                      className="flex min-w-0 flex-1 items-start gap-2 rounded-lg px-2 py-2 text-left"
                      title={c.encrypted ? "Şifreli sohbet — açmak için kod gerekir" : "Bu sohbeti aç"}
                    >
                      {c.encrypted ? (
                        <Lock size={12} className="mt-0.5 shrink-0 text-amber-400" />
                      ) : (
                        <MessageSquare size={12} className="mt-0.5 shrink-0 text-violet-400" />
                      )}
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-[12px] font-medium text-zinc-200">
                          {c.name}
                          {c.encrypted && <span className="ml-1 text-[10px] text-amber-400">🔒</span>}
                        </span>
                        <span className="block text-[10.5px] text-zinc-500">
                          {c.messageCount} mesaj ·{" "}
                          {c.updatedAt
                            ? new Date(c.updatedAt).toLocaleDateString("tr-TR", {
                                day: "2-digit",
                                month: "short",
                                hour: "2-digit",
                                minute: "2-digit",
                              })
                            : "—"}
                        </span>
                      </span>
                      {c.id === activeChatId && (
                        <Check size={12} className="mt-0.5 shrink-0 text-violet-400" />
                      )}
                    </button>
                    <button
                      onClick={() => handleDeleteClick(c.id)}
                      className={`mr-1.5 flex h-5 w-5 shrink-0 items-center justify-center rounded transition ${
                        confirmDeleteId === c.id
                          ? "bg-red-600 text-white"
                          : "text-zinc-600 hover:bg-zinc-700 hover:text-red-400"
                      }`}
                      title={
                        confirmDeleteId === c.id
                          ? "Emin misin? Tekrar tıkla"
                          : "Bu sohbeti kalıcı olarak sil"
                      }
                    >
                      <Trash2 size={11} />
                    </button>
                  </div>
                ))
              )}
            </div>
          )}

          <select
            value={selection}
            onChange={(e) => setSelection(e.target.value)}
            className="max-w-[190px] cursor-pointer rounded-md border border-zinc-700 bg-[#18181b] px-2 py-1 text-[12px] text-zinc-200 outline-none transition focus:border-violet-500"
            title="Model seçimi"
          >
            <option value={AUTO_ROUTER_ID}>🤖 ZelixVary Auto Router</option>
            <optgroup label="Kullanılabilir modeller">
              {availableProviders.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.icon} {p.name}
                </option>
              ))}
            </optgroup>
            {availableProviders.length === 0 && (
              <optgroup label="Anahtar gerekli">
                {PROVIDERS.map((p) => (
                  <option key={p.id} value={p.id} disabled>
                    {p.icon} {p.name} (anahtar yok)
                  </option>
                ))}
              </optgroup>
            )}
          </select>
        </div>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto px-3 py-3">
        {routerReason && (
          <div className="mx-auto mb-3 flex w-fit items-center gap-1.5 rounded-full border border-violet-500/30 bg-violet-500/10 px-3 py-1 text-[11px] text-violet-300">
            <Sparkles size={11} />
            {routerReason}
          </div>
        )}

        {messages.length === 0 ? (
          activeEncryptedRef.current ? (
            <div className="mx-auto max-w-md pt-10 text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl border border-amber-500/40 bg-amber-500/10">
                <Lock size={28} className="text-amber-400" />
              </div>
              <p className="mb-1 text-[14px] font-semibold text-zinc-200">
                Bu sohbet şifreli 🔒
              </p>
              <p className="mb-4 text-[12.5px] text-zinc-500">
                Mesajlar yalnızca 4 haneli kodla açılır. Otomatik kayıt, güvenlik için kilitli sohbete
                yazmaz — kilidi açınca devam edebilirsin.
              </p>
              <button
                onClick={() => {
                  if (activeChatId) {
                    setPinPrompt({
                      id: activeChatId,
                      name: chatNameRef.current ?? "Genel Sohbet",
                    });
                    setPinInput("");
                    setPinError(null);
                  }
                }}
                className="flex items-center gap-2 rounded-xl bg-amber-500 px-5 py-2.5 text-[13px] font-semibold text-black transition hover:bg-amber-400 active:scale-95"
              >
                <Lock size={15} />
                4 Haneli Kodu Gir
              </button>
            </div>
          ) : (
            <div className="mx-auto max-w-md pt-10 text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-600 to-fuchsia-600 shadow-lg shadow-violet-900/40">
                <Sparkles size={28} className="text-white" />
              </div>
              <div className="rounded-xl border border-zinc-800 bg-[#232328] p-4 text-left">
                <Markdown text={WELCOME} />
              </div>
              {!hasKeys && (
                <button
                  onClick={onOpenSettings}
                  className="mt-4 flex items-center gap-2 rounded-lg bg-violet-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-violet-500 active:scale-95"
                >
                  <Settings size={15} />
                  API Anahtarlarını Ayarla
                </button>
              )}
            </div>
          )
        ) : (
          messages.map((m) => (
            <div
              key={m.id}
              className={`mb-3 flex ${m.role === "user" ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[92%] rounded-xl px-3 py-2 text-[13px] leading-relaxed ${
                  m.role === "user"
                    ? "rounded-br-sm bg-violet-600/90 text-white"
                    : "rounded-bl-sm border border-zinc-800 bg-[#232328] text-zinc-200"
                }`}
              >
                {m.role === "assistant" && m.providerLabel && (
                  <div className="mb-1.5 flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wider text-violet-400">
                    <Bot size={11} />
                    {m.providerLabel}
                  </div>
                )}
                <Markdown text={m.content} onApply={m.role === "assistant" ? handleApply : undefined} />
              </div>
            </div>
          ))
        )}

        {isBusy && (
          <div className="flex items-center gap-2 text-[12px] text-zinc-400">
            <Loader2 size={14} className="animate-spin text-violet-400" />
            <span>AI yanıt üretiyor...</span>
          </div>
        )}
        <div ref={scrollRef} />
      </div>

      <div className="shrink-0 border-t border-zinc-800 bg-[#1c1c1f] p-2.5">
        <div className="mb-2 flex flex-wrap gap-1.5">
          {QUICK_ACTIONS.map((a) => (
            <button
              key={a.action}
              onClick={() => runAction(a.action)}
              disabled={isBusy || !hasKeys}
              className="flex items-center gap-1.5 rounded-full border border-zinc-700/80 bg-zinc-800/60 px-2.5 py-1 text-[11px] font-medium text-zinc-300 transition hover:border-violet-500/60 hover:text-violet-300 disabled:cursor-not-allowed disabled:opacity-40"
            >
              {a.icon}
              {a.label}
            </button>
          ))}
        </div>
        <div className="flex items-end gap-2">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
            rows={1}
            placeholder={hasKeys ? "AI'a bir şeyler yaz... (Enter gönderir, Shift+Enter satır)" : "Önce API anahtarı ekle (⚙️)"}
            className="max-h-32 min-h-[38px] flex-1 resize-none rounded-lg border border-zinc-700 bg-[#101013] px-3 py-2 text-[13px] text-zinc-100 placeholder-zinc-500 outline-none transition focus:border-violet-500"
          />
          <button
            onClick={() => handleSend()}
            disabled={isBusy || !input.trim()}
            className="flex h-[38px] w-[38px] shrink-0 items-center justify-center rounded-lg bg-violet-600 text-white transition hover:bg-violet-500 active:scale-95 disabled:cursor-not-allowed disabled:opacity-40"
            title="Gönder"
          >
            <Send size={16} />
          </button>
          <button
            onClick={() => {
              setSaveName(chatNameRef.current ?? chatLabel ?? "");
              setSaveLock("none");
              setSavePin("");
              setSavePinConfirm("");
              setSaveOpen(true);
            }}
            disabled={isBusy || messages.length === 0}
            className="flex h-[38px] w-[38px] shrink-0 items-center justify-center rounded-lg border border-zinc-700 text-zinc-300 transition hover:border-emerald-500/60 hover:text-emerald-300 active:scale-95 disabled:cursor-not-allowed disabled:opacity-40"
            title="Sohbeti kaydet (ad ve isteğe bağlı şifre)"
          >
            <Save size={16} />
          </button>
        </div>
        {saveMsg && (
          <div
            className={`absolute bottom-16 left-1/2 z-40 -translate-x-1/2 rounded-lg border px-3 py-1.5 text-[11.5px] shadow-xl backdrop-blur ${
              saveMsg.kind === "ok"
                ? "border-emerald-600/50 bg-emerald-950/90 text-emerald-200"
                : "border-red-600/50 bg-red-950/90 text-red-200"
            }`}
          >
            {saveMsg.text}
          </div>
        )}
      </div>

      {/* ── Kaydet Modalı ─────────────────────────────────────── */}
      {saveOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
          <div className="w-full max-w-sm rounded-2xl border border-zinc-700 bg-[#1c1c1f] p-5 shadow-2xl">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="flex items-center gap-2 text-[15px] font-bold text-zinc-100">
                <Save size={15} className="text-emerald-400" />
                Sohbeti Kaydet
              </h3>
              <button
                onClick={() => setSaveOpen(false)}
                className="flex h-7 w-7 items-center justify-center rounded text-zinc-400 transition hover:bg-zinc-800 hover:text-zinc-100"
              >
                <X size={15} />
              </button>
            </div>

            <label className="mb-1 block text-[11.5px] font-medium text-zinc-400">Sohbet Adı</label>
            <input
              autoFocus
              value={saveName}
              onChange={(e) => setSaveName(e.target.value)}
              maxLength={60}
              placeholder="Örn: Hesap makinesi sohbeti"
              className="mb-4 w-full rounded-lg border border-zinc-700 bg-[#101013] px-3 py-2 text-[13px] text-zinc-100 placeholder-zinc-600 outline-none transition focus:border-violet-500"
            />

            <p className="mb-2 text-[12px] font-medium text-zinc-400">Şifreleme sistemi olsun mu?</p>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => setSaveLock("locked")}
                className={`flex items-center justify-center gap-1.5 rounded-lg border px-3 py-2 text-[12px] font-medium transition ${
                  saveLock === "locked"
                    ? "border-emerald-500/70 bg-emerald-500/15 text-emerald-300"
                    : "border-zinc-700 text-zinc-400 hover:border-emerald-500/50 hover:text-emerald-300"
                }`}
              >
                <CircleCheck size={14} className="text-emerald-400" />
                4 haneli kodla kilitle
              </button>
              <button
                onClick={() => setSaveLock("none")}
                className={`flex items-center justify-center gap-1.5 rounded-lg border px-3 py-2 text-[12px] font-medium transition ${
                  saveLock === "none"
                    ? "border-violet-500/70 bg-violet-500/15 text-violet-300"
                    : "border-zinc-700 text-zinc-400 hover:border-violet-500/50 hover:text-violet-300"
                }`}
              >
                <CircleX size={14} className="text-red-400" />
                Şifresiz açık sohbet
              </button>
            </div>

            {saveLock === "locked" && (
              <div className="mt-4 grid grid-cols-2 gap-2">
                <div>
                  <label className="mb-1 block text-[11px] font-medium text-zinc-500">4 Haneli Kod</label>
                  <input
                    value={savePin}
                    onChange={(e) => setSavePin(e.target.value.replace(/\D/g, "").slice(0, 4))}
                    inputMode="numeric"
                    pattern="\d*"
                    placeholder="••••"
                    className="w-full rounded-lg border border-zinc-700 bg-[#101013] px-3 py-2 text-center text-[15px] tracking-[0.4em] text-zinc-100 placeholder-zinc-600 outline-none transition focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-[11px] font-medium text-zinc-500">Kodu Onayla</label>
                  <input
                    value={savePinConfirm}
                    onChange={(e) => setSavePinConfirm(e.target.value.replace(/\D/g, "").slice(0, 4))}
                    inputMode="numeric"
                    pattern="\d*"
                    placeholder="••••"
                    className="w-full rounded-lg border border-zinc-700 bg-[#101013] px-3 py-2 text-center text-[15px] tracking-[0.4em] text-zinc-100 placeholder-zinc-600 outline-none transition focus:border-emerald-500"
                  />
                </div>
                <p className="col-span-2 text-[10.5px] leading-relaxed text-zinc-600">
                  {"🔐 Mesajlar tarayıcında AES-256 ile şifrelenir; Firestore'da yalnızca şifreli metin saklanır. Kodu unutursan sohbete hiçbir şekilde erişemezsin."}
                </p>
              </div>
            )}

            <div className="mt-5 flex justify-end gap-2">
              <button
                onClick={() => setSaveOpen(false)}
                className="rounded-lg px-4 py-2 text-[13px] text-zinc-300 transition hover:bg-zinc-700/40"
              >
                Vazgeç
              </button>
              <button
                onClick={handleSaveChat}
                disabled={savingChat}
                className="flex items-center gap-1.5 rounded-lg bg-emerald-600 px-4 py-2 text-[13px] font-semibold text-white transition hover:bg-emerald-500 disabled:opacity-50"
              >
                {savingChat ? <Loader2 size={13} className="animate-spin" /> : <Save size={13} />}
                Kaydet
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Şifreli Sohbet Açma Modalı ────────────────────────── */}
      {pinPrompt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
          <div className="w-full max-w-xs rounded-2xl border border-zinc-700 bg-[#1c1c1f] p-5 shadow-2xl">
            <h3 className="mb-1 flex items-center gap-2 text-[15px] font-bold text-zinc-100">
              <Lock size={15} className="text-amber-400" />
              Şifreli Sohbet
            </h3>
            <p className="mb-3 text-[12px] text-zinc-400">
              <span className="font-semibold text-zinc-200">{pinPrompt.name}</span> sohbeti 4 haneli kodla
              korunuyor. Açmak için kodu gir.
            </p>
            <input
              autoFocus
              value={pinInput}
              onChange={(e) => setPinInput(e.target.value.replace(/\D/g, "").slice(0, 4))}
              onKeyDown={(e) => {
                if (e.key === "Enter" && isValidPin(pinInput)) {
                  const id = pinPrompt.id;
                  const pin = pinInput;
                  setPinInput("");
                  openChat(id, pin);
                }
              }}
              inputMode="numeric"
              pattern="\d*"
              placeholder="••••"
              className="w-full rounded-lg border border-zinc-700 bg-[#101013] px-3 py-2.5 text-center text-[16px] tracking-[0.5em] text-zinc-100 placeholder-zinc-600 outline-none transition focus:border-amber-500"
            />
            {pinError && <p className="mt-2 text-[11.5px] text-red-400">{pinError}</p>}
            <div className="mt-4 flex justify-end gap-2">
              <button
                onClick={() => {
                  setPinPrompt(null);
                  setPinError(null);
                }}
                className="rounded-lg px-4 py-2 text-[13px] text-zinc-300 transition hover:bg-zinc-700/40"
              >
                Vazgeç
              </button>
              <button
                onClick={() => {
                  const id = pinPrompt.id;
                  const pin = pinInput;
                  setPinInput("");
                  openChat(id, pin);
                }}
                disabled={!isValidPin(pinInput)}
                className="rounded-lg bg-amber-500 px-4 py-2 text-[13px] font-semibold text-black transition hover:bg-amber-400 disabled:cursor-not-allowed disabled:opacity-40"
              >
                Aç
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Dosya Seçici Modalı ──────────────────────────────── */}
      {pickTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl border border-zinc-700 bg-[#1c1c1f] p-5 shadow-2xl">
            <div className="mb-1 flex items-center justify-between">
              <h3 className="flex items-center gap-2 text-[15px] font-bold text-zinc-100">
                <FileCode2 size={15} className="text-violet-400" />
                {pickTarget === "ui"
                  ? "Modern UI Oluştur"
                  : pickTarget === "refactor"
                    ? "Kodu Yeniden Yaz"
                    : "Kod Analizi & Hata Bul"}
              </h3>
              <button
                onClick={() => setPickTarget(null)}
                className="flex h-7 w-7 items-center justify-center rounded text-zinc-400 transition hover:bg-zinc-800 hover:text-zinc-100"
              >
                <X size={15} />
              </button>
            </div>
            <p className="mb-3 text-[12px] text-zinc-500">
              Hangi dosyaları yapay zekaya göndereceğini seç. Seçili dosyalardaki kod analiz edilir.
            </p>
            <div className="max-h-64 space-y-1 overflow-y-auto rounded-xl border border-zinc-800 bg-[#101013] p-2">
              {Object.keys(files).map((path) => (
                <label
                  key={path}
                  className="flex cursor-pointer items-center gap-2 rounded-lg px-2 py-1.5 text-[12.5px] text-zinc-300 transition hover:bg-zinc-800"
                >
                  <input
                    type="checkbox"
                    checked={pickedPaths.includes(path)}
                    onChange={(e) =>
                      setPickedPaths((prev) =>
                        e.target.checked
                          ? [...prev, path]
                          : prev.filter((p) => p !== path),
                      )
                    }
                    className="h-3.5 w-3.5 accent-violet-500"
                  />
                  <FileCode2 size={12} className="shrink-0 text-zinc-600" />
                  <span className="truncate">{path}</span>
                </label>
              ))}
            </div>
            <div className="mt-4 flex justify-between gap-2">
              <button
                onClick={() => setPickedPaths(Object.keys(files))}
                className="rounded-lg px-3 py-2 text-[12px] text-violet-400 transition hover:bg-zinc-800"
              >
                Tümünü Seç
              </button>
              <div className="flex gap-2">
                <button
                  onClick={() => setPickTarget(null)}
                  className="rounded-lg px-4 py-2 text-[13px] text-zinc-300 transition hover:bg-zinc-700/40"
                >
                  Vazgeç
                </button>
                <button
                  onClick={confirmPick}
                  disabled={pickedPaths.length === 0}
                  className="flex items-center gap-1.5 rounded-lg bg-violet-600 px-4 py-2 text-[13px] font-semibold text-white transition hover:bg-violet-500 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <Sparkles size={13} />
                  Analiz Et ({pickedPaths.length} dosya)
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
});

export default AIChat;
