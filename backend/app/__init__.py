from flask import Flask

from .config import Config
from .routes import register_routes
from .services.db import initialize_database


def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)

    initialize_database(app.config["DATABASE_PATH"])
    register_routes(app)

    return app
