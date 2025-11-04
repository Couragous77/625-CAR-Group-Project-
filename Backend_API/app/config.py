import os
from datetime import timedelta
from dotenv import load_dotenv

load_dotenv()

class Settings:
    APP_NAME = "BudgetCAR API"
    ENV = os.getenv("ENV", "dev")

    # DB credentials 
    DATABASE_URL = os.getenv("DATABASE_URL")  

    # JWT
    JWT_SECRET = os.getenv("JWT_SECRET", "dev-secret-change-me")
    JWT_ALG = "HS256"
    ACCESS_TOKEN_EXPIRE = timedelta(minutes=int(os.getenv("ACCESS_TOKEN_MINUTES", "30")))

    # Refresh tokens (optional; set to 'true' to enable sessions table writes)
    USE_REFRESH_TOKENS = os.getenv("USE_REFRESH_TOKENS", "false").lower() == "true"
    REFRESH_TOKEN_EXPIRE = timedelta(days=int(os.getenv("REFRESH_TOKEN_DAYS", "30")))

    # Password reset
    RESET_TOKEN_EXPIRE = timedelta(minutes=int(os.getenv("RESET_TOKEN_MINUTES", "60")))
    RESET_TOKEN_SECRET = os.getenv("RESET_TOKEN_SECRET", "dev-reset-secret")

settings = Settings()
