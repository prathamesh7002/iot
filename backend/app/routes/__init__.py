from flask_cors import CORS

from .health import health_bp
from .telemetry import telemetry_bp


def register_routes(app):
    CORS(app, resources={r"/api/*": {"origins": [app.config["FRONTEND_URL"]]}})
    app.register_blueprint(health_bp)
    app.register_blueprint(telemetry_bp)
