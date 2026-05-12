

#  Кабінет студента – REST API (Lab Work)

## Опис проєкту

Цей проєкт реалізує **REST API для кабінету студента**, де користувач може створювати та керувати навчальними нотатками, прив’язаними до дисциплін.

Дані зберігаються **в оперативній пам’яті (in-memory)** без використання бази даних.

---

##  Технології

- Node.js
- Express
- TypeScript
- ts-node-dev
- In-memory storage (масиви)

---

## Структура проєкту


src/
├── controllers/
├── services/
├── routes/
├── store/
├── domain/
├── infrastructure/
├── app.ts
└── server.ts


---

## Запуск проєкту

### 1. Встановити залежності
```bash
npm install
2. Запустити сервер у dev режимі
npm run dev
3. Сервер буде доступний:
http://localhost:3000
Реалізовані сутності
Courses (Дисципліни)
id
name
Notes (Нотатки)
id
courseId
title
note
createdAt
API Endpoints

## Courses
Отримати всі курси
GET /api/courses

Response:

{
  "items": [
    { "id": "math", "name": "Вища математика" },
    { "id": "itk", "name": "ІТК" }
  ]
}

## Notes
Отримати всі нотатки
GET /api/notes

Отримати нотатку по ID
GET /api/notes/:id

Створити нотатку
POST /api/notes
Content-Type: application/json

{
  "courseId": "1",
  "title": "Інтеграли",
  "note": "Повторити методи інтегрування"
}
{
  "courseId": "2",
  "title": "Мережі",
  "note": "Вивчити TCP/IP модель"
}
{
  "courseId": "3",
  "title": "Шифрування",
  "note": "AES та RSA алгоритми"
}



Оновити нотатку
PUT /api/notes/:id
{
  "courseId": "itk",
  "title": "Оновлена тема",
  "note": "Новий текст"
}
Видалити нотатку
DELETE /api/notes/:id

201 for post

{
  "courseId": "1",
  "title": "Math",
  "note": "Study integrals"
}

204 delete
DELETE /api/note/неіснуючийід



Валідація
POST  /api/notes
{
  "courseId": "99999",
  "title": "І",
  "note": ""
}
{
  "courseId": "3",
  "title": "Шифрування",
  "note": "AES та RSA алгоритми"
}

API перевіряє:

обов’язкові поля (courseId, title, note)
мінімальну довжину title (≥ 3)
мінімальну довжину note (≥ 5)


У разі помилки повертається:

{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid request"
  }
}

Приклади CURL
Створити нотатку
curl -X POST http://localhost:3000/api/notes \
-H "Content-Type: application/json" \
-d "{\"courseId\":\"math\",\"title\":\"Test\",\"note\":\"Hello world\"}"
Отримати нотатки
curl http://localhost:3000/api/notes

Особливості
REST API без бази даних
In-memory зберігання
UUID генерація ID
DTO-структура
Централізована обробка помилок
Фільтрація нотаток по курсах