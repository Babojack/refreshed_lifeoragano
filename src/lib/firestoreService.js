/**
 * Firestore CRUD für refreshed_lifeoragano
 * Nutzt Collections aus FIRESTORE_SCHEMA.md
 * Wenn Firebase nicht konfiguriert ist, geben alle Funktionen leere Arrays / null zurück.
 */
import {
  getFirestoreDb,
} from "./firebase";
import {
  collection,
  doc,
  getDocs,
  getDoc,
  setDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  serverTimestamp,
} from "firebase/firestore";

function getCol(name) {
  const db = getFirestoreDb();
  if (!db) return null;
  return collection(db, name);
}

function toMillis(v) {
  if (!v) return 0;
  if (typeof v === "number") return v;
  if (v instanceof Date) return v.getTime();
  if (typeof v?.toDate === "function") return v.toDate().getTime(); // Firestore Timestamp
  if (typeof v?.seconds === "number") return v.seconds * 1000;
  return 0;
}

async function safeGetDocs(primaryQuery, fallbackQuery) {
  try {
    return await getDocs(primaryQuery);
  } catch (e) {
    const code = e?.code || e?.name || "";
    // Firestore often throws failed-precondition for missing composite index.
    if (fallbackQuery && (code === "failed-precondition" || code === "FirebaseError")) {
      try {
        return await getDocs(fallbackQuery);
      } catch (_) {
        throw e;
      }
    }
    throw e;
  }
}

export async function getProjects(userId) {
  const col = getCol("projects");
  if (!col) return [];
  const primary = query(col, where("userId", "==", userId), orderBy("created_date", "desc"));
  const fallback = query(col, where("userId", "==", userId));
  const snap = await safeGetDocs(primary, fallback);
  const rows = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
  rows.sort((a, b) => toMillis(b.created_date) - toMillis(a.created_date));
  return rows;
}

export async function getTasks(userId) {
  const col = getCol("tasks");
  if (!col) return [];
  const primary = query(col, where("userId", "==", userId), orderBy("created_date", "desc"));
  const fallback = query(col, where("userId", "==", userId));
  const snap = await safeGetDocs(primary, fallback);
  const rows = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
  rows.sort((a, b) => toMillis(b.created_date) - toMillis(a.created_date));
  return rows;
}

export async function getGoals(userId) {
  const col = getCol("goals");
  if (!col) return [];
  const primary = query(col, where("userId", "==", userId), orderBy("created_date", "desc"));
  const fallback = query(col, where("userId", "==", userId));
  const snap = await safeGetDocs(primary, fallback);
  const rows = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
  rows.sort((a, b) => toMillis(b.created_date) - toMillis(a.created_date));
  return rows;
}

export async function getMoodEntries(userId, max = 30) {
  const col = getCol("mood_entries");
  if (!col) return [];
  const primary = query(
    col,
    where("userId", "==", userId),
    orderBy("date", "desc"),
    limit(max)
  );
  const fallback = query(col, where("userId", "==", userId));
  const snap = await safeGetDocs(primary, fallback);
  const rows = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
  rows.sort((a, b) => String(b.date || "").localeCompare(String(a.date || "")));
  return rows.slice(0, max);
}

export async function getFocusModules(userId) {
  const col = getCol("focus_modules");
  if (!col) return [];
  const primary = query(col, where("userId", "==", userId), orderBy("slot"));
  const fallback = query(col, where("userId", "==", userId));
  const snap = await safeGetDocs(primary, fallback);
  const rows = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
  rows.sort((a, b) => Number(a.slot || 0) - Number(b.slot || 0));
  return rows;
}

export async function getUserSettings(userId) {
  const db = getFirestoreDb();
  if (!db) return null;
  const ref = doc(db, "users", userId);
  const snap = await getDoc(ref);
  return snap.exists() ? { id: snap.id, ...snap.data() } : null;
}

