from __future__ import annotations

from fastapi import APIRouter, Depends

from api.core.deps import get_current_user_id
from api.db.store import store
from api.models.settings import (
    AgentSettings,
    NotificationSettings,
    UpdateAgentSettingsRequest,
    UpdateNotificationSettingsRequest,
    UpdateSettingsRequest,
    UserSettings,
)

router = APIRouter()


@router.get('', response_model=UserSettings)
async def get_settings(user_id: str = Depends(get_current_user_id)):
    return UserSettings.model_validate(store.get_settings(user_id))


@router.put('', response_model=UserSettings)
async def update_settings(body: UpdateSettingsRequest, user_id: str = Depends(get_current_user_id)):
    changes = {k: v for k, v in body.model_dump().items() if v is not None}
    settings = store.update_settings(user_id, changes)
    return UserSettings.model_validate(settings)


@router.get('/agents', response_model=AgentSettings)
async def get_agent_settings(user_id: str = Depends(get_current_user_id)):
    settings = store.get_settings(user_id)
    return AgentSettings(agents_enabled=settings.get('agents_enabled', {'all': True}))


@router.put('/agents', response_model=AgentSettings)
async def update_agent_settings(body: UpdateAgentSettingsRequest, user_id: str = Depends(get_current_user_id)):
    settings = store.update_settings(user_id, {'agents_enabled': body.agents_enabled})
    return AgentSettings(agents_enabled=settings.get('agents_enabled', {'all': True}))


@router.get('/notifications', response_model=NotificationSettings)
async def get_notification_settings(user_id: str = Depends(get_current_user_id)):
    settings = store.get_settings(user_id)
    return NotificationSettings.model_validate(settings)


@router.put('/notifications', response_model=NotificationSettings)
async def update_notification_settings(
    body: UpdateNotificationSettingsRequest,
    user_id: str = Depends(get_current_user_id),
):
    changes = {k: v for k, v in body.model_dump().items() if v is not None}
    settings = store.update_settings(user_id, changes)
    return NotificationSettings.model_validate(settings)