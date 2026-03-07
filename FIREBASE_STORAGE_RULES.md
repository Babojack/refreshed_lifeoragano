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

## 3. Prüfen

- In der App: Feed → Post-Typ "Image" oder "Text" → Bild auswählen → Upload. Nach dem Upload erscheint die Vorschau; beim Klick auf POST wird der Eintrag mit Bild-URL gespeichert.
