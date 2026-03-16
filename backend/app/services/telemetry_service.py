import json
from datetime import datetime, timezone

from flask import abort

from .db import get_connection


def parse_device_payload(source, config):
    temperature = _to_float(source.get("temp", source.get("temperature")), "temperature")
    current_value = _to_int(source.get("current"), "current")
    vibration = _to_int(source.get("vib", source.get("vibration")), "vibration")

    temperature_fault = temperature > config["TEMP_FAULT_THRESHOLD"]
    current_fault = current_value > config["CURRENT_FAULT_THRESHOLD"]
    vibration_fault = vibration == 1

    faults = []
    if temperature_fault:
        faults.append("temperature")
    if current_fault:
        faults.append("current")
    if vibration_fault:
        faults.append("vibration")

    return {
        "temperature": temperature,
        "current": current_value,
        "vibration": vibration,
        "temperature_fault": temperature_fault,
        "current_fault": current_fault,
        "vibration_fault": vibration_fault,
        "faults": faults,
        "status": "fault" if faults else "normal",
        "timestamp": datetime.now(timezone.utc).isoformat(),
    }


def store_telemetry(database_path, payload):
    with get_connection(database_path) as connection:
        cursor = connection.execute(
            """
            INSERT INTO telemetry (
                temperature,
                current_value,
                vibration,
                status,
                temperature_fault,
                current_fault,
                vibration_fault,
                faults,
                created_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
            """,
            (
                payload["temperature"],
                payload["current"],
                payload["vibration"],
                payload["status"],
                int(payload["temperature_fault"]),
                int(payload["current_fault"]),
                int(payload["vibration_fault"]),
                json.dumps(payload["faults"]),
                payload["timestamp"],
            ),
        )
        connection.commit()

        row = connection.execute(
            "SELECT * FROM telemetry WHERE id = ?",
            (cursor.lastrowid,),
        ).fetchone()

    return _serialize_row(row)


def get_latest(database_path):
    with get_connection(database_path) as connection:
        row = connection.execute(
            "SELECT * FROM telemetry ORDER BY id DESC LIMIT 1"
        ).fetchone()
    return _serialize_row(row) if row else None


def get_history(database_path, filters, faults_only=False):
    query = "SELECT * FROM telemetry"
    clauses = []
    params = []

    if filters.get("from"):
        clauses.append("created_at >= ?")
        params.append(filters["from"])

    if filters.get("to"):
        clauses.append("created_at <= ?")
        params.append(filters["to"])

    if faults_only:
        clauses.append("status = 'fault'")

    if clauses:
        query += " WHERE " + " AND ".join(clauses)

    query += " ORDER BY id DESC LIMIT ?"
    params.append(filters.get("limit", 50))

    with get_connection(database_path) as connection:
        rows = connection.execute(query, params).fetchall()

    return [_serialize_row(row) for row in rows]


def parse_history_filters(args):
    limit = args.get("limit", default=50, type=int) if hasattr(args, "get") else args.get("limit", 50)
    limit = 50 if limit is None else max(1, min(int(limit), 500))

    from_value = args.get("from") if hasattr(args, "get") else args.get("from")
    to_value = args.get("to") if hasattr(args, "get") else args.get("to")

    _validate_iso_datetime(from_value, "from")
    _validate_iso_datetime(to_value, "to")

    return {"limit": limit, "from": from_value, "to": to_value}


def build_status_summary(record):
    return {
        "machine_state": record["status"],
        "temperature_fault": record["temperature_fault"],
        "current_fault": record["current_fault"],
        "vibration_fault": record["vibration_fault"],
        "relay_expected": "off" if record["status"] == "fault" else "on",
        "buzzer_expected": "on" if record["status"] == "fault" else "off",
        "faults": record["faults"],
        "timestamp": record["timestamp"],
    }


def create_alert_items(records):
    items = []
    for record in records:
        items.append(
            {
                "id": record["id"],
                "severity": "high",
                "message": _build_alert_message(record["faults"]),
                "faults": record["faults"],
                "status": record["status"],
                "timestamp": record["timestamp"],
            }
        )
    return items


def _serialize_row(row):
    return {
        "id": row["id"],
        "temperature": row["temperature"],
        "current": row["current_value"],
        "vibration": row["vibration"],
        "status": row["status"],
        "temperature_fault": bool(row["temperature_fault"]),
        "current_fault": bool(row["current_fault"]),
        "vibration_fault": bool(row["vibration_fault"]),
        "faults": json.loads(row["faults"]),
        "timestamp": row["created_at"],
    }


def _to_float(value, name):
    if value in (None, ""):
        abort(400, description=f"Missing required field: {name}")
    try:
        return float(value)
    except (TypeError, ValueError):
        abort(400, description=f"Invalid numeric value for {name}")


def _to_int(value, name):
    if value in (None, ""):
        abort(400, description=f"Missing required field: {name}")
    try:
        return int(value)
    except (TypeError, ValueError):
        abort(400, description=f"Invalid integer value for {name}")


def _validate_iso_datetime(value, field_name):
    if not value:
        return
    try:
        datetime.fromisoformat(value.replace("Z", "+00:00"))
    except ValueError:
        abort(400, description=f"Invalid ISO-8601 datetime for {field_name}")


def _build_alert_message(faults):
    if not faults:
        return "Machine alert recorded"
    title = ", ".join(faults)
    return f"Fault detected: {title}"
