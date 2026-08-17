import { initializeApp, getApps } from "firebase/app";
import { getAuth, type Auth } from "firebase/auth";
import { getFirestore, type Firestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyDxu5I-_gfftKbUb-5HcPpYIO27hx9h-3Q",
  authDomain: "zelixvary-code-studio.firebaseapp.com",
  projectId: "zelixvary-code-studio",
  storageBucket: "zelixvary-code-studio.firebasestorage.app",
  messagingSenderId: "211829915361",
  appId: "1:211829915361:web:6c04ce4f61d7101e0801a0",
  measurementId: "G-F0P50ZBR7G",
};

function createClient() {
  const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
  const auth: Auth = getAuth(app);
  const db: Firestore = getFirestore(app);
  return { app, auth, db };
}

declare global {
  interface Window {
    __zelixvary_firebase__?: ReturnType<typeof createClient>;
  }
}

export function getFirebase() {
  if (typeof window === "undefined") {
    throw new Error("Firebase yalnızca istemcide kullanılabilir.");
  }
  if (!window.__zelixvary_firebase__) {
    window.__zelixvary_firebase__ = createClient();
  }
  return window.__zelixvary_firebase__;
}
