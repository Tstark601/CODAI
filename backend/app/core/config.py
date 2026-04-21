from pydantic_settings import BaseSettings
from pydantic import Field


class Settings(BaseSettings):
    # App
    APP_NAME: str = "CODAI"
    APP_VERSION: str = "1.0.0"
    DEBUG: bool = True
    SECRET_KEY: str = Field(..., min_length=32)

    # JWT
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7

    # Database (Supabase PostgreSQL)
    DATABASE_URL: str
    SUPABASE_URL: str
    SUPABASE_KEY: str

    # Groq API (David AI)
    GROQ_API_KEY: str
    GROQ_MODEL: str = "llama-3.3-70b-versatile"

    # CORS
    FRONTEND_URL: str = "http://localhost:4200"

    model_config = {"env_file": ".env", "extra": "ignore"}


settings = Settings()
