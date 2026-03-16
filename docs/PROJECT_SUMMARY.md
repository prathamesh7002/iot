# Project Summary

## Project Name

IoT Machine Health Monitoring Dashboard

## Goal

Build a complete monitoring system for a machine using:
- An Arduino-based hardware unit
- ESP8266 Wi-Fi communication
- A Flask backend API
- A React + Tailwind frontend dashboard

The device reads temperature, current, and vibration values, sends them to the backend, and the dashboard displays live machine status and alerts.

## Hardware Signals

The Arduino code currently sends:
- `temp`: calculated temperature value
- `current`: current sensor reading
- `vib`: vibration digital state

The device logic marks a machine fault when:
- `temperature > 50`
- `currentValue > 600`
- `vibration == HIGH`

## Platform Responsibilities

### Arduino/ESP8266
- Read sensors
- Detect local fault
- Control relay and buzzer
- Send telemetry to backend over Wi-Fi

### Flask Backend
- Receive data from the ESP8266
- Validate and normalize telemetry
- Store or cache telemetry
- Provide APIs for the frontend dashboard
- Expose current machine status and alerts

### React Frontend
- Show a classic industrial monitoring dashboard
- Display live values for temperature, current, and vibration
- Show machine status: normal or fault
- Show recent events and alert history

## Planned API Strategy

The backend should support two API styles:

1. Legacy device-compatible endpoint for the Arduino sketch:
- `GET /sensor?temp=...&current=...&vib=...`

2. Frontend-friendly REST endpoints:
- `GET /api/v1/health`
- `GET /api/v1/telemetry/latest`
- `GET /api/v1/telemetry/history`
- `GET /api/v1/machine/status`
- `GET /api/v1/alerts`

## Next Build Phases

1. Implement device ingestion endpoint in Flask
2. Add in-memory or database-backed telemetry storage
3. Build dashboard widgets in React
4. Add charts, alert list, and machine status cards
