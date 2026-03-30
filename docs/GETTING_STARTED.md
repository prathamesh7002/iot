# Getting Started

## Prerequisites

- Python 3.11+
- Node.js 18+
- npm
- A local Wi-Fi network for the ESP8266

## Project Structure

```text
iot/
  backend/
  frontend/
  docs/
```

## Backend Setup

```bash
cd backend
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt
copy .env.example .env
python app.py
```

Production process:
- `gunicorn app:app`

Backend default URL:
- `http://127.0.0.1:5000`

SQLite database:
- created automatically at `backend/app/data/iot.db`

If `python -m venv .venv` looks stuck on Windows, wait for `ensurepip` to finish before interrupting it. If you stopped it midway, delete `backend/.venv` and run the command again.

## Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

Frontend default URL:
- `http://127.0.0.1:5173`

## Environment Files

### Backend

Use [backend/.env.example](d:/project/chetan_iot/iot/backend/.env.example) as the base.

Important values:
- `PORT=5000`
- `FRONTEND_URL=http://localhost:5173`
- `CORS_ORIGINS=http://localhost:5173,http://127.0.0.1:5173`
- `DATABASE_PATH=app/data/iot.db`

### Frontend

Use [frontend/.env.example](d:/project/chetan_iot/iot/frontend/.env.example) as the base.

Important value:
- `VITE_API_BASE_URL=http://127.0.0.1:5000`

## Render Deployment

This repository is deployment-ready for Render using [render.yaml](d:/project/chetan_iot/iot/render.yaml).

Services defined there:
- `iot-backend` as a Python web service
- `iot-frontend` as a static site

Backend Render details:
- root directory: `backend`
- build command: `pip install -r requirements.txt`
- start command: `gunicorn app:app`
- health check: `/api/v1/health`
- persistent SQLite path: `/var/data/iot.db`

Frontend Render details:
- root directory: `frontend`
- build command: `npm ci && npm run build`
- publish directory: `dist`
- `VITE_API_BASE_URL` is sourced from the backend service URL

## Hardware Configuration

In the Arduino sketch, update:
- `ssid`
- `pass`
- `server`
- `port`

The `server` value must point to the machine running the Flask backend on the same Wi-Fi network.
