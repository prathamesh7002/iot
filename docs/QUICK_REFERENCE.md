# Quick Reference

## Device Parameters

- `temp`: temperature
- `current`: current reading
- `vib`: vibration state

## Fault Thresholds

- temperature fault: `> 50`
- current fault: `> 550`
- vibration fault: `== 1`

## Important URLs

### Backend

- `/`
- `/sensor`
- `/api/v1/health`
- `/api/v1/telemetry/latest`
- `/api/v1/telemetry/history`
- `/api/v1/machine/status`
- `/api/v1/alerts`

### Frontend

- `http://localhost:5173`

## Commands

### Backend

```bash
cd backend
pip install -r requirements.txt
python app.py
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```
