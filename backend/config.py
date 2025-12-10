import os
from datetime import timedelta

class BaseConfig:
    SECRET_KEY = os.environ.get("SECRET_KEY", "dev-secret-key")
    SESSION_COOKIE_NAME = "adaptbtc_session"
    PERMANENT_SESSION_LIFETIME = timedelta(days=14)
    TEMPLATES_AUTO_RELOAD = True
    STATIC_FOLDER = os.path.join(os.path.dirname(__file__), "static")
    TEMPLATE_FOLDER = os.path.join(os.path.dirname(__file__), "templates")
    CONTENT_FOLDER = os.path.join(os.path.dirname(__file__), "..", "education", "content")
    MANIFEST_PATH = os.path.join(CONTENT_FOLDER, "catalog_manifest.json")
    SQLALCHEMY_DATABASE_URI = os.environ.get("DATABASE_URL", "sqlite:///adaptbtc.db")
    SQLALCHEMY_TRACK_MODIFICATIONS = False

class DevelopmentConfig(BaseConfig):
    DEBUG = True
    ENV = "development"

class ProductionConfig(BaseConfig):
    DEBUG = False
    ENV = "production"

CONFIG_MAP = {
    "development": DevelopmentConfig,
    "production": ProductionConfig,
}

def get_config():
    env = os.environ.get("FLASK_ENV", "development")
    return CONFIG_MAP.get(env, DevelopmentConfig)
