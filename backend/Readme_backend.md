# Кабінет студента — REST API (Node.js + Express + TypeScript + SQLite)

## Загальна інформація

Проєкт реалізує REST API для кабінету студента, де користувач може створювати та керувати навчальними нотатками, прив’язаними до курсів.

Дані зберігаються в SQLite локально без використання ORM.

---

## Технології

- Node.js
- Express
- TypeScript
- SQLite (sqlite3)
- ts-node-dev
- SQL migrations (без ORM)

---

## Структура проєкту


src/
├── controllers/
├── services/
├── store/
├── domain/
├── infrastructure/
│ ├── db.ts
│ ├── migrate.ts
│ ├── seed.ts
│ ├── validation.ts
│ ├── migrations/
│ │ ├── 001_init.sql
│ │ ├── 002_indexes.sql
├── middleware/
├── app.ts
└── server.ts


---

## Запуск проєкту

### Встановлення залежностей
```bash
npm install
Запуск сервера
npm run dev
Сервер доступний
http://localhost:3000
База даних

SQLite файл створюється локально:

/data/app.db

Міграції

Проєкт використовує спрощені міграції без ORM.

Структура:
infrastructure/migrations/
  001_init.sql
  002_indexes.sql
Логіка:
при старті застосунку перевіряється таблиця schema_migrations
виконуються тільки нові міграції
застосовані міграції записуються в schema_migrations
Схема бази даних
Таблиці

users

id (TEXT, PRIMARY KEY)
name (TEXT, NOT NULL)

courses

id (TEXT, PRIMARY KEY)
name (TEXT, NOT NULL)

notes

id (TEXT, PRIMARY KEY)
user_id (TEXT, NOT NULL, FOREIGN KEY → users.id)
course_id (TEXT, NOT NULL, FOREIGN KEY → courses.id)
title (TEXT, NOT NULL)
note (TEXT, NOT NULL)
created_at (TEXT, NOT NULL)
Зв’язки
users (1) → (M) notes
courses (1) → (M) notes

Обмеження
NOT NULL для обов’язкових полів
PRIMARY KEY для всіх таблиць
FOREIGN KEY для зв’язків notes → users, courses
INDEX для course_id та created_at
API Endpoints
Users
GET /api/users
POST /api/users
Courses
GET /api/courses
Notes
GET /api/notes
GET /api/notes/:id
POST /api/notes
PUT /api/notes/:id
DELETE /api/notes/:id
WHERE + ORDER BY + LIMIT
GET /api/notes?courseId=1&sort=created_at

SQL:

SELECT * FROM notes
WHERE course_id='1'
ORDER BY created_at DESC
LIMIT 10;
JOIN endpoint
GET /api/notes/relations/all

Повертає нотатки разом з користувачем і курсом.

Агрегація (COUNT)
GET /api/notes/stats/all
SELECT course_id, COUNT(*) as total
FROM notes
GROUP BY course_id;
SQL Injection (демонстрація)
WHERE course_id='${courseId}'

Приклад небезпечного вводу:

1' OR '1'='1
Формат відповіді
Успіх
{
  "data": []
}
Помилка
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid data"
  }
}
HTTP статуси
200 OK
201 Created
204 No Content
400 Bad Request
404 Not Found
409 Conflict
500 Internal Server Error

Додаткові можливості
JOIN запити
агрегація (COUNT)
фільтрація + сортування + LIMIT
міграції без ORM
централізована обробка помилок