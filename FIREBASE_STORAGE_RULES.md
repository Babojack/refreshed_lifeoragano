# Firebase Storage – Regeln für Bild-Upload (Feed)

Damit Foto-Uploads im Feed funktionieren, muss **Firebase Storage** aktiviert und die Regeln gesetzt werden.

## 1. Storage aktivieren

1. [Firebase Console](https://console.firebase.google.com) → dein Projekt
2. Links **Build** → **Storage** → **Get started**
3. Modus wählen (Test oder Production) und Region bestätigen

## 2. Storage-Regeln setzen

**Storage** → Tab **Rules** → folgenden Inhalt einfügen und **Publish**:

```
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /feed/{userId}/{fileName} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && request.auth.uid == userId;
    }
    match /goals/{userId}/{fileName} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && request.auth.uid == userId;
    }
    match /projects/{userId}/{fileName} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

Damit können eingeloggte Nutzer in ihren Ordnern `feed/`, `goals/` und `projects/` Bilder hochladen; andere eingeloggte Nutzer können sie lesen.

## 3. CORS für eigene Domain (z. B. orbolife.de)

Wenn die App unter einer eigenen Domain (nicht `*.web.app` / `*.firebaseapp.com`) läuft, blockiert der Browser Uploads/Downloads wegen CORS. Dann muss am **Google Cloud Storage Bucket** CORS gesetzt werden.

**Bucket-Name** aus der Fehlermeldung (z. B. `life-manager-4315f.firebasestorage.app`).

### Option A: Google Cloud Shell

1. [Google Cloud Console](https://console.cloud.google.com) → Projekt **life-manager-4315f** (oder dein Projekt) auswählen.
2. Oben **Cloud Shell** (Terminal-Symbol) öffnen.
3. Datei anlegen:
   ```bash
   cat > cors.json << 'EOF'
   [
     {
       "origin": ["https://orbolife.de", "https://www.orbolife.de", "http://localhost:5173", "http://localhost:3000"],
       "method": ["GET", "HEAD", "PUT", "POST", "DELETE", "OPTIONS"],
       "responseHeader": ["Content-Length", "Content-Type", "Content-Range", "Content-Disposition", "Authorization"],
       "maxAgeSeconds": 3600
     }
   ]
   EOF
   ```
4. CORS setzen (Bucket-Name anpassen):
   ```bash
   gsutil cors set cors.json gs://life-manager-4315f.firebasestorage.app
   ```
5. Prüfen: `gsutil cors get gs://life-manager-4315f.firebasestorage.app`

### Option B: Lokal mit gsutil

- [Google Cloud SDK](https://cloud.google.com/sdk/docs/install) installieren und `gcloud auth login` + Projekt auswählen.
- Im Projekt liegt `storage-cors.json`. Ausführen:
  ```bash
  gsutil cors set storage-cors.json gs://life-manager-4315f.firebasestorage.app
  ```
- Bucket-Name ggf. in der Firebase Console unter **Build → Storage** prüfen (oben „Bucket“).

Nach dem Setzen 1–2 Minuten warten, dann Upload von https://orbolife.de erneut testen.

## 4. Prüfen

- In der App: Feed → Post-Typ "Image" oder "Text" → Bild auswählen → Upload. Nach dem Upload erscheint die Vorschau; beim Klick auf POST wird der Eintrag mit Bild-URL gespeichert.
- Goals/Projects: Cover-Bild hochladen – ohne CORS-Fehler.
