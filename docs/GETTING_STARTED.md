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
- `DATABASE_PATH=app/data/iot.db`

### Frontend

Use [frontend/.env.example](d:/project/chetan_iot/iot/frontend/.env.example) as the base.

Important value:
- `VITE_API_BASE_URL=http://127.0.0.1:5000`

## Hardware Configuration

In the Arduino sketch, update:
- `ssid`
- `pass`
- `server`
- `port`

The `server` value must point to the machine running the Flask backend on the same Wi-Fi network.
