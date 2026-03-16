# Frontend Documentation

## Dashboard Goal

Build a classic industrial-style dashboard that clearly shows machine health.

## Design Direction

The dashboard should feel:
- practical
- bold
- readable from a distance
- suited for machine monitoring

## Main Dashboard Sections

### Header

- Project title
- Machine name
- Current status badge

### Live Signal Cards

- Temperature
- Current
- Vibration

### Fault Summary

- Normal or fault state
- Which rule triggered the fault

### History Panel

- Recent telemetry table
- Optional line chart for temperature and current

### Alerts Panel

- Most recent faults
- Time of event

## Frontend Data Sources

The dashboard will consume:
- `GET /api/v1/telemetry/latest`
- `GET /api/v1/telemetry/history`
- `GET /api/v1/machine/status`
- `GET /api/v1/alerts`

## Existing Frontend Base

- [frontend/src/services/api.js](d:/project/chetan_iot/iot/frontend/src/services/api.js)
- [frontend/src/Routes/AppRoutes.jsx](d:/project/chetan_iot/iot/frontend/src/Routes/AppRoutes.jsx)
- [frontend/src/Pages/Home/HomePage.jsx](d:/project/chetan_iot/iot/frontend/src/Pages/Home/HomePage.jsx)

## Suggested Frontend Pages

- Dashboard page
- Alerts page
- History page

## Recommended First UI Build

1. Machine status hero
2. Signal cards
3. Latest telemetry section
4. Alerts list
