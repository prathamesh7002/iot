# System Flows

## 1. Telemetry Ingestion Flow

1. Arduino reads temperature, current, and vibration
2. Arduino computes local fault logic
3. Arduino sends `GET /sensor?temp=...&current=...&vib=...`
4. Flask validates the request
5. Flask computes normalized machine status
6. Flask stores the telemetry
7. Flask returns a success response

## 2. Dashboard Load Flow

1. User opens the frontend dashboard
2. Frontend calls `/api/v1/health`
3. Frontend calls `/api/v1/telemetry/latest`
4. Frontend calls `/api/v1/machine/status`
5. Frontend renders live cards and status banner

## 3. Alert Detection Flow

1. Backend receives telemetry
2. Backend checks thresholds
3. Backend creates fault flags
4. Backend marks the reading as `fault` or `normal`
5. Frontend displays alert state

## 4. History Flow

1. Frontend requests `/api/v1/telemetry/history`
2. Backend returns recent telemetry
3. Frontend shows trend or table view
