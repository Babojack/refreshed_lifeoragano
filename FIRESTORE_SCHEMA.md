# Firestore Schema – refreshed_lifeoragano

Datenbankstruktur für Firebase Firestore (an Base44-Entitäten angelehnt).  
Jedes Dokument enthält `userId` (oder liegt unter `users/{userId}/...`), damit pro User getrennt gelesen/geschrieben werden kann.

---

## 1. Firebase-Projekt anlegen

1. **Firebase Console:** https://console.firebase.google.com  
2. **Projekt erstellen** (z. B. „refreshed-lifeoragano“)  
3. **Firestore Database** → „Create database“ → Modus **Production** oder Test, Region wählen  
4. **Authentication** (optional, falls du später Firebase Auth nutzen willst): „Get started“  
5. **Web-App hinzufügen:** Projektübersicht → </> → App-Nickname → „Firebase Hosting“ optional  
   → Config kopieren und in `.env.local` als `VITE_FIREBASE_*` eintragen (siehe `src/lib/firebase.js`)

---

## 2. Collections (Struktur)

Alle IDs sind Firestore-auto-IDs (oder du nutzt eigene String-IDs).  
`userId` = eindeutige User-Kennung (z. B. Base44 User-ID oder Firebase Auth UID).

### `users` (oder als Subcollection: `users/{userId}`)

Einstellungen und Telegram-Verknüpfung.

| Feld | Typ | Beschreibung |
|------|-----|--------------|
| `telegram_chat_id` | string | Telegram Chat-ID (für Bot-Nachrichten) |
| `telegram_manager_enabled` | boolean | Telegram Manager ein/aus |
| `telegram_manager_time` | string | Zeit für tägliche Nachricht (z. B. "09:00") |
| `name` | string | Anzeigename |
| `goal` | string | Lebensziel / Fokus (für AI) |

---

### `projects`

Projekte (wie Base44 `Project`).

| Feld | Typ |
|------|-----|
| `userId` | string |
| `title` | string |
| `description` | string |
| `color` | string |
| `status` | string (active \| completed \| archived) |
| `is_favorite` | boolean |
| `cover_image` | string (URL) |
| `due_date` | string (ISO date) |
| `created_date` | timestamp |

**Firestore-Pfad:** `projects` mit Query `where("userId", "==", userId)`  
oder Subcollection: `users/{userId}/projects`

---

### `tasks`

Aufgaben (Projekt oder Goal zugeordnet).

| Feld | Typ |
|------|-----|
| `userId` | string |
| `project_id` | string (optional) |
| `goal_id` | string (optional) |
| `title` | string |
| `description` | string |
| `status` | string (todo \| in_progress \| done) |
| `priority` | string (low \| medium \| high) |
| `due_date` | string |
| `created_date` | timestamp |

Subtasks: entweder `project_id` wie `"subtask:{parentTaskId}"` (wie Base44) oder eigene Subcollection `tasks/{taskId}/subtasks`.

**Firestore:** `tasks` mit `where("userId", "==", userId)` oder `users/{userId}/tasks`

---

### `goals`

Ziele (wie Base44 `Goal`).

| Feld | Typ |
|------|-----|
| `userId` | string |
| `title` | string |
| `description` | string |
| `category` | string |
| `target_date` | string |
| `progress` | number (0–100) |
| `status` | string (active \| paused \| completed) |
| `is_favorite` | boolean |
| `cover_image` | string |
| `created_date` | timestamp |

**Firestore:** `goals` mit `where("userId", "==", userId)` oder `users/{userId}/goals`

---

### `mood_entries`

Stimmung / Mood (wie Base44 `MoodEntry`).

| Feld | Typ |
|------|-----|
| `userId` | string |
| `date` | string (ISO date) |
| `mood` | string (great \| good \| okay \| bad \| terrible) |
| `mood_score` | number (1–5) |
| `energy` | string/number |
| `sleep` | string |
| `stress` | string |
| `emotion_tags` | array |
| `note` | string |
| `created_date` | timestamp |

**Firestore:** `mood_entries` mit `where("userId", "==", userId)` oder `users/{userId}/mood_entries`

---

### `focus_modules`

„Worauf bin ich im Leben fokussiert?“ (wie Base44 `FocusModule`).

| Feld | Typ |
|------|-----|
| `userId` | string |
| `slot` | number (1, 2, 3, …) |
| `title` | string |
| `description` | string |
| (weitere Felder je nach App) | |

**Firestore:** `focus_modules` mit `where("userId", "==", userId)` oder `users/{userId}/focus_modules`

---

## 3. Security Rules (Beispiel)

In Firebase Console → Firestore → Rules einfügen. Oder Datei `firestore.rules` im Projekt verwenden und mit `firebase deploy --only firestore:rules` deployen.

Wichtig: Bei **create** existiert `resource` nicht, nur `request.resource`. Daher sind `read` / `create` / `update, delete` getrennt.

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    match /projects/{docId} {
      allow read: if request.auth != null && resource.data.userId == request.auth.uid;
      allow create: if request.auth != null && request.resource.data.userId == request.auth.uid;
      allow update, delete: if request.auth != null && resource.data.userId == request.auth.uid;
    }
    match /tasks/{docId} {
      allow read: if request.auth != null && resource.data.userId == request.auth.uid;
      allow create: if request.auth != null && request.resource.data.userId == request.auth.uid;
      allow update, delete: if request.auth != null && resource.data.userId == request.auth.uid;
    }
    match /goals/{docId} {
      allow read: if request.auth != null && resource.data.userId == request.auth.uid;
      allow create: if request.auth != null && request.resource.data.userId == request.auth.uid;
      allow update, delete: if request.auth != null && resource.data.userId == request.auth.uid;
    }
    match /mood_entries/{docId} {
      allow read: if request.auth != null && resource.data.userId == request.auth.uid;
      allow create: if request.auth != null && request.resource.data.userId == request.auth.uid;
      allow update, delete: if request.auth != null && resource.data.userId == request.auth.uid;
    }
    match /focus_modules/{docId} {
      allow read: if request.auth != null && resource.data.userId == request.auth.uid;
      allow create: if request.auth != null && request.resource.data.userId == request.auth.uid;
      allow update, delete: if request.auth != null && resource.data.userId == request.auth.uid;
    }
    match /feed_posts/{docId} {
      allow read: if request.auth != null;
      allow create: if request.auth != null && request.resource.data.userId == request.auth.uid;
      allow update, delete: if request.auth != null && resource.data.userId == request.auth.uid;
    }
    match /comments/{docId} {
      allow read: if request.auth != null;
      allow create: if request.auth != null && request.resource.data.userId == request.auth.uid;
      allow update, delete: if request.auth != null && resource.data.userId == request.auth.uid;
    }
    match /habits/{docId} {
      allow read: if request.auth != null && resource.data.userId == request.auth.uid;
      allow create: if request.auth != null && request.resource.data.userId == request.auth.uid;
      allow update, delete: if request.auth != null && resource.data.userId == request.auth.uid;
    }
  }
}
```

Wenn du **ohne** Firebase Auth arbeitest (z. B. nur Base44-Auth), kannst du vorübergehend `allow read, write: if true;` setzen und später durch echte `userId`-Checks ersetzen.

---

## 4. Nächste Schritte

- **App-Migration:** Seiten (Projects, Goals, Tasks, Mood) von Base44 auf Firestore umstellen (`src/lib/firebase.js` + diese Collections).  
- **Telegram + AI:** Cloud Function liest diese Daten (oder bekommt sie vom Frontend), sendet an Claude, schickt Ergebnis per Telegram (siehe `functions/` und TelegramManager).
