# Netlify-Deployment

## Firebase-Umgebungsvariablen (Pflicht)

Damit die App auf Netlify funktioniert, müssen die Firebase-Variablen **im Netlify-Dashboard** gesetzt werden. Vite baut sie beim **Build** in die App ein – ohne sie erscheint „Firebase nicht konfiguriert“.

### Schritte

1. **Netlify** → deine Site → **Site configuration** → **Environment variables**
2. **Add a variable** (oder **Add from .env** wenn du eine Datei hast)
3. Diese **7 Variablen** eintragen (Werte aus der [Firebase Console](https://console.firebase.google.com) → Projekt → ⚙️ Project settings → Your apps → Web-App-Config):

| Key | Beispiel (ersetze durch deine Werte) |
|-----|--------------------------------------|
| `VITE_FIREBASE_API_KEY` | `AIzaSy...` |
| `VITE_FIREBASE_AUTH_DOMAIN` | `dein-projekt.firebaseapp.com` |
| `VITE_FIREBASE_PROJECT_ID` | `dein-projekt-id` |
| `VITE_FIREBASE_STORAGE_BUCKET` | `dein-projekt.firebasestorage.app` |
| `VITE_FIREBASE_MESSAGING_SENDER_ID` | z.B. `301071454925` |
| `VITE_FIREBASE_APP_ID` | `1:301071454925:web:...` |
| `VITE_FIREBASE_MEASUREMENT_ID` | `G-XXXXXXXXXX` (optional) |

4. **Save**
5. **Deploys** → **Trigger deploy** → **Clear cache and deploy site** (damit ein neuer Build mit den Variablen läuft)

Erst nach dem **neuen Deploy** sind die Werte in der gebauten App enthalten.
