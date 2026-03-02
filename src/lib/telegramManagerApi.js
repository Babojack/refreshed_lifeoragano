/**
 * Sammelt Daten aus Firestore und ruft die Firebase Cloud Function runTelegramAnalysis auf.
 * Kein Base44.
 */
import { getFunctions, httpsCallable } from "firebase/functions";
import { getFirebaseApp } from "@/lib/firebase";
import { collectUserDataForAnalysis } from "@/lib/firestoreService";

/**
 * Ruft die Cloud Function runTelegramAnalysis auf.
 * Daten kommen aus Firestore (collectUserDataForAnalysis(userId)).
 * @param { string } userId – Firebase Auth UID
 * @param { string } telegramChatId
 * @param { "de" | "en" } [language="de"]
 */
export async function runTelegramAnalysis(userId, telegramChatId, language = "de") {
  const app = getFirebaseApp();
  if (!app) {
    throw new Error("Firebase ist nicht konfiguriert. Bitte VITE_FIREBASE_* in .env setzen.");
  }
  const payload = await collectUserDataForAnalysis(userId);
  const functions = getFunctions(app, "europe-west1");
  const callable = httpsCallable(functions, "runTelegramAnalysis");
  const result = await callable({
    telegramChatId: String(telegramChatId),
    language: language === "en" ? "en" : "de",
    payload,
  });
  return result.data;
}
