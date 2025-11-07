from datetime import timedelta

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """Application settings loaded from environment variables."""

    model_config = SettingsConfigDict(env_file=".env", case_sensitive=False)

    # Application
    app_name: str = "Budget CAR API"
    env: str = "dev"

    # Database
    database_url: str = "postgresql://user:pass@localhost:5432/testdb"

    # CORS
    cors_origins: str = "*"

    # JWT Authentication
    jwt_secret: str = "dev-secret-change-me-in-production"
    jwt_algorithm: str = "HS256"
    access_token_minutes: int = 30

    # Refresh Tokens (optional; set to 'true' to enable sessions table writes)
    use_refresh_tokens: bool = False
    refresh_token_days: int = 30

    # Password Reset
    reset_token_minutes: int = 60
    reset_token_secret: str = "dev-reset-secret-change-me"

    @property
    def access_token_expire(self) -> timedelta:
        """Get access token expiration as timedelta."""
        return timedelta(minutes=self.access_token_minutes)

    @property
    def refresh_token_expire(self) -> timedelta:
        """Get refresh token expiration as timedelta."""
        return timedelta(days=self.refresh_token_days)

    @property
    def reset_token_expire(self) -> timedelta:
        """Get reset token expiration as timedelta."""
        return timedelta(minutes=self.reset_token_minutes)


settings = Settings()
