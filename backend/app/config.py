import os
from pathlib import Path

from dotenv import load_dotenv

BASE_DIR = Path(__file__).resolve().parent.parent
load_dotenv(BASE_DIR / ".env")


class Config:
    SECRET_KEY = os.getenv("SECRET_KEY", "change-me")
    DEBUG = os.getenv("FLASK_DEBUG", "0") == "1"
    PORT = int(os.getenv("PORT", "5000"))
    FRONTEND_URL = os.getenv("FRONTEND_URL", "http://localhost:5173")
    DATABASE_PATH = str(BASE_DIR / os.getenv("DATABASE_PATH", "app/data/iot.db"))
    TEMP_FAULT_THRESHOLD = float(os.getenv("TEMP_FAULT_THRESHOLD", "50"))
    CURRENT_FAULT_THRESHOLD = int(os.getenv("CURRENT_FAULT_THRESHOLD", "600"))
