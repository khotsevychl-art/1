# Backend notes API

Основна версія API: `/api/v1`.

## Запуск

```bash
npm install
npm run dev
```

## Ендпоінти

- `GET /api/v1/health`
- `GET /api/v1/courses`
- `GET /api/v1/notes`
- `GET /api/v1/notes/:id`
- `POST /api/v1/notes`
- `PUT /api/v1/notes/:id`
- `PATCH /api/v1/notes/:id`
- `DELETE /api/v1/notes/:id`

## CORS

CORS налаштовано через whitelist origin, без `*`. Дозволені методи: `GET,POST,PUT,PATCH,DELETE,OPTIONS`.

## Формат помилки

```json
{
  "status": 400,
  "code": "VALIDATION_ERROR",
  "title": "Invalid data",
  "message": "Invalid data",
  "detail": "Some fields are incorrect",
  "errors": {}
}
```
