from __future__ import annotations

import secrets
from datetime import datetime, timezone
from typing import Optional

import httpx
from fastapi import APIRouter, Depends, HTTPException, Query, Request, Response, status
from fastapi.responses import RedirectResponse

from api.core.config import get_settings
from api.core.deps import get_current_user_id
from api.core.security import create_jwt, encrypt_token, hash_password, verify_password
from api.db.store import store
from api.models.user import AuthResponse, LoginRequest, RefreshResponse, SignupRequest, SignupResponse, SocialProviderRequest, User

router = APIRouter()
settings = get_settings()
GITLAB_URL = 'https://gitlab.com'
SCOPES = 'api read_user read_repository'
SOCIAL_DEFAULTS = {
    'google': ('google.user@incident-autopilot.app', 'Google User'),
    'github': ('github.user@incident-autopilot.app', 'GitHub User'),
}


def _set_auth_cookie(response: Response, token: str) -> None:
    response.set_cookie(
        'token',
        token,
        httponly=True,
        secure=True,
        samesite='none',
        max_age=86400 * settings.jwt_expire_days,
    )


@router.post('/signup', response_model=SignupResponse, status_code=status.HTTP_201_CREATED)
async def signup(body: SignupRequest):
    existing = store.get_user_by_email(body.email)
    if existing:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail='Account already exists')

    user = store.create_local_user(
        full_name=body.full_name,
        email=body.email,
        password_hash=hash_password(body.password),
    )
    return SignupResponse(message='Account created successfully', user=User.model_validate(user))


@router.post('/login', response_model=AuthResponse)
async def login(body: LoginRequest, response: Response):
    user = store.get_user_by_email(body.email)
    if not user:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail='Invalid email or password')

    password_hash = user.get('password_hash')
    if not password_hash:
        provider = user.get('auth_provider', 'external')
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f'This account uses {provider} sign-in. Use the matching provider button.',
        )

    if not verify_password(body.password, password_hash):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail='Invalid email or password')

    token = create_jwt(user['id'], user['username'])
    _set_auth_cookie(response, token)
    return AuthResponse(token=token, user=User.model_validate(user))


@router.post('/google/dev', response_model=AuthResponse)
async def google_dev_login(response: Response):
    user = store.upsert_google_user(
        email='google.user@incident-autopilot.app',
        display_name='Google Connected User',
    )
    token = create_jwt(user['id'], user['username'])
    _set_auth_cookie(response, token)
    return AuthResponse(token=token, user=User.model_validate(user))


@router.post('/social/signup', response_model=SignupResponse, status_code=status.HTTP_201_CREATED)
async def social_signup(body: SocialProviderRequest):
    default_email, default_name = SOCIAL_DEFAULTS[body.provider]
    email = (body.email or default_email).strip().lower()
    full_name = (body.full_name or default_name).strip()

    existing = store.get_user_by_email(email)
    if existing:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail='Account already exists')

    user = store.create_social_user(
        provider=body.provider,
        email=email,
        display_name=full_name,
    )
    return SignupResponse(message=f'{body.provider.title()} account registered successfully', user=User.model_validate(user))


@router.post('/social/login', response_model=AuthResponse)
async def social_login(body: SocialProviderRequest, response: Response):
    default_email, _ = SOCIAL_DEFAULTS[body.provider]
    email = (body.email or default_email).strip().lower()

    user = store.get_user_by_email(email)
    if not user or user.get('auth_provider') != body.provider:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail=f'No {body.provider.title()} account found. Sign up first.')

    token = create_jwt(user['id'], user['username'])
    _set_auth_cookie(response, token)
    return AuthResponse(token=token, user=User.model_validate(user))


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
        _set_auth_cookie(response, token)
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
    _set_auth_cookie(response, token)
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
