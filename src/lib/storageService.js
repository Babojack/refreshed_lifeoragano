/**
 * Firebase Storage – Upload von Bildern (Feed, etc.)
 */
import { getStorageBucket } from "./firebase";
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";

/**
 * Lädt eine Datei in Firebase Storage hoch und gibt die Download-URL zurück.
 * @param {string} userId – Firebase Auth UID
 * @param {File} file – Bilddatei
 * @param {string} folder – Ordner (z. B. "feed", "mood")
 * @returns {Promise<string|null>} – Download-URL oder null
 */
export async function uploadImage(userId, file, folder = "feed") {
  const storage = getStorageBucket();
  if (!storage || !userId || !file) return null;
  const name = `${Date.now()}_${(file.name || "image").replace(/[^a-zA-Z0-9.-]/g, "_")}`;
  const path = `${folder}/${userId}/${name}`;
  const storageRef = ref(storage, path);
  await uploadBytesResumable(storageRef, file);
  const url = await getDownloadURL(storageRef);
  return url;
}
