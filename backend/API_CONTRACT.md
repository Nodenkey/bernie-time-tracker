# Bernie Time Tracker - Backend API Contract

Base path (Railway production): `https://<backend-domain>/api/time-entries`
Base path (local dev via docker-compose): `http://localhost:8000/api/time-entries`

All responses are JSON. CORS is configured to allow all origins.

## Health Check

**GET** `/health`

- Purpose: Liveness probe for Railway and monitoring.
- Response `200 OK`:

```json
{"status": "ok"}
```

---

## List Time Entries

**GET** `/api/time-entries`

Query parameters (all optional):
- `date_from` (string, ISO date `YYYY-MM-DD`)
- `date_to` (string, ISO date `YYYY-MM-DD`)
- `team` (string) – exact match on `teamName`, case-insensitive
- `person` (string) – exact match on `personName`, case-insensitive

Response `200 OK`:

```json
[
  {
    "id": "string",
    "date": "2026-04-15",
    "personName": "Alice Johnson",
    "teamName": "Engineering",
    "activityDescription": "Implement authentication module",
    "durationHours": 6.5,
    "notes": "Focused on OAuth2 integration",
    "createdAt": "2026-04-15T10:00:00Z",
    "updatedAt": "2026-04-15T10:00:00Z"
  }
]
```

Errors:
- `400` – not used (FastAPI will return `422` for invalid query formats).

---

## Get Single Time Entry

**GET** `/api/time-entries/{id}`

Path params:
- `id` (string, UUID-like)

Response `200 OK`:

```json
{
  "id": "string",
  "date": "2026-04-15",
  "personName": "Alice Johnson",
  "teamName": "Engineering",
  "activityDescription": "Implement authentication module",
  "durationHours": 6.5,
  "notes": "Focused on OAuth2 integration",
  "createdAt": "2026-04-15T10:00:00Z",
  "updatedAt": "2026-04-15T10:00:00Z"
}
```

Errors:
- `404` – entry not found

```json
{
  "error": "not_found",
  "message": "Time entry with id <id> does not exist",
  "detail": null
}
```

---

## Create Time Entry

**POST** `/api/time-entries`

Request body:

```json
{
  "date": "2026-04-16",
  "personName": "Dana White",
  "teamName": "Engineering",
  "activityDescription": "Write unit tests",
  "durationHours": 2.5,
  "notes": "Coverage for time entry endpoints" // optional
}
```

Validation rules:
- `date` – required, ISO date string.
- `personName`, `teamName`, `activityDescription` – required, non-empty strings.
- `durationHours` – required, number > 0.
- `notes` – optional string.

Response `201 Created`:

```json
{
  "id": "generated-id",
  "date": "2026-04-16",
  "personName": "Dana White",
  "teamName": "Engineering",
  "activityDescription": "Write unit tests",
  "durationHours": 2.5,
  "notes": "Coverage for time entry endpoints",
  "createdAt": "2026-04-16T09:00:00Z",
  "updatedAt": "2026-04-16T09:00:00Z"
}
```

Errors:
- `422` – validation error (missing/invalid fields). FastAPI default error body.

---

## Update Time Entry

**PUT** `/api/time-entries/{id}`

Path params:
- `id` (string)

Request body (all fields optional; only provided fields are updated):

```json
{
  "date": "2026-04-17",
  "personName": "Dana White",
  "teamName": "Engineering",
  "activityDescription": "Refine unit tests",
  "durationHours": 3.0,
  "notes": "Added edge case coverage"
}
```

Validation rules:
- Same as create, but all fields optional.
- If `durationHours` is provided, it must be > 0.

Response `200 OK`:

```json
{
  "id": "existing-id",
  "date": "2026-04-17",
  "personName": "Dana White",
  "teamName": "Engineering",
  "activityDescription": "Refine unit tests",
  "durationHours": 3.0,
  "notes": "Added edge case coverage",
  "createdAt": "2026-04-16T09:00:00Z",
  "updatedAt": "2026-04-17T11:30:00Z"
}
```

Errors:
- `404` – entry not found (same error body as GET by id).
- `422` – validation error.

---

## Delete Time Entry

**DELETE** `/api/time-entries/{id}`

Path params:
- `id` (string)

Response `204 No Content` – empty body.

Errors:
- `404` – entry not found (same error body as GET by id).

---

## Notes for Frontend (Samuel)

- Base URL for local dev: `http://localhost:8000`.
- Main collection endpoint: `GET /api/time-entries`.
- Filtering is done via query params; omit params to get all entries.
- All timestamps are ISO 8601 strings in UTC.
- CORS is open (`*`), so you can call the API directly from the browser.
