from datetime import datetime, timezone

from flask import Blueprint

health_bp = Blueprint("health", __name__)


@health_bp.get("/health")
def health_check():
    return {
        "status": "ok",
        "message": "Backend API is healthy",
        "timestamp": datetime.now(timezone.utc).isoformat(),
    }
