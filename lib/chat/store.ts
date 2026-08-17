"use client";

import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  query,
  serverTimestamp,
  setDoc,
  where,
} from "firebase/firestore";
import { getFirebase } from "@/lib/firebase/client";
import type { ChatMessage } from "@/lib/types";
import { decryptMessages, encryptMessages, type EncryptedPayload } from "@/lib/chat/crypto";

export interface SavedChat {
  id: string;
  name: string;
  encrypted: boolean;
  messages: ChatMessage[];
}

export interface ChatListItem {
  id: string;
  name: string;
  encrypted: boolean;
  messageCount: number;
  updatedAt: number;
}

export interface SaveChatOptions {
  name?: string;
  /** Verilirse sohbet bu kodla şifrelenir (Firestore'da mesajlar okunamaz). */
  pin?: string | null;
}

export function chatDocId(uid: string, projectId: string | null): string {
  return projectId ? `project_${projectId}` : `user_${uid}`;
}

function toChatMessages(data: Record<string, unknown>): ChatMessage[] {
  const raw = (data.messages as ChatMessage[]) ?? [];
  return Array.isArray(raw) ? raw.filter((m) => m && typeof m.content === "string") : [];
}

/** Firestore undefined değer kabul etmez: undefined alanları (derinlemesine) eler. */
function sanitizeForFirestore<T>(value: T): T {
  if (Array.isArray(value)) {
    return value.map(sanitizeForFirestore) as unknown as T;
  }
  if (value && typeof value === "object") {
    const out: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(value as Record<string, unknown>)) {
      if (v !== undefined) out[k] = sanitizeForFirestore(v);
    }
    return out as T;
  }
  return value;
}

/** Şifreli bir dokümandan EncryptedPayload okur. */
function toEncryptedPayload(data: Record<string, unknown>): EncryptedPayload {
  return { salt: String(data.salt), iv: String(data.iv), data: String(data.data) };
}

/**
 * Belirli bir sohbet dokümanını id ile yükler.
 * Şifreli sohbetler için pin verilmelidir; kod yanlışsa hata fırlatılır.
 */
export async function loadChatById(uid: string, chatId: string, pin?: string): Promise<SavedChat | null> {
  const { db } = getFirebase();
  const snap = await getDoc(doc(db, "chats", chatId));
  if (!snap.exists()) return null;
  const data = snap.data();
  const name = String(data.name ?? data.label ?? "Genel Sohbet");
  const encrypted = data.encrypted === true;

  if (encrypted) {
    if (!pin) return { id: chatId, name, encrypted: true, messages: [] };
    const messages = (await decryptMessages(pin, toEncryptedPayload(data))) as ChatMessage[];
    return {
      id: chatId,
      name,
      encrypted: true,
      messages: Array.isArray(messages) ? messages.filter((m) => m && typeof m.content === "string") : [],
    };
  }

  return { id: chatId, name, encrypted: false, messages: toChatMessages(data) };
}

/**
 * Kullanıcının (ve varsa projenin) sohbet geçmişini Firestore'dan yükler.
 */
export async function loadChatHistory(uid: string, projectId: string | null): Promise<SavedChat | null> {
  return loadChatById(uid, chatDocId(uid, projectId));
}

/**
 * Sohbet geçmişini Firestore'a yazar (idempotent — aynı doc üzerine).
 * pin verilirse mesajlar AES-256-GCM ile şifrelenerek saklanır.
 */
export async function saveChatHistory(
  uid: string,
  chatId: string,
  messages: ChatMessage[],
  options: SaveChatOptions = {},
): Promise<void> {
  const { db } = getFirebase();
  const name = options.name?.trim() || "Genel Sohbet";
  const base = {
    ownerId: uid,
    name,
    messageCount: messages.length,
    updatedAt: serverTimestamp(),
  };

  if (options.pin) {
    const payload = await encryptMessages(options.pin, messages);
    await setDoc(
      doc(db, "chats", chatId),
      sanitizeForFirestore({ ...base, encrypted: true, ...payload, messages: [] }),
      { merge: true },
    );
  } else {
    await setDoc(doc(db, "chats", chatId), sanitizeForFirestore({ ...base, encrypted: false, messages }), {
      merge: true,
    });
  }
}

/**
 * Sohbeti Firestore'dan tamamen siler.
 */
export async function deleteChat(uid: string, chatId: string): Promise<void> {
  const { db } = getFirebase();
  await deleteDoc(doc(db, "chats", chatId));
}

/**
 * Sohbeti tamamen temizler (ad/kilit durumu sıfırlanır).
 */
export async function clearChatHistory(uid: string, chatId: string): Promise<void> {
  const { db } = getFirebase();
  await setDoc(
    doc(db, "chats", chatId),
    {
      ownerId: uid,
      name: "Genel Sohbet",
      encrypted: false,
      messageCount: 0,
      messages: [],
      updatedAt: serverTimestamp(),
    },
    { merge: true },
  );
}

/**
 * Hesaptaki tüm kayıtlı sohbetleri (genel + proje sohbetleri) listeler.
 */
export async function listChats(uid: string): Promise<ChatListItem[]> {
  const { db } = getFirebase();
  // orderBy Firestore'da bileşik index gerektirir; sıralama istemci tarafında yapılır.
  const q = query(collection(db, "chats"), where("ownerId", "==", uid));
  const snap = await getDocs(q);
  return snap.docs
    .map((d) => {
      const data = d.data();
      return {
        id: d.id,
        name: String(data.name ?? data.label ?? "Genel Sohbet"),
        encrypted: data.encrypted === true,
        messageCount: Number(data.messageCount ?? toChatMessages(data).length),
        updatedAt: Number((data.updatedAt as { seconds?: number })?.seconds ?? 0) * 1000,
      };
    })
    .sort((a, b) => b.updatedAt - a.updatedAt);
}