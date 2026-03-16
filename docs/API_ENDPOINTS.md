# API Endpoints

## Purpose

This document defines the backend APIs required for:
- The Arduino device
- The React dashboard

## 1. Device Ingestion Endpoint

### `GET /sensor`

Used by the Arduino sketch exactly as written.

#### Query Parameters

- `temp`: float
- `current`: integer
- `vib`: integer

#### Example

```http
GET /sensor?temp=43.2&current=512&vib=0 HTTP/1.1
Host: 192.168.1.5:5000
```

#### Expected Backend Work

- Validate incoming values
- Build a telemetry record
- Compute machine status
- Store the record
- Return a simple response

#### Suggested Response

```json
{
  "success": true,
  "message": "Telemetry received",
  "status": "normal"
}
```

## 2. Health Check

### `GET /api/v1/health`

Used to verify backend availability.

#### Response

```json
{
  "status": "ok",
  "message": "Backend API is healthy",
  "timestamp": "2026-03-16T12:00:00+00:00"
}
```

## 3. Latest Telemetry

### `GET /api/v1/telemetry/latest`

Returns the latest machine reading.

#### Suggested Response

```json
{
  "temperature": 43.2,
  "current": 512,
  "vibration": 0,
  "status": "normal",
  "faults": [],
  "timestamp": "2026-03-16T12:00:00+00:00"
}
```

## 4. Telemetry History

### `GET /api/v1/telemetry/history`

Returns recent records for charts or tables.

#### Suggested Query Parameters

- `limit`
- `from`
- `to`

## 5. Machine Status

### `GET /api/v1/machine/status`

Returns current summary state for the dashboard.

#### Suggested Response

```json
{
  "machine_state": "fault",
  "temperature_fault": false,
  "current_fault": true,
  "vibration_fault": false,
  "relay_expected": "off",
  "buzzer_expected": "on"
}
```

## 6. Alerts

### `GET /api/v1/alerts`

Returns recent alerts or fault events for the dashboard.

## Notes

- Keep `GET /sensor` for device compatibility.
- Use `/api/v1/*` endpoints for frontend usage.
- Later, `POST /api/v1/telemetry` can be added if the device firmware is updated.
