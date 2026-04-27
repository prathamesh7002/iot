# IoT Machine Health Monitoring Dashboard

This project is an IoT monitoring system for a machine-health use case. It combines an Arduino + ESP8266 device, a Flask backend, and a React dashboard.

## Project Goals

- Receive telemetry from the hardware device
- Detect machine fault conditions
- Expose APIs for a web dashboard
- Display a classic monitoring dashboard for operators

## Current Stack

### Backend

- Flask
- Flask-Cors
- python-dotenv
- gunicorn
- SQLite

### Frontend

- React
- Vite
- Tailwind CSS
- Axios
- React Router

## Device Signals

Based on the Arduino sketch, the device sends:
- temperature
- current
- vibration

Current fault logic:
- `temperature > 50`
- `current > 550`
- `vibration == 1`

## Repository Structure

```text
iot/
  backend/
  frontend/
  docs/
```

## Main Project Parts

### Backend

The Flask backend:
- accepts telemetry from the IoT device
- computes machine state and fault flags
- stores telemetry in SQLite
- provides APIs for the frontend

Start here:
- [backend/app.py](d:/project/chetan_iot/iot/backend/app.py)
- [backend/requirements.txt](d:/project/chetan_iot/iot/backend/requirements.txt)

### Frontend

The React frontend will:
- show a classic machine monitoring dashboard
- display live sensor values
- display fault state and alerts

Start here:
- [frontend/src/Pages/Home/HomePage.jsx](d:/project/chetan_iot/iot/frontend/src/Pages/Home/HomePage.jsx)
- [frontend/src/services/api.js](d:/project/chetan_iot/iot/frontend/src/services/api.js)

## Documentation

Essential docs are in the `docs` folder:
- [PROJECT_SUMMARY.md](d:/project/chetan_iot/iot/docs/PROJECT_SUMMARY.md)
- [GETTING_STARTED.md](d:/project/chetan_iot/iot/docs/GETTING_STARTED.md)
- [SYSTEM_ARCHITECTURE.md](d:/project/chetan_iot/iot/docs/SYSTEM_ARCHITECTURE.md)
- [API_ENDPOINTS.md](d:/project/chetan_iot/iot/docs/API_ENDPOINTS.md)
- [BACKEND_DOCUMENTATION.md](d:/project/chetan_iot/iot/docs/BACKEND_DOCUMENTATION.md)
- [FRONTEND_DOCUMENTATION.md](d:/project/chetan_iot/iot/docs/FRONTEND_DOCUMENTATION.md)
- [SYSTEM_FLOWS.md](d:/project/chetan_iot/iot/docs/SYSTEM_FLOWS.md)
- [QUICK_REFERENCE.md](d:/project/chetan_iot/iot/docs/QUICK_REFERENCE.md)

## Quick Start

### Backend

```bash
cd backend
pip install -r requirements.txt
python app.py
```

Render start command:
- `gunicorn app:app`

Render blueprint:
- `render.yaml` provisions both the backend API and the frontend static site
- backend data persists on a mounted disk at `/var/data/iot.db`

### Frontend

```bash
cd frontend
npm install
npm run dev
```

## Planned APIs

### Device-compatible

- `GET /sensor?temp=...&current=...&vib=...`

### Frontend APIs

- `GET /api/v1/health`
- `GET /api/v1/telemetry/latest`
- `GET /api/v1/telemetry/history`
- `GET /api/v1/machine/status`
- `GET /api/v1/alerts`

## Render Deployment

Deploy from the repo root with Render Blueprints:

1. Connect the GitHub repository in Render
2. Create services from `render.yaml`
3. Let Render create both `iot-backend` and `iot-frontend`
4. After deploy, open `/api/v1/health` on the backend to confirm the API is healthy

Important deployment notes:
- the backend service runs from `backend/`
- the frontend static site runs from `frontend/`
- SQLite is stored on the mounted Render disk, not inside the container filesystem
- `CORS_ORIGINS` is set to `*` in `render.yaml` so the hosted frontend can reach the API without extra manual setup

## Current Status

The backend has been rebuilt from scratch around a simple Flask + SQLite architecture. The next frontend phase is to connect dashboard screens to the live telemetry, status, history, and alerts endpoints.
