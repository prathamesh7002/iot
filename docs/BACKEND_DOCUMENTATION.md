# Backend Documentation

## Current Stack

- Flask
- Flask-Cors
- python-dotenv

## Existing Files

- [backend/app.py](d:/project/chetan_iot/iot/backend/app.py)
- [backend/app/__init__.py](d:/project/chetan_iot/iot/backend/app/__init__.py)
- [backend/app/config.py](d:/project/chetan_iot/iot/backend/app/config.py)
- [backend/app/extensions.py](d:/project/chetan_iot/iot/backend/app/extensions.py)
- [backend/app/routes/health.py](d:/project/chetan_iot/iot/backend/app/routes/health.py)

## What Needs To Be Added Next

### Routes

- `GET /sensor`
- `GET /api/v1/telemetry/latest`
- `GET /api/v1/telemetry/history`
- `GET /api/v1/machine/status`
- `GET /api/v1/alerts`

### Services

Suggested service responsibilities:
- parse device input
- compute fault flags
- determine machine status
- store readings

### Suggested Fault Calculation

```python
temperature_fault = temperature > 50
current_fault = current > 600
vibration_fault = vibration == 1
machine_state = "fault" if any([temperature_fault, current_fault, vibration_fault]) else "normal"
```

## Suggested Data Model

For an initial version, each telemetry record can contain:

- `temperature`
- `current`
- `vibration`
- `status`
- `faults`
- `created_at`

## Storage Options

### Phase 1

Use in-memory storage or a simple JSON/file approach for rapid development.

### Phase 2

Move to SQLite or PostgreSQL if long-term history is needed.

## Backend Priorities

1. Add the device ingestion route
2. Normalize data from query params
3. Return latest telemetry to frontend
4. Add history and alerts endpoints
