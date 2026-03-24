from __future__ import annotations

from functools import lru_cache
from typing import List

from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file='.env', env_file_encoding='utf-8', extra='ignore')

    environment: str = Field(default='development', alias='ENVIRONMENT')
    log_level: str = Field(default='INFO', alias='LOG_LEVEL')

    gitlab_client_id: str = Field(default='', alias='GITLAB_CLIENT_ID')
    gitlab_client_secret: str = Field(default='', alias='GITLAB_CLIENT_SECRET')
    gitlab_redirect_uri: str = Field(default='http://localhost:8000/auth/gitlab/callback', alias='GITLAB_REDIRECT_URI')

    jwt_secret: str = Field(default='dev-secret-change-me-please-32-chars', alias='JWT_SECRET')
    jwt_algorithm: str = Field(default='HS256', alias='JWT_ALGORITHM')
    jwt_expire_days: int = Field(default=7, alias='JWT_EXPIRE_DAYS')

    database_url: str = Field(default='', alias='DATABASE_URL')
    encryption_key: str = Field(default='', alias='ENCRYPTION_KEY')

    api_port: int = Field(default=8000, alias='API_PORT')
    allowed_origins: str = Field(
        default='http://localhost:3000,http://localhost:5173,https://incident-autopilot-three.vercel.app',
        alias='ALLOWED_ORIGINS',
    )

    agent_callback_secret: str = Field(default='', alias='AGENT_CALLBACK_SECRET')

    @property
    def cors_origins(self) -> List[str]:
        return [origin.strip() for origin in self.allowed_origins.split(',') if origin.strip()]

    @property
    def dev_auth_bypass(self) -> bool:
        return self.environment.lower() == 'development'


@lru_cache(maxsize=1)
def get_settings() -> Settings:
    return Settings()