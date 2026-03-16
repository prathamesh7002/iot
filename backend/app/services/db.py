import sqlite3
from pathlib import Path


def get_connection(database_path):
    connection = sqlite3.connect(database_path)
    connection.row_factory = sqlite3.Row
    return connection


def initialize_database(database_path):
    Path(database_path).parent.mkdir(parents=True, exist_ok=True)

    with get_connection(database_path) as connection:
        connection.execute(
            """
            CREATE TABLE IF NOT EXISTS telemetry (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                temperature REAL NOT NULL,
                current_value INTEGER NOT NULL,
                vibration INTEGER NOT NULL,
                status TEXT NOT NULL,
                temperature_fault INTEGER NOT NULL,
                current_fault INTEGER NOT NULL,
                vibration_fault INTEGER NOT NULL,
                faults TEXT NOT NULL,
                created_at TEXT NOT NULL
            )
            """
        )
        connection.commit()
