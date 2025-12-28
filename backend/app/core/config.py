from functools import lru_cache
from typing import List

from pydantic import AnyHttpUrl, field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """Application settings loaded from environment variables."""

    app_name: str = "Diag360 API"
    environment: str = "local"
    debug: bool = False

    postgres_user: str = "diag360"
    postgres_password: str = "diag360pwd"
    postgres_db: str = "diag360"
    postgres_host: str = "db"
    postgres_port: int = 5432

    database_url: str | None = None

    cors_origins: List[AnyHttpUrl] = [AnyHttpUrl("http://localhost:5173")]

    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", extra="ignore")

    @field_validator("database_url", mode="before")
    @classmethod
    def assemble_db_connection(cls, v: str | None, info):
        if isinstance(v, str) and v:
            return v
        data = info.data
        return (
            f"postgresql+psycopg://{data.get('postgres_user')}:{data.get('postgres_password')}"
            f"@{data.get('postgres_host')}:{data.get('postgres_port')}/{data.get('postgres_db')}"
        )


@lru_cache
def get_settings() -> Settings:
    return Settings()


settings = get_settings()
