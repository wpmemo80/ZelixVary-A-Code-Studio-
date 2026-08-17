"use client";

import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  onSnapshot,
  query,
  serverTimestamp,
  updateDoc,
  where,
  type Unsubscribe,
} from "firebase/firestore";
import { getFirebase } from "@/lib/firebase/client";

export interface Project {
  id: string;
  name: string;
  files: Record<string, string>;
  createdAt: number;
  updatedAt: number;
}

export interface ProjectListItem {
  id: string;
  name: string;
  fileCount: number;
  updatedAt: number;
}

/**
 * Firestore hatalarını insan diliyle anlatır.
 * En yaygın nedenler: veritabanı oluşturulmamış (404) veya kurallar kapalı (403).
 */
export function describeFirestoreError(err: unknown): string {
  const code = (err as { code?: string })?.code ?? "";
  const message = err instanceof Error ? err.message : String(err);
  const normalized = message.toLowerCase();

  if (code === "permission-denied" || normalized.includes("permission")) {
    return "Firestore kuralları bu işlemi reddetti. Firebase Console → Firestore Database → Rules sekmesinde kuralları güncelle: `allow read, write: if request.auth != null;`";
  }
  if (code === "not-found" || code === "NOT_FOUND" || normalized.includes("not found") || normalized.includes("404")) {
    return "Firestore veritabanı bulunamadı. Firebase Console'da (Firestore Database) bir veritabanı oluşturduğundan emin ol.";
  }
  if (code === "unavailable" || normalized.includes("network") || normalized.includes("connection")) {
    return "Firebase'e ulaşılamıyor (ağ hatası). İnternet bağlantını kontrol et.";
  }
  if (code === "cancelled") {
    return "İstek zaman aşımına uğradı. Bağlantını kontrol edip tekrar dene.";
  }
  return `Firebase hatası: ${message.slice(0, 300)}`;
}

/**
 * Firestore isteklerine zaman aşımı ekler.
 * Ağ sorunlarında SDK uzun süre bekleyebilir; bu bizi sonsuza dek beklemekten kurtarır.
 */
function withTimeout<T>(promise: Promise<T>, ms = 20_000): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    const timer = setTimeout(() => {
      reject(new Error("Zaman aşımı (20 sn). Firebase'e ulaşılamadı — bağlantıyı ve kuralları kontrol et."));
    }, ms);
    promise.then(
      (value) => {
        clearTimeout(timer);
        resolve(value);
      },
      (err) => {
        clearTimeout(timer);
        reject(err);
      },
    );
  });
}

function toProject(id: string, data: Record<string, unknown>): Project {
  return {
    id,
    name: String(data.name ?? "Adsız Proje"),
    files: (data.files as Record<string, string>) ?? {},
    createdAt: Number((data.createdAt as { seconds?: number })?.seconds ?? Date.now() / 1000) * 1000,
    updatedAt: Number((data.updatedAt as { seconds?: number })?.seconds ?? Date.now() / 1000) * 1000,
  };
}

export async function createProject(uid: string, name: string, files: Record<string, string>): Promise<Project> {
  const { db } = getFirebase();
  const ref = await withTimeout(
    addDoc(collection(db, "projects"), {
      ownerId: uid,
      name,
      files,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    }),
  );
  return { id: ref.id, name, files, createdAt: Date.now(), updatedAt: Date.now() };
}

export async function saveProject(project: Project, uid: string): Promise<void> {
  const { db } = getFirebase();
  const ref = doc(db, "projects", project.id);
  await withTimeout(
    updateDoc(ref, {
      ownerId: uid,
      name: project.name,
      files: project.files,
      updatedAt: serverTimestamp(),
    }),
  );
}

export async function deleteProject(projectId: string): Promise<void> {
  const { db } = getFirebase();
  await withTimeout(deleteDoc(doc(db, "projects", projectId)));
}

export async function loadProject(projectId: string): Promise<Project | null> {
  const { db } = getFirebase();
  const snap = await withTimeout(getDoc(doc(db, "projects", projectId)));
  if (!snap.exists()) return null;
  return toProject(snap.id, snap.data());
}

export function subscribeProjects(
  uid: string,
  onUpdate: (projects: ProjectListItem[]) => void,
  onError?: (message: string) => void,
): Unsubscribe {
  const { db } = getFirebase();
  // orderBy Firestore'da bileşik index gerektirir; sıralama istemci tarafında yapılır.
  // orderBy Firestore'da bileşik index gerektirir; sıralama istemci tarafında yapılır.
  const q = query(collection(db, "projects"), where("ownerId", "==", uid));
  return onSnapshot(
    q,
    (snap) => {
      const items: ProjectListItem[] = snap.docs
        .map((d) => {
          const data = d.data();
          return {
            id: d.id,
            name: String(data.name ?? "Adsız Proje"),
            fileCount: Object.keys((data.files as Record<string, string>) ?? {}).length,
            updatedAt: Number((data.updatedAt as { seconds?: number })?.seconds ?? 0) * 1000,
          };
        })
        .sort((a, b) => b.updatedAt - a.updatedAt);
      onUpdate(items);
    },
    (err) => {
      if (onError) onError(describeFirestoreError(err));
    },
  );
}
