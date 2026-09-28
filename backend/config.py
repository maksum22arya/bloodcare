import os

BASE_DIR = os.path.dirname(os.path.abspath(__file__))


class Config:
    """Runtime configuration. DATA_DIR is injected via env in docker-compose.yml
    and backed by the bloodcare-data volume; falls back to a local folder so the
    backend can also run outside Docker for development."""

    DATA_DIR = os.environ.get("DATA_DIR", os.path.join(BASE_DIR, "data"))
    os.makedirs(DATA_DIR, exist_ok=True)

    DELETE_PASSWORD = os.environ.get("DELETE_PASSWORD", "")
    SQLALCHEMY_DATABASE_URI = "sqlite:///" + os.path.join(DATA_DIR, "bloodcare.db")
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    JSON_SORT_KEYS = False
