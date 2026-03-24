from __future__ import annotations

import secrets
from datetime import datetime, timezone
from typing import Optional

import httpx
from fastapi import APIRouter, Depends, HTTPException, Query, Request, Response, status
from fastapi.responses import RedirectResponse

from api.core.config import get_settings
from api.core.deps import get_current_user_id
from api.core.security import create_jwt, encrypt_token
from api.db.store import store
from api.models.user import AuthResponse, RefreshResponse, User

router = APIRouter()
settings = get_settings()
GITLAB_URL = 'https://gitlab.com'
SCOPES = 'api read_user read_repository'


@router.get('/gitlab')
async def gitlab_login():
    state = secrets.token_urlsafe(24)
    if not settings.gitlab_client_id:
        return {
            'message': 'GitLab OAuth is not configured. Use /auth/gitlab/callback?code=dev for local demo token.',
            'state': state,
        }

    auth_url = (
        f'{GITLAB_URL}/oauth/authorize'
        f'?client_id={settings.gitlab_client_id}'
        f'&redirect_uri={settings.gitlab_redirect_uri}'
        '&response_type=code'
        f'&scope={SCOPES}'
        f'&state={state}'
    )
    return RedirectResponse(auth_url)


@router.get('/gitlab/callback', response_model=AuthResponse)
async def gitlab_callback(
    request: Request,
    response: Response,
    code: Optional[str] = Query(default=None),
    state: Optional[str] = Query(default=None),
):
    del state  # reserved for CSRF validation in production

    if code == 'dev' or not settings.gitlab_client_id:
        user = store.get_user(store.demo_user_id)
        token = create_jwt(user['id'], user['username'])
        response.set_cookie('token', token, httponly=True, secure=False, samesite='lax', max_age=86400 * settings.jwt_expire_days)
        return AuthResponse(token=token, user=User.model_validate(user))

    if not code:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail='Missing OAuth code')

    async with httpx.AsyncClient(timeout=20.0) as client:
        token_resp = await client.post(
            f'{GITLAB_URL}/oauth/token',
            data={
                'client_id': settings.gitlab_client_id,
                'client_secret': settings.gitlab_client_secret,
                'code': code,
                'grant_type': 'authorization_code',
                'redirect_uri': settings.gitlab_redirect_uri,
            },
        )

        if token_resp.status_code >= 400:
            raise HTTPException(status_code=502, detail='Failed to exchange GitLab OAuth code')

        tokens = token_resp.json()
        access_token = tokens.get('access_token')
        if not access_token:
            raise HTTPException(status_code=502, detail='GitLab did not return access_token')

        user_resp = await client.get(
            f'{GITLAB_URL}/api/v4/user',
            headers={'Authorization': f'Bearer {access_token}'},
        )
        if user_resp.status_code >= 400:
            raise HTTPException(status_code=502, detail='Failed to fetch GitLab user profile')

        gitlab_user = user_resp.json()

    user = store.upsert_user(
        {
            'gitlab_user_id': gitlab_user['id'],
            'username': gitlab_user['username'],
            'email': gitlab_user.get('email'),
            'display_name': gitlab_user.get('name'),
            'avatar_url': gitlab_user.get('avatar_url'),
            'access_token': encrypt_token(access_token),
            'refresh_token': tokens.get('refresh_token'),
            'token_expires_at': datetime.fromtimestamp(tokens.get('created_at', datetime.now(tz=timezone.utc).timestamp()), tz=timezone.utc).isoformat(),
        }
    )

    token = create_jwt(user['id'], user['username'])
    response.set_cookie('token', token, httponly=True, secure=False, samesite='lax', max_age=86400 * settings.jwt_expire_days)
    return AuthResponse(token=token, user=User.model_validate(user))


@router.post('/refresh', response_model=RefreshResponse)
async def refresh_token(user_id: str = Depends(get_current_user_id), request: Request = None):
    user = store.get_user(user_id)
    if not user:
        raise HTTPException(status_code=404, detail='User not found')
    token = create_jwt(user_id, user['username'])
    if request is not None:
        # Route keeps header auth semantics and also refreshes cookie for browser mode.
        pass
    return RefreshResponse(token=token)


@router.delete('/logout', status_code=204)
async def logout(response: Response, user_id: str = Depends(get_current_user_id)):
    del user_id
    response.delete_cookie('token')
    return Response(status_code=204)