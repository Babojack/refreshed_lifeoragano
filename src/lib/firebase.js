/**
 * Firebase (Auth + Firestore) für refreshed_lifeoragano – ohne Base44.
 * Config kommt aus .env.local (VITE_FIREBASE_*).
 */
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getAnalytics } from "firebase/analytics";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID,
};

let app = null;
let db = null;
let auth = null;
let analytics = null;

export function getFirebaseApp() {
  if (!app) {
    const hasConfig = firebaseConfig.apiKey && firebaseConfig.projectId;
    if (!hasConfig) {
      console.warn("Firebase: env vars not set (VITE_FIREBASE_*). Skipping init.");
      return null;
    }
    app = initializeApp(firebaseConfig);
    if (typeof window !== "undefined" && firebaseConfig.measurementId) {
      try {
        analytics = getAnalytics(app);
      } catch (_) {}
    }
  }
  return app;
}

export function getAnalyticsOrNull() {
  getFirebaseApp();
  return analytics ?? null;
}

export function getFirebaseAuth() {
  if (!auth) {
    const a = getFirebaseApp();
    if (!a) return null;
    auth = getAuth(a);
  }
  return auth;
}

export function getFirestoreDb() {
  if (!db) {
    const a = getFirebaseApp();
    if (!a) return null;
    db = getFirestore(a);
  }
  return db;
}

export { firebaseConfig };
