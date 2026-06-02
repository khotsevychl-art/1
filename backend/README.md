# Student Cabinet Backend — ЛР3 SQLite

Backend для застосунку “Кабінет студента”.

Стек: **Node.js + Express + TypeScript + SQLite**. ORM не використовується.

## Запуск

```bash
cd backend
npm install
npm run dev
```

Production-збірка:

```bash
npm run build
npm start
```

Ручний запуск seed:

```bash
npm run seed
```

Сервер запускається тут:

```txt
http://localhost:3000
```

Файл бази SQLite:

```txt
data/app.db
```

## Ініціалізація БД і міграції

Перед стартом сервера `src/server.ts` викликає `initDatabase()` із файлу `src/infrastructure/db.ts`.

`initDatabase()` виконує:

1. `PRAGMA foreign_keys = ON` — вмикає перевірку зовнішніх ключів у SQLite.
2. Створює таблицю `schema_migrations`, якщо її ще немає.
3. Запускає SQL-міграції із папки `src/migrations`, якщо вони ще не застосовані.
4. Запускає seed-дані.

Файли міграцій:

- `src/migrations/001_init.sql` — створення таблиць `users`, `courses`, `notes`.
- `src/migrations/002_indexes.sql` — індекси для пошуку й сортування.

## Схема БД

### users

- `id TEXT PRIMARY KEY`
- `name TEXT NOT NULL CHECK(length(name) >= 2)`
- `created_at TEXT NOT NULL`

### courses

- `id TEXT PRIMARY KEY`
- `name TEXT NOT NULL UNIQUE CHECK(length(name) >= 2)`

### notes

- `id TEXT PRIMARY KEY`
- `user_id TEXT NOT NULL`
- `course_id TEXT NOT NULL`
- `title TEXT NOT NULL CHECK(length(title) >= 3)`
- `note TEXT NOT NULL UNIQUE CHECK(length(note) >= 5)`
- `created_at TEXT NOT NULL`
- `FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE RESTRICT`
- `FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE RESTRICT`

`ON DELETE RESTRICT` означає, що курс або користувача не можна видалити, якщо до них прив’язані нотатки. У такому випадку API повертає `409 CONFLICT`.

## Індекси

Індекси описані в `src/migrations/002_indexes.sql`:

- `idx_notes_course_id` — для швидшої фільтрації нотаток за курсом.
- `idx_notes_user_id` — для швидшої фільтрації нотаток за користувачем.
- `idx_notes_created_at` — для швидшого сортування за датою створення.
- `idx_notes_title` — для пошуку/сортування за назвою.

## API endpoints

### Notes

```txt
GET    /api/notes
GET    /api/notes/:id
POST   /api/notes
PUT    /api/notes/:id
PATCH  /api/notes/:id
DELETE /api/notes/:id
GET    /api/notes/with-relations
GET    /api/notes/search
GET    /api/notes/stats
```

### Courses

```txt
GET    /api/courses
GET    /api/courses/:id
POST   /api/courses
PUT    /api/courses/:id
PATCH  /api/courses/:id
DELETE /api/courses/:id
```

### Users

```txt
GET    /api/users
GET    /api/users/:id
POST   /api/users
PUT    /api/users/:id
PATCH  /api/users/:id
DELETE /api/users/:id
```

## Приклади запитів

### Отримати нотатки з фільтрацією, сортуванням і пагінацією

```bash
curl "http://localhost:3000/api/notes?courseId=1&sort=created_at&order=DESC&page=1&pageSize=3"
```

У цьому запиті в SQL є `WHERE + ORDER BY + LIMIT`.

### Створити нотатку

```bash
curl -X POST "http://localhost:3000/api/notes" \
  -H "Content-Type: application/json" \
  -d "{\"courseId\":\"1\",\"title\":\"Інтеграли\",\"note\":\"Повторити методи інтегрування\"}"
```

Після створення повертається статус `201 Created`.

### Отримати нотатку за id

```bash
curl "http://localhost:3000/api/notes/seed-note-1"
```

Якщо id не існує, повертається `404 NOT_FOUND`.

### JOIN endpoint

```bash
curl "http://localhost:3000/api/notes/with-relations?courseId=1&sort=created_at&order=DESC&page=1&pageSize=5"
```

Цей endpoint повертає нотатку разом із назвою курсу і користувачем.

### Виразний JOIN + WHERE + ORDER BY + LIMIT

```bash
curl "http://localhost:3000/api/notes/search?q=модель&courseId=2&sort=created_at&order=DESC&page=1&pageSize=5"
```

У цьому endpoint є `JOIN`, `WHERE`, `ORDER BY`, `LIMIT`.

### Статистика / агрегація

```bash
curl "http://localhost:3000/api/notes/stats"
```

Тут використовується `COUNT`, `SUM`, `AVG`.

## Формат помилок

Усі помилки повертаються в одному форматі:

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid request",
    "details": "title must be at least 3 characters"
  }
}
```

Основні статуси:

- `201 Created` — ресурс створено.
- `204 No Content` — ресурс видалено.
- `400 Bad Request` — некоректне тіло запиту.
- `404 Not Found` — ресурс не знайдено.
- `409 Conflict` — порушення унікальності або зовнішнього ключа.
- `500 Internal Server Error` — неочікувана помилка.

## Структура проєкту

```txt
src/
├── app.ts
├── server.ts
├── controllers/
├── dto/
├── errors/
├── infrastructure/
│   ├── db.ts
│   ├── migrations.ts
│   └── seed.ts
├── middleware/
├── migrations/
│   ├── 001_init.sql
│   └── 002_indexes.sql
├── routes/
├── services/
├── store/
└── utils/
```

SQL-запити ізольовані в `src/store`, контролери відповідають тільки за HTTP-рівень, а бізнес-логіка знаходиться в `src/services`.
