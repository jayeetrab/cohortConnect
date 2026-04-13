from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    PROJECT_NAME: str = "CohortConnect API"
    SECRET_KEY: str = ""
    MONGODB_URI: str = ""
    GOOGLE_API_KEY: str = ""
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 43200  # 30 days

    class Config:
        env_file = ".env"
        extra = "ignore"

settings = Settings()