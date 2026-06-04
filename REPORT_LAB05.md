# Лабораторна робота №5 — уразливості і захист

Проєкт виконаний на основі архіву `1_4`. Основна сутність для перевірки безпеки — **навчальні нотатки** (`notes`). Для IDOR поле `user_id` використовується як власник ресурсу (`ownerUserId` / еквівалент). Поточний користувач визначається на бекенді через заголовок `X-Demo-UserId`.

## Що реалізовано за методичкою

| Вимога | Як виконано в коді |
|---|---|
| Усі 4 сценарії: SQLi, XSS, IDOR, Misconfiguration | Описані нижче, перевірки винесені в `SECURITY_REGRESSION.http` |
| Бекенд на TypeScript | `backend/src/**/*.ts` |
| API версія | `/api/v1/...` у `backend/src/app.ts` |
| `X-Demo-UserId` | middleware `backend/src/middleware/demoAuth.ts` |
| Немає заголовка → 401 | `demoAuth.ts` повертає `UNAUTHORIZED` |
| Невалідний/невідомий користувач → 401 | `demoAuth.ts` перевіряє формат і наявність користувача в БД |
| Перевірка власника на бекенді | `notes.service.ts` + `notes.store.ts`, запити `WHERE id = ? AND user_id = ?` |
| Access control на read/update/delete | `GET /notes/:id`, `PUT/PATCH /notes/:id`, `DELETE /notes/:id` працюють тільки для власника |
| SQLi виправлено параметризацією | `notes.store.ts`, `users.store.ts`, `courses.store.ts`: значення передаються через `?` |
| Безпечне сортування | `notes.controller.ts` перевіряє `sortBy`; у `notes.store.ts` є allowlist `sortMap` |
| XSS виправлено безпечним рендером | `frontend/src/ui.ts`: `createElement`, `textContent`, `appendChild`, без вставки user input через `innerHTML` |
| Єдиний формат помилок | `backend/src/middleware/errorMiddleware.ts` + `ApiError` |
| Помилки показуються на frontend | `frontend/src/apiClient.ts`, `frontend/src/ui.ts`, `showFieldErrors()` |
| Security headers | `backend/src/middleware/securityHeaders.ts` |
| CORS без `*` | `backend/src/infrastructure/cors.ts`, дозволені тільки localhost origins |
| Security regression набір | `SECURITY_REGRESSION.http` |
| Принцип найменших привілеїв | список/деталі/зв'язки/статистика нотаток фільтруються за currentUserId |

---

## Сценарій A — SQL Injection

### Було / уразливо
Небезпечний підхід для пошуку міг виглядати так:

```ts
const q = req.query.search;
const sql = `SELECT * FROM notes WHERE title LIKE '%${q}%'`;
```

У такому випадку ввід користувача стає частиною SQL-коду. Наприклад, рядок `' OR '1'='1` міг змінити логіку запиту.

### Відтворення
Небезпечний тестовий ввід:

```text
' OR '1'='1
```

Запит для перевірки:

```http
GET http://localhost:3000/api/v1/notes?search=' OR '1'='1
X-Demo-UserId: 1
```

### Виправлення
У `backend/src/store/notes.store.ts` пошук реалізовано через параметри:

```ts
where.push("(LOWER(title) LIKE ? OR LOWER(note) LIKE ?)");
values.push(`%${params.search.toLowerCase()}%`, `%${params.search.toLowerCase()}%`);
```

Тобто ввід користувача передається як значення, а не як SQL-код.

Для сортування використано allowlist, бо назви колонок не можна передавати як звичайні SQL-параметри:

```ts
const sortMap: Record<string, string> = {
  title: "title",
  createdAt: "created_at",
  courseId: "course_id",
};
```

У `backend/src/controllers/notes.controller.ts` невалідний `sortBy` повертає 400.

### Перевірка
Після виправлення рядок `' OR '1'='1` сприймається як звичайний текст пошуку і не повертає чужі/зайві записи. Нормальний пошук продовжує працювати.

---

## Сценарій Б — XSS

### Було / уразливо
Небезпечний підхід:

```ts
row.innerHTML = `<td>${note.title}</td><td>${note.note}</td>`;
```

Якщо користувач вводить HTML/JS, браузер може сприйняти це як розмітку.

### Відтворення
Тестовий ввід для нотатки:

```html
<img src=x onerror=alert('xss')>
```

### Виправлення
У `frontend/src/ui.ts` дані користувача вставляються тільки як текст:

```ts
const cell = document.createElement("td");
cell.textContent = field;
row.appendChild(cell);
```

Так само для деталей, зв'язків, статистики і карток користувачів використано `textContent`, `createElement`, `appendChild`.

### Перевірка
Після виправлення введений HTML/JS не виконується, а показується як звичайний текст. UI не ламається, список нотаток і деталі продовжують працювати.

---

## Сценарій В — Broken Access Control / IDOR

### Було / уразливо
Небезпечний підхід:

```ts
SELECT * FROM notes WHERE id = ?
```

Тоді користувач міг підставити id чужої нотатки і отримати доступ.

### Відтворення
У seed-даних є дві демонстраційні нотатки:

```text
demo-note-user-1 — належить user 1
demo-note-user-2 — належить user 2
```

Спроба user 1 прочитати чужу нотатку:

```http
GET http://localhost:3000/api/v1/notes/demo-note-user-2
X-Demo-UserId: 1
```

### Виправлення
У `backend/src/middleware/demoAuth.ts` бекенд визначає поточного користувача з заголовка:

```ts
const userId = req.header("X-Demo-UserId");
```

У `backend/src/store/notes.store.ts` доступ до конкретної нотатки перевіряється через власника:

```ts
SELECT * FROM notes WHERE id = ? AND user_id = ?
```

Оновлення і видалення також захищені:

```ts
UPDATE notes SET ... WHERE id = ? AND user_id = ?
DELETE FROM notes WHERE id = ? AND user_id = ?
```

### Перевірка
- Немає `X-Demo-UserId` → 401.
- Невідомий користувач → 401.
- User 1 читає `demo-note-user-1` → успішно.
- User 1 читає `demo-note-user-2` → 404.
- User 1 не може оновити або видалити `demo-note-user-2` → 404.

Обрано 404, щоб не розкривати, чи існує чужий ресурс.

---

## Сценарій Г — Security Misconfiguration

### Було / уразливо
Проблеми конфігурації можуть бути такими:

- CORS дозволяє всіх через `*`;
- у відповіді видно stack trace або внутрішні деталі;
- немає базових security headers;
- помилки повертаються у різному форматі.

### Виправлення
У `backend/src/middleware/securityHeaders.ts` додано заголовки:

```ts
X-Content-Type-Options: nosniff
X-Frame-Options: DENY
Referrer-Policy: no-referrer
Permissions-Policy: camera=(), microphone=(), geolocation=()
```

У `backend/src/infrastructure/cors.ts` CORS обмежений конкретними origin:

```ts
http://localhost:5500
http://127.0.0.1:5500
http://localhost:5173
http://127.0.0.1:5173
```

У `backend/src/middleware/errorMiddleware.ts` помилки повертаються в одному форматі:

```json
{
  "status": 400,
  "code": "VALIDATION_ERROR",
  "message": "Invalid data",
  "detail": "...",
  "errors": {}
}
```

### Перевірка
Перевірити headers можна командою:

```bash
curl -i http://localhost:3000/api/v1/health
```

Очікувано у відповіді є:

```text
X-Content-Type-Options: nosniff
X-Frame-Options: DENY
Referrer-Policy: no-referrer
Permissions-Policy: camera=(), microphone=(), geolocation=()
```

---

## Таблиця «ризик → наслідок → виправлення»

| Сценарій | Ризик | Наслідок | Виправлення |
|---|---|---|---|
| SQL Injection | Користувацький ввід може змінити SQL | Витік або неправильна вибірка даних | Параметризовані запити + allowlist для sortBy |
| XSS | HTML/JS із даних користувача може виконатися в браузері | Зміна DOM, виконання небезпечного коду | `textContent` і DOM API замість небезпечного `innerHTML` |
| IDOR | Користувач може підставити чужий id | Доступ до чужої нотатки | `X-Demo-UserId` + `WHERE id = ? AND user_id = ?` |
| Misconfiguration | Сервер розкриває зайве або дозволяє всім | Спрощення атаки, небезпечні відповіді | Security headers, CORS allowlist, єдиний формат помилок |

---

## Як запускати

Backend:

```bash
cd backend
npm install
npm run build
npm start
```

Frontend:

```bash
cd frontend
npm install
npm run build
npm start
```

Або відкрити frontend через локальний сервер на `http://localhost:5500`.

---

## Як перевірити

Готовий набір коротких перевірок знаходиться у файлі:

```text
SECURITY_REGRESSION.http
```

Там є сценарії для:

- 401 без `X-Demo-UserId`;
- SQLi-перевірки;
- невалідного `sortBy` → 400;
- XSS як тексту;
- IDOR read/update/delete;
- security headers.
