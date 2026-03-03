# Firebase: любой пользователь может регистрироваться и создавать профиль

В приложении уже реализовано: при **регистрации** (E-Mail/Passwort) или **входе через Google** в Firestore создаётся документ профиля `users/{uid}` (name, goal и т.д.). Чтобы это работало для **любого пользователя**, в Firebase нужно включить методы входа и настроить правила Firestore.

---

## 1. Authentication — кто может регистрироваться

1. Открой [Firebase Console](https://console.firebase.google.com) → проект **life-manager-4315f**.
2. Слева: **Build** → **Authentication** → вкладка **Sign-in method**.
3. Включи методы, через которые ты разрешаешь регистрацию:
   - **Email/Password** — включи (Enable), сохрани. Так любой сможет нажать «Konto erstellen» и завести аккаунт.
   - **Google** — включи (Enable), укажи Support email, сохрани. Так любой сможет войти через «Mit Google anmelden»; при первом входе в Firestore создаётся профиль `users/{uid}`.

Остальные провайдеры (Apple, Facebook и т.д.) можно не включать, если не нужны.

---

## 2. Firestore — правила, чтобы каждый пользователь мог создать свой профиль

Правила должны разрешать: **авторизованный пользователь может читать и писать только свой документ** `users/{userId}`. Тогда при регистрации пользователь с `request.auth.uid == userId` сможет создать/обновить свой профиль.

1. В Firebase Console: **Firestore Database** → вкладка **Rules**.
2. Убедись, что есть правило для коллекции **users**:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Каждый пользователь — только свой профиль (создание и редактирование)
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    match /projects/{docId} {
      allow read, write: if request.auth != null && resource.data.userId == request.auth.uid;
      allow create: if request.auth != null && request.resource.data.userId == request.auth.uid;
    }
    match /tasks/{docId} {
      allow read, write: if request.auth != null && resource.data.userId == request.auth.uid;
      allow create: if request.auth != null && request.resource.data.userId == request.auth.uid;
    }
    match /goals/{docId} {
      allow read, write: if request.auth != null && resource.data.userId == request.auth.uid;
      allow create: if request.auth != null && request.resource.data.userId == request.auth.uid;
    }
    match /mood_entries/{docId} {
      allow read, write: if request.auth != null && resource.data.userId == request.auth.uid;
      allow create: if request.auth != null && request.resource.data.userId == request.auth.uid;
    }
    match /focus_modules/{docId} {
      allow read, write: if request.auth != null && resource.data.userId == request.auth.uid;
      allow create: if request.auth != null && request.resource.data.userId == request.auth.uid;
    }
  }
}
```

3. Нажми **Publish**.

Итог: любой зарегистрированный пользователь может создавать и обновлять **только свой** профиль в `users/{userId}` и свои данные в tasks/goals/projects и т.д.

---

## 3. Authorized domains (если логин не срабатывает на продакшене)

Если приложение открыто не с localhost (например, с Netlify или Hostinger):

1. **Authentication** → вкладка **Settings** → блок **Authorized domains**.
2. Добавь домен, с которого идёт вход (например `deine-app.netlify.app` или `deinedomain.com`).

Без этого вход с этого домена может блокироваться.

---

## Кратко

| Где | Что сделать |
|-----|-------------|
| **Authentication → Sign-in method** | Включить **Email/Password** и **Google**, чтобы любой мог регистрироваться/входить. |
| **Firestore → Rules** | Оставить правило `users/{userId}`: `allow read, write: if request.auth != null && request.auth.uid == userId;` и опубликовать. |
| **Authentication → Authorized domains** | Добавить домен продакшена (Netlify, Hostinger и т.д.). |

После этого любой пользователь может зарегистрироваться и автоматически получить свой профиль в Firestore.
