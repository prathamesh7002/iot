from flask import Flask

from .config import Config
from .extensions import cors
from .routes import api_bp


def create_app(config_class=Config):
    app = Flask(__name__)
    app.config.from_object(config_class)

    register_extensions(app)
    register_blueprints(app)

    @app.get("/")
    def home():
        return {
            "message": "Flask backend is running",
            "service": "backend",
            "version": "v1",
        }

    return app


def register_extensions(app):
    cors.init_app(
        app,
        resources={r"/api/*": {"origins": app.config["CORS_ORIGINS"]}},
        supports_credentials=True,
    )


def register_blueprints(app):
    app.register_blueprint(api_bp, url_prefix="/api/v1")
