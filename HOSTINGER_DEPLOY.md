# Деплой на Hostinger

Этот проект — **статическое SPA** (Vite + React). На Hostinger загружаешь только папку **`dist/`** после сборки.

---

## 1. Сборка проекта локально

У тебя уже есть Firebase в `.env.local`. **Перед сборкой** убедись, что в корне проекта есть `.env.local` с переменными:

- `VITE_FIREBASE_API_KEY`
- `VITE_FIREBASE_AUTH_DOMAIN`
- `VITE_FIREBASE_PROJECT_ID`
- `VITE_FIREBASE_STORAGE_BUCKET`
- `VITE_FIREBASE_MESSAGING_SENDER_ID`
- `VITE_FIREBASE_APP_ID`
- `VITE_FIREBASE_MEASUREMENT_ID` (опционально)

Затем выполни:

```bash
npm install
npm run build
```

В папке **`dist/`** появятся готовые файлы для хостинга.

---

## 2. Загрузка на Hostinger

1. Зайди в **Hostinger** → **hPanel** → **Файловый менеджер** (или подключись по **FTP**).
2. Открой папку **`public_html`** (корень сайта).
3. **Удали** из `public_html` всё лишнее (если это новый сайт).
4. **Загрузи всё содержимое** папки **`dist/`** (не саму папку `dist`, а файлы **внутри**):
   - `index.html` — в корень `public_html`
   - папка `assets/` — в `public_html/assets/`
   - файл `.htaccess` — в корень `public_html` (уже лежит в `public/` и копируется в `dist/` при сборке)

Итог: в `public_html` должны быть `index.html`, `.htaccess` и папка `assets/`.

---

## 3. Проверка

- Открой свой домен в браузере.
- Перейди по внутренним ссылкам (например `/Tasks`, `/Goals`) и обнови страницу — не должно быть 404. За это отвечает `.htaccess`.

---

## 4. Важно

- **Переменные окружения** (Firebase) подставляются **на этапе сборки** (`npm run build`). На Hostinger их отдельно указывать не нужно, если ты собрал проект с уже настроенным `.env.local`.
- Если позже сменишь ключи Firebase — заново сделай `npm run build` и снова залей содержимое `dist/` в `public_html`.
- В **Firebase Console** → **Authentication** → **Authorized domains** добавь свой домен Hostinger (например `tvoi-domen.com`), иначе логин не сработает.

---

## Кратко

| Шаг | Действие |
|-----|----------|
| 1 | Локально: `npm run build` |
| 2 | Загрузить **содержимое** `dist/` в `public_html` на Hostinger |
| 3 | В Firebase добавить домен в Authorized domains |

Готово.
