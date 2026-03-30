from flask_cors import CORS

from .health import health_bp
from .telemetry import telemetry_bp


def register_routes(app):
    CORS(app, resources={r"/api/*": {"origins": _get_cors_origins(app.config)}})
    app.register_blueprint(health_bp)
    app.register_blueprint(telemetry_bp)


def _get_cors_origins(config):
    configured_origins = config.get("CORS_ORIGINS", "")
    if configured_origins == "*":
        return "*"

    origins = set()
    for origin in configured_origins.split(","):
        origin = origin.strip()
        if origin:
            origins.add(origin)

    frontend_url = config.get("FRONTEND_URL")
    if frontend_url:
        origins.add(frontend_url)

    # Local defaults keep development friction low when no explicit origins are set.
    if not origins:
        origins.update(
            {
                "http://localhost:5173",
                "http://127.0.0.1:5173",
            }
        )

    return sorted(origins)
