"use client";

import { useCallback, useSyncExternalStore } from "react";

interface CacheEntry {
  raw: string | null;
  value: unknown;
}

const cache = new Map<string, CacheEntry>();
const listeners = new Map<string, Set<() => void>>();

function getSnapshot<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  const raw = window.localStorage.getItem(key);
  const entry = cache.get(key);
  if (entry && entry.raw === raw) return entry.value as T;
  let value: unknown = fallback;
  if (raw !== null) {
    try {
      value = JSON.parse(raw) as unknown;
    } catch {
      value = fallback;
    }
  }
  cache.set(key, { raw, value });
  return value as T;
}

/**
 * localStorage destekli state hook'u.
 * - useSyncExternalStore tabanlı olduğu için SSR/hydration güvenlidir:
 *   sunucu ve ilk hydration'da fallback değeri render edilir, ardından
 *   gerçek localStorage değeri otomatik yüklenir (hydration hatası oluşmaz).
 * - Yalnızca bu tarayıcı sekmesinde anlık güncelleme için notify eder;
 *   diğer sekmeler storage event'i ile güncellenir.
 */
export function useLocalStorageValue<T>(key: string, fallback: T): [T, (value: T) => void] {
  const subscribe = useCallback(
    (callback: () => void) => {
      const set = listeners.get(key) ?? new Set<() => void>();
      set.add(callback);
      listeners.set(key, set);
      const onStorage = (e: StorageEvent) => {
        if (e.key === null || e.key === key) callback();
      };
      window.addEventListener("storage", onStorage);
      return () => {
        set.delete(callback);
        window.removeEventListener("storage", onStorage);
      };
    },
    [key],
  );

  const value = useSyncExternalStore<T>(
    subscribe,
    () => getSnapshot<T>(key, fallback),
    () => fallback,
  );

  const setValue = useCallback(
    (next: T) => {
      const raw = JSON.stringify(next);
      window.localStorage.setItem(key, raw);
      cache.set(key, { raw, value: next });
      const set = listeners.get(key);
      if (set) set.forEach((cb) => cb());
    },
    [key],
  );

  return [value, setValue];
}