export async function setUserSettings(userId, data) {
  const db = getFirestoreDb();
  if (!db) return;
  const ref = doc(db, "users", userId);
  await setDoc(ref, { ...data, updated_at: serverTimestamp() }, { merge: true });
}

// --- Projects ---
export async function createProject(userId, data) {
  const col = getCol("projects");
  if (!col) return null;
  const ref = await addDoc(col, {
    userId,
    title: data.title ?? "",
    description: data.description ?? "",
    color: data.color ?? "#E85D26",
    status: data.status ?? "active",
    is_favorite: !!data.is_favorite,
    cover_image: data.cover_image ?? "",
    due_date: data.due_date ?? "",
    created_date: serverTimestamp(),
  });
  return { id: ref.id, userId, ...data, created_date: new Date() };
}

export async function updateProject(id, data) {
  const db = getFirestoreDb();
  if (!db) return;
  await updateDoc(doc(db, "projects", id), { ...data, updated_at: serverTimestamp() });
}

export async function deleteProject(id) {
  const db = getFirestoreDb();
  if (!db) return;
  await deleteDoc(doc(db, "projects", id));
}

// --- Tasks ---
export async function createTask(userId, data) {
  const col = getCol("tasks");
  if (!col) return null;
  const ref = await addDoc(col, {
    userId,
    project_id: data.project_id ?? "",
    goal_id: data.goal_id ?? "",
    title: data.title ?? "",
    description: data.description ?? "",
    status: data.status ?? "todo",
    priority: data.priority ?? "medium",
    due_date: data.due_date ?? "",
    created_date: serverTimestamp(),
  });
  return { id: ref.id, userId, ...data, created_date: new Date() };
}

export async function updateTask(id, data) {
  const db = getFirestoreDb();
  if (!db) return;
  await updateDoc(doc(db, "tasks", id), { ...data, updated_at: serverTimestamp() });
}

export async function deleteTask(id) {
  const db = getFirestoreDb();
  if (!db) return;
  await deleteDoc(doc(db, "tasks", id));
}

