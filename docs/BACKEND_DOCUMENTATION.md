# Backend Documentation

## Current Stack

- Flask
- Flask-Cors
- python-dotenv
- SQLite

## Main Files

- [backend/app.py](d:/project/chetan_iot/iot/backend/app.py)
- [backend/app/__init__.py](d:/project/chetan_iot/iot/backend/app/__init__.py)
- [backend/app/config.py](d:/project/chetan_iot/iot/backend/app/config.py)
- [backend/app/routes/health.py](d:/project/chetan_iot/iot/backend/app/routes/health.py)
- [backend/app/routes/telemetry.py](d:/project/chetan_iot/iot/backend/app/routes/telemetry.py)
- [backend/app/services/db.py](d:/project/chetan_iot/iot/backend/app/services/db.py)
- [backend/app/services/telemetry_service.py](d:/project/chetan_iot/iot/backend/app/services/telemetry_service.py)

## Implemented Routes

- `GET /sensor`
- `POST /api/v1/telemetry`
- `GET /api/v1/health`
- `GET /api/v1/telemetry/latest`
- `GET /api/v1/telemetry/history`
- `GET /api/v1/machine/status`
- `GET /api/v1/alerts`

## Service Responsibilities

- parse device input
- compute fault flags
- determine machine status
- store readings in SQLite
- format alert responses

## Fault Calculation

```python
temperature_fault = temperature > 50
current_fault = current > 600
vibration_fault = vibration == 1
machine_state = "fault" if any([temperature_fault, current_fault, vibration_fault]) else "normal"
```

## Stored Data Model

Each telemetry record stores:

- `temperature`
- `current`
- `vibration`
- `status`
- `temperature_fault`
- `current_fault`
- `vibration_fault`
- `faults`
- `created_at`

## Storage

SQLite is used for local persistence. The database file is created automatically at:

- `backend/app/data/iot.db`

## Backend Startup Flow

1. Load environment variables from `backend/.env`
2. Initialize the SQLite database and telemetry table
3. Register Flask routes and CORS
4. Accept device/frontend telemetry and persist records
5. Serve health, latest, history, status, and alerts endpoints
