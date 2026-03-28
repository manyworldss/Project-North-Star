import os
from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    first_superuser: str = "admin@example.com"
    first_superuser_password: str = "changethis"
    
    # Database
    # PostgreSQL automatically provisioned by Railway, otherwise fallback to local SQLite.
    _db_url = os.getenv("DATABASE_URL", "sqlite:///./backend.db")
    if _db_url.startswith("postgres://"):
        _db_url = _db_url.replace("postgres://", "postgresql://", 1)
    database_url: str = _db_url
    echo_sql: bool = False
    secret_key: str = os.getenv("SECRET_KEY", "CHANGE_ME_IN_PROD")

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore"
    )

settings = Settings()