export async function getTasksByProject(userId, projectId) {
  const col = getCol("tasks");
  if (!col) return [];
  const q = query(
    col,
    where("userId", "==", userId),
    where("project_id", "==", projectId),
    orderBy("created_date", "desc")
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

export async function getTasksByGoal(userId, goalId) {
  const col = getCol("tasks");
  if (!col) return [];
  const q = query(
    col,
    where("userId", "==", userId),
    where("goal_id", "==", goalId),
    orderBy("created_date", "desc")
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

// --- Goals ---
export async function createGoal(userId, data) {
  const col = getCol("goals");
  if (!col) return null;
  const ref = await addDoc(col, {
    userId,
    title: data.title ?? "",
    description: data.description ?? "",
    category: data.category ?? "",
    target_date: data.target_date ?? "",
    progress: Number(data.progress) || 0,
    status: data.status ?? "active",
    is_favorite: !!data.is_favorite,
    cover_image: data.cover_image ?? "",
    created_date: serverTimestamp(),
  });
  return { id: ref.id, userId, ...data, created_date: new Date() };
}

export async function updateGoal(id, data) {
  const db = getFirestoreDb();
  if (!db) return;
  await updateDoc(doc(db, "goals", id), { ...data, updated_at: serverTimestamp() });
}

export async function deleteGoal(id) {
  const db = getFirestoreDb();
  if (!db) return;
  await deleteDoc(doc(db, "goals", id));
}

// --- Mood entries ---
export async function createMoodEntry(userId, data) {
  const col = getCol("mood_entries");
  if (!col) return null;
  const ref = await addDoc(col, {
    userId,
    date: data.date ?? new Date().toISOString().slice(0, 10),
    mood: data.mood ?? "",
    mood_score: data.mood_score ?? 0,
    energy: data.energy ?? "",
    sleep: data.sleep ?? "",
    stress: data.stress ?? "",
    emotion_tags: data.emotion_tags ?? data.emotionTags ?? [],
    note: data.note ?? "",
    created_date: serverTimestamp(),
  });
  return { id: ref.id, userId, ...data, created_date: new Date() };
}

export async function updateMoodEntry(id, data) {
  const db = getFirestoreDb();
  if (!db) return;
  await updateDoc(doc(db, "mood_entries", id), { ...data, updated_at: serverTimestamp() });
}

export async function deleteMoodEntry(id) {
  const db = getFirestoreDb();
  if (!db) return;
  await deleteDoc(doc(db, "mood_entries", id));
}

// --- Focus modules ---
export async function createFocusModule(userId, data) {
  const col = getCol("focus_modules");
  if (!col) return null;
  const ref = await addDoc(col, {
    userId,
    slot: data.slot ?? 1,
    title: data.title ?? "",
    description: data.description ?? "",
    color: data.color ?? "#E85D26",
    created_date: serverTimestamp(),
  });
  return { id: ref.id, userId, ...data, created_date: new Date() };
}

export async function updateFocusModule(id, data) {
  const db = getFirestoreDb();
  if (!db) return;
  await updateDoc(doc(db, "focus_modules", id), { ...data, updated_at: serverTimestamp() });
}

export async function deleteFocusModule(id) {
  const db = getFirestoreDb();
  if (!db) return;
  await deleteDoc(doc(db, "focus_modules", id));
}

// --- Comments (parent_id, parent_type wie "project" oder "goal") ---
export async function getComments(parentId, parentType) {
  const col = getCol("comments");
  if (!col) return [];
  const q = query(
    col,
    where("parent_id", "==", parentId),
    where("parent_type", "==", parentType),
    orderBy("created_date", "desc")
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

export async function createComment(userId, data) {
  const col = getCol("comments");
  if (!col) return null;
  const ref = await addDoc(col, {
    userId,
    content: data.content ?? "",
    parent_id: data.parent_id ?? "",
    parent_type: data.parent_type ?? "project",
    created_by: data.created_by ?? "",
    created_date: serverTimestamp(),
  });
  return { id: ref.id, userId, ...data, created_date: new Date() };
}

export async function deleteComment(id) {
  const db = getFirestoreDb();
  if (!db) return;
  await deleteDoc(doc(db, "comments", id));
}

// --- Habits ---
export async function getHabits(userId) {
  const col = getCol("habits");
  if (!col) return [];
  const q = query(col, where("userId", "==", userId), orderBy("start_date", "asc"));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

export async function createHabit(userId, data) {
  const col = getCol("habits");
  if (!col) return null;
  const ref = await addDoc(col, {
    userId,
    title: data.title ?? "",
    emoji: data.emoji ?? "🚭",
    start_date: data.start_date ?? "",
    start_time: data.start_time ?? "00:00",
    color: data.color ?? "#E85D26",
    created_date: serverTimestamp(),
  });
  return { id: ref.id, userId, ...data, created_date: new Date() };
}

export async function deleteHabit(id) {
  const db = getFirestoreDb();
  if (!db) return;
  await deleteDoc(doc(db, "habits", id));
}

/**
 * Sammelt alle Daten für einen User (für Telegram/AI-Analyse).
 * Wenn Firestore nicht konfiguriert ist, werden leere Arrays zurückgegeben.
 */
export async function collectUserDataForAnalysis(userId) {
  const [projects, tasks, goals, moodEntries, focusModules, userSettings] = await Promise.all([
    getProjects(userId),
    getTasks(userId),
    getGoals(userId),
    getMoodEntries(userId, 14),
    getFocusModules(userId),
    getUserSettings(userId),
  ]);
  return {
    user: {
      name: userSettings?.name ?? "User",
      goal: userSettings?.goal ?? "",
    },
    projects,
    tasks,
    goals,
    mood_entries: moodEntries,
    focus_modules: focusModules,
  };
}
