# System Architecture

## Overview

This project uses a three-layer architecture:

1. Device layer
2. Backend API layer
3. Frontend dashboard layer

## Device Layer

The Arduino code reads:
- Temperature from `A0`
- Current from `A1`
- Vibration from digital pin `4`

It then:
- Displays status on the LCD
- Activates relay and buzzer on fault
- Sends telemetry to the backend using ESP8266 AT commands

## Backend Layer

The Flask backend is responsible for:
- Accepting telemetry from the IoT device
- Validating query parameters
- Translating raw readings into machine state
- Serving normalized data to the frontend

Suggested backend modules:
- `routes`: HTTP endpoints
- `services`: telemetry processing and fault logic
- `utils`: shared helpers

## Frontend Layer

The React dashboard should provide:
- A machine overview card
- Live signal cards
- Fault banner
- Recent readings table
- Alert timeline

## Data Flow

```text
Sensors -> Arduino -> ESP8266 -> Flask Backend -> React Dashboard
```

## Fault Logic

Based on the current Arduino sketch:
- Temperature fault when `temp > 50`
- Current fault when `current > 550`
- Vibration fault when `vib == 1`

Backend and frontend should use the same logic to keep the dashboard aligned with the device behavior.
