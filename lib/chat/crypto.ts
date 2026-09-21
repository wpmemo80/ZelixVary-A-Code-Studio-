"use client";

/**
 * Sohbet şifreleme yardımcıları.
 * Mesajlar, 4 haneli koddan türetilen AES-256-GCM anahtarıyla
 * yalnızca tarayıcıda şifrelenir; Firestore'a yalnızca şifreli metin gider.
 */

const encoder = new TextEncoder();
const decoder = new TextDecoder();

const PBKDF2_ITERATIONS = 150_000;

function base64ToBytes(b64: string): Uint8Array<ArrayBuffer> {
  const bin = atob(b64);
  const bytes = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
  return bytes;
}

function bytesToBase64(bytes: Uint8Array): string {
  let bin = "";
  for (let i = 0; i < bytes.length; i++) bin += String.fromCharCode(bytes[i]);
  return btoa(bin);
}

async function deriveKey(pin: string, salt: Uint8Array<ArrayBuffer>): Promise<CryptoKey> {
  const material = await crypto.subtle.importKey(
    "raw",
    encoder.encode(`zelixvary:${pin}`),
    "PBKDF2",
    false,
    ["deriveKey"],
  );
  return crypto.subtle.deriveKey(
    { name: "PBKDF2", salt, iterations: PBKDF2_ITERATIONS, hash: "SHA-256" },
    material,
    { name: "AES-GCM", length: 256 },
    false,
    ["encrypt", "decrypt"],
  );
}

export interface EncryptedPayload {
  salt: string;
  iv: string;
  data: string;
}

/** Veriyi 4 haneli kodla şifreler; salt + iv + ciphertext döndürür. */
export async function encryptMessages(pin: string, value: unknown): Promise<EncryptedPayload> {
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const key = await deriveKey(pin, salt);
  const ciphertext = await crypto.subtle.encrypt(
    { name: "AES-GCM", iv },
    key,
    encoder.encode(JSON.stringify(value)),
  );
  return {
    salt: bytesToBase64(salt),
    iv: bytesToBase64(iv),
    data: bytesToBase64(new Uint8Array(ciphertext)),
  };
}

/** Şifreyi çözer. Kod yanlışsa hata fırlatır (AES-GCM doğrulaması başarısız olur). */
export async function decryptMessages(pin: string, payload: EncryptedPayload): Promise<unknown> {
  const key = await deriveKey(pin, base64ToBytes(payload.salt));
  const plain = await crypto.subtle.decrypt(
    { name: "AES-GCM", iv: base64ToBytes(payload.iv) },
    key,
    base64ToBytes(payload.data),
  );
  return JSON.parse(decoder.decode(plain));
}

export function isValidPin(pin: string): boolean {
  return /^\d{4}$/.test(pin);
}