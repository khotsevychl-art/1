# ОАП ЛР4 — інтеграція фронтенду з бекендом

Проєкт дороблено під вимоги ЛР4: фронтенд і бекенд працюють окремо, взаємодія йде тільки через HTTP API, основна сутність — `notes`.

## Що реалізовано

### Backend

- API має версію `/api/v1/...`.
- Основні ендпоінти:
  - `GET /api/v1/notes` — список нотаток;
  - `GET /api/v1/notes/:id` — деталі однієї нотатки;
  - `POST /api/v1/notes` — створення;
  - `PUT /api/v1/notes/:id` — повне редагування;
  - `PATCH /api/v1/notes/:id` — часткове редагування;
  - `DELETE /api/v1/notes/:id` — видалення;
  - `GET /api/v1/courses` — список курсів.
- Додано CORS без `*`: дозволені конкретні origin фронтенду:
  - `http://localhost:5500`
  - `http://127.0.0.1:5500`
  - `http://localhost:5173`
  - `http://127.0.0.1:5173`
- Дозволені методи: `GET, POST, PUT, PATCH, DELETE, OPTIONS`.
- Дозволені заголовки: `Content-Type, Authorization`.
- Помилки повертаються в узгодженому форматі:

```json
{
  "status": 400,
  "code": "VALIDATION_ERROR",
  "title": "Invalid data",
  "message": "Invalid data",
  "detail": "Some fields are incorrect",
  "errors": {
    "title": ["Мінімум 3 символи"]
  }
}
```

- Валідація DTO:
  - `courseId` — обов'язкове поле;
  - `title` — 3–80 символів;
  - `note` — 5–1000 символів.
- SQL-запити для нотаток переведено на параметризовані запити.
- Для списку додано пагінацію, фільтрацію і сортування:
  - `page`
  - `pageSize`
  - `search`
  - `courseId`
  - `sortBy=title|createdAt|courseId`
  - `sortDir=asc|desc`

### Frontend

- Frontend переписаний на TypeScript у папці `frontend/src`.
- Зібраний JavaScript лежить у `frontend/dist`, тому сторінку можна запускати одразу через локальний сервер.
- Є окремий API-клієнт `frontend/src/apiClient.ts`.
- Усі DTO типізовані в `frontend/src/dtos.ts`.
- Реалізовані стани UI:
  - `loading` — «Завантаження...»;
  - `success` — показ таблиці;
  - `empty` — «Немає даних»;
  - `error` — видиме повідомлення з кодом і текстом помилки.
- Є CRUD через UI:
  - створення нотатки;
  - перегляд деталей;
  - редагування;
  - видалення з підтвердженням.
- Є клієнтська валідація, узгоджена з серверною.
- Після create/update/delete список оновлюється через повторний GET, без «фантомних» елементів.
- На час запиту форма блокується.
- Реалізовано AbortController:
  - автотаймаут 12 секунд;
  - кнопка «Скасувати запит».
- Для безпечних GET-запитів є простий retry для 429/503.
- Є кешування списку на фронтенді, кеш інвалідовується після create/update/delete.

## Як запустити

Після розпакування відкрий корінь проєкту, тобто папку, де лежать `backend`, `frontend` і кореневий `package.json`.

Спочатку один раз встанови залежності для обох частин:

```bash
npm run install:all
```

### 1. Backend

Перший термінал, з кореня проєкту:

```bash
npm run dev:be
```

Backend має запуститися на:

```text
http://localhost:3000
```

Перевірка:

```text
http://localhost:3000/api/v1/health
```

### 2. Frontend

Другий термінал, теж з кореня проєкту:

```bash
npm run dev:fe
```

Відкрити в браузері:

```text
http://localhost:5500
```

Важливо: не відкривати `index.html` через `file://`, бо тоді CORS і модулі можуть працювати неправильно.

## Якщо змінювався TypeScript на фронтенді

```bash
cd frontend
tsc -p tsconfig.json
```

Або, якщо TypeScript не встановлений глобально:

```bash
npm install
npm run build
```

## Приклади перевірки API

### GET список

```http
GET http://localhost:3000/api/v1/notes?page=1&pageSize=5&sortBy=createdAt&sortDir=desc
```

Очікування: статус `200`, відповідь містить `data` і `meta`.

### GET деталі

```http
GET http://localhost:3000/api/v1/notes/<id>
```

Очікування: статус `200`, відповідь містить один об'єкт у `data`.

### POST створення

```http
POST http://localhost:3000/api/v1/notes
Content-Type: application/json

{
  "courseId": "1",
  "title": "Нова нотатка",
  "note": "Текст нової нотатки"
}
```

Очікування: статус `201`, нова нотатка повертається в `data`.

### PUT редагування

```http
PUT http://localhost:3000/api/v1/notes/<id>
Content-Type: application/json

{
  "courseId": "1",
  "title": "Оновлена нотатка",
  "note": "Оновлений текст нотатки"
}
```

Очікування: статус `200`, оновлена нотатка повертається в `data`.

### DELETE видалення

```http
DELETE http://localhost:3000/api/v1/notes/<id>
```

Очікування: статус `204`.

### Помилка валідації 400

```http
POST http://localhost:3000/api/v1/notes
Content-Type: application/json

{
  "courseId": "",
  "title": "a",
  "note": "b"
}
```

Очікування: статус `400`, відповідь містить `code: VALIDATION_ERROR` і `errors` по полях.

### Помилка 404

```http
GET http://localhost:3000/api/v1/notes/not-existing-id
```

Очікування: статус `404`, відповідь містить `code: NOTE_NOT_FOUND`.

### Перевірка CORS у браузері

1. Запустити backend на `http://localhost:3000`.
2. Запустити frontend на `http://localhost:5500`.
3. Відкрити DevTools → Network.
4. Натиснути «Оновити» або створити нотатку.
5. Для POST/PUT/DELETE може з'явитися `OPTIONS` preflight.
6. У відповідях мають бути заголовки:
   - `Access-Control-Allow-Origin: http://localhost:5500`
   - `Access-Control-Allow-Methods: GET,POST,PUT,PATCH,DELETE,OPTIONS`
   - `Access-Control-Allow-Headers: Content-Type,Authorization`

## Правила сумісності DTO

1. У `/api/v1` не перейменовуємо і не видаляємо поля, які вже використовує фронтенд: `id`, `courseId`, `title`, `note`, `createdAt`.
2. Нові поля додаються тільки як необов'язкові або з дефолтами. Приклад: `priority?: "normal"`.
3. Breaking changes робляться тільки в новій версії API, наприклад `/api/v2`.
4. Frontend має дефолти для відсутніх значень, наприклад показує `—` або `(без назви)`.

## Команди для Git

```bash
git add .
git commit -m "Complete lab 4 frontend backend integration"
git tag 0.4.0
git push
git push origin 0.4.0
```

## Що реалізовано на фронтенді після доробки

Фронтенд тепер використовує всі наявні користувацькі API без створення нових таблиць:

- `GET /api/v1/notes` — список нотаток з пошуком, фільтром за курсом, сортуванням і пагінацією.
- `GET /api/v1/notes/:id` — деталі однієї нотатки через кнопку «Деталі».
- `POST /api/v1/notes` — створення нотатки через форму.
- `PUT /api/v1/notes/:id` — повне редагування нотатки через кнопку «Редагувати» і форму.
- `PATCH /api/v1/notes/:id` — часткове редагування назви через кнопку «PATCH назву».
- `DELETE /api/v1/notes/:id` — видалення нотатки з підтвердженням.
- `GET /api/v1/notes/relations` — таблиця нотаток з назвами користувача і курсу.
- `GET /api/v1/notes/stats` — статистика кількості нотаток по курсах.
- `GET /api/v1/courses` — завантаження курсів у фільтр і форму.
- `GET /api/v1/users` — список користувачів.
- `POST /api/v1/users` — створення користувача через окрему форму.

Запуск лишається з кореня проєкту:

```bash
npm run dev:be
npm run dev:fe
```
