from datetime import datetime, timezone

from flask import Blueprint, jsonify

health_bp = Blueprint("health", __name__)


@health_bp.get("/api/v1/health")
def health():
    return jsonify(
        {
            "status": "ok",
            "message": "Backend API is healthy",
            "timestamp": datetime.now(timezone.utc).isoformat(),
        }
    )
