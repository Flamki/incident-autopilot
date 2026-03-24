from __future__ import annotations

from typing import Any, Dict, Optional

from pydantic import BaseModel, Field


class UserSettings(BaseModel):
    id: str
    user_id: str
    notification_email: bool = True
    notification_slack: bool = False
    slack_webhook_url: Optional[str] = None
    min_confidence: float = 0.6
    lookback_hours: int = 48
    agents_enabled: Dict[str, Any] = Field(default_factory=lambda: {'all': True})
    quiet_hours_start: Optional[str] = None
    quiet_hours_end: Optional[str] = None
    created_at: Optional[str] = None


class AgentSettings(BaseModel):
    agents_enabled: Dict[str, Any]


class NotificationSettings(BaseModel):
    notification_email: bool = True
    notification_slack: bool = False
    slack_webhook_url: Optional[str] = None


class UpdateSettingsRequest(BaseModel):
    notification_email: Optional[bool] = None
    notification_slack: Optional[bool] = None
    slack_webhook_url: Optional[str] = None
    min_confidence: Optional[float] = None
    lookback_hours: Optional[int] = None
    quiet_hours_start: Optional[str] = None
    quiet_hours_end: Optional[str] = None


class UpdateAgentSettingsRequest(BaseModel):
    agents_enabled: Dict[str, Any]


class UpdateNotificationSettingsRequest(BaseModel):
    notification_email: Optional[bool] = None
    notification_slack: Optional[bool] = None
    slack_webhook_url: Optional[str] = None