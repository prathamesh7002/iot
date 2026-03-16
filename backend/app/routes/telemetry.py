from flask import Blueprint, current_app, jsonify, request

from ..services.telemetry_service import (
    build_status_summary,
    create_alert_items,
    get_history,
    get_latest,
    parse_device_payload,
    parse_history_filters,
    store_telemetry,
)

telemetry_bp = Blueprint("telemetry", __name__)


@telemetry_bp.get("/sensor")
def ingest_sensor_data():
    payload = parse_device_payload(request.args, current_app.config)
    record = store_telemetry(current_app.config["DATABASE_PATH"], payload)

    return jsonify(
        {
            "success": True,
            "message": "Telemetry received",
            "status": record["status"],
            "record": record,
        }
    )


@telemetry_bp.post("/api/v1/telemetry")
def ingest_telemetry_json():
    payload = parse_device_payload(request.get_json(silent=True) or {}, current_app.config)
    record = store_telemetry(current_app.config["DATABASE_PATH"], payload)
    return jsonify(record), 201


@telemetry_bp.get("/api/v1/telemetry/latest")
def latest_telemetry():
    record = get_latest(current_app.config["DATABASE_PATH"])
    if record is None:
        return jsonify({"message": "No telemetry available yet"}), 404

    return jsonify(record)


@telemetry_bp.get("/api/v1/telemetry/history")
def telemetry_history():
    filters = parse_history_filters(request.args)
    records = get_history(current_app.config["DATABASE_PATH"], filters)
    return jsonify(
        {
            "items": records,
            "count": len(records),
            "filters": filters,
        }
    )


@telemetry_bp.get("/api/v1/machine/status")
def machine_status():
    record = get_latest(current_app.config["DATABASE_PATH"])
    if record is None:
        return jsonify(
            {
                "machine_state": "unknown",
                "temperature_fault": False,
                "current_fault": False,
                "vibration_fault": False,
                "relay_expected": "off",
                "buzzer_expected": "off",
                "timestamp": None,
            }
        )

    return jsonify(build_status_summary(record))


@telemetry_bp.get("/api/v1/alerts")
def alerts():
    limit = request.args.get("limit", default=20, type=int) or 20
    filters = {"limit": max(1, min(limit, 200))}
    records = get_history(current_app.config["DATABASE_PATH"], filters, faults_only=True)
    items = create_alert_items(records)
    return jsonify({"items": items, "count": len(items)})
