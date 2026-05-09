# Crop Recommendation System — REST API Reference

Base URL (local development): `http://localhost:4000/api`

All authenticated routes expect:

```
Authorization: Bearer <jwt>
```

## Health

### `GET /api/health`

Returns service metadata — useful for Render / uptime checks.

```json
{
  "success": true,
  "service": "crop-recommendation-api",
  "time": "2026-05-09T12:00:00.000Z"
}
```

---

## Authentication

### `POST /api/auth/register`

Body (JSON):

| Field      | Rules                          |
|-----------|---------------------------------|
| `name`    | string, trimmed, 2–80 chars    |
| `email`   | valid email                     |
| `password`| string ≥ 8 chars (bcrypt-hashed)|

Responses:

- **201** — `{ success, token, user: { id, name, email } }`
- **409** — email already registered
- **400** — validation errors (`errors` array from express-validator)

### `POST /api/auth/login`

Body: `{ email, password }`

Responses:

- **200** — `{ success, token, user }`
- **401** — invalid credentials

### `GET /api/auth/me` *(JWT required)*

Returns `{ success, user: { id, name, email } }`.

---

## Predictions

### `POST /api/predictions` *(JWT required)*

Validates and forwards the payload to the Flask Random Forest (`POST ${ML_SERVICE_URL}/predict`).
Persists `{ inputs, predictedCrop, confidence }` linked to `user`, with timestamps.

Body (numbers):

| Field         | Allowed range |
|---------------|---------------|
| `N`,`P`,`K`   | 0 – 150 |
| `temperature` | −5 – 55 |
| `humidity`    | 0 – 100 |
| `ph`          | 0 – 14 |
| `rainfall`    | 0 – 600 |

**201** — `{ success, prediction: { id, inputs, predictedCrop, confidence, createdAt } }`

**502** — `{ success: false, message }` when the ML upstream is unreachable or invalid.

### `GET /api/predictions` *(JWT required)*

Query parameters:

| Param   | Purpose |
|---------|---------|
| `search`| case-insensitive regex on `predictedCrop` |
| `crop`  | alias filter (combined with above — prefer single term) |
| `from`  | ISO/date lower bound (`createdAt >= from`) |
| `to`    | ISO/date upper bound (`createdAt <= to`) |
| `limit` | default 50, capped at 200 |
| `skip`  | paging offset |

**200** — `{ success, total, predictions: Prediction[] }`

---

## Analytics

### `GET /api/analytics/summary` *(JWT required)*

Query: `days` — integer window ending “now” (default 14, max 90).

**200**:

```json
{
  "success": true,
  "summary": {
    "totalPredictions": 124,
    "recentPredictionsInWindow": 32,
    "windowDays": 14
  },
  "charts": {
    "predictionTrend": [{ "date": "2026-05-01", "count": 5 }],
    "predictionsLast7Days": [{ "date": "2026-05-07", "count": 3 }],
    "mostRecommendedCrops": [{ "crop": "rice", "count": 12 }]
  }
}
```

---

## ML Microservice (`ml-service`)

### `POST /predict`

Host: `${ML_SERVICE_URL}` (often `http://localhost:5000`)

Body mirrors training features.

**200** (`application/json`)

```json
{
  "success": true,
  "crop": "rice",
  "confidence": 0.87,
  "features": { "N": 90.0 }
}
```

### `GET /health`

Ensures pickled model artifact is present (`503` otherwise).
