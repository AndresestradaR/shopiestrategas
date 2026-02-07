from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    DATABASE_URL: str = "postgresql+asyncpg://minishop:minishop_dev@localhost:5432/minishop"
    SECRET_KEY: str = "change-me-in-production"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7
    UPLOAD_DIR: str = "./uploads"
    # Cloudflare R2 (S3-compatible) — set these in production
    R2_ACCOUNT_ID: str | None = None
    R2_ACCESS_KEY_ID: str | None = None
    R2_SECRET_ACCESS_KEY: str | None = None
    R2_BUCKET_NAME: str | None = None
    R2_PUBLIC_URL: str | None = None  # e.g. https://pub-xxx.r2.dev
    CORS_ORIGINS: list[str] = [
        "http://localhost:5173",
        "http://localhost:5174",
        "http://localhost:3000",
        "http://localhost:3001",
    ]
    CORS_ALLOW_REGEX: str | None = None  # e.g. r"https://.*\.minishop\.co"

    model_config = {"env_file": ".env", "env_file_encoding": "utf-8"}


settings = Settings()
