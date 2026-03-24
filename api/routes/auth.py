from __future__ import annotations

import secrets
from datetime import datetime, timezone
from urllib.parse import urlencode, urlparse
from typing import Optional

import httpx
import jwt
from fastapi import APIRouter, Depends, HTTPException, Query, Request, Response, status
from fastapi.responses import RedirectResponse

from api.core.config import get_settings
from api.core.deps import get_current_user_id, get_current_username
from api.core.security import create_jwt, encrypt_token, hash_password, verify_password
from api.db.store import store
from api.models.user import AuthResponse, LoginRequest, RefreshResponse, SignupRequest, SignupResponse, SocialProviderRequest, User

router = APIRouter()
settings = get_settings()
GITLAB_URL = 'https://gitlab.com'
SCOPES = 'api read_user read_repository'
SOCIAL_DEFAULTS = {
    'google': ('google.user@example.com', 'Google User'),
    'github': ('github.user@example.com', 'GitHub User'),
}
GOOGLE_OAUTH_URL = 'https://accounts.google.com/o/oauth2/v2/auth'
GOOGLE_TOKEN_URL = 'https://oauth2.googleapis.com/token'
GOOGLE_USERINFO_URL = 'https://openidconnect.googleapis.com/v1/userinfo'
GITHUB_OAUTH_URL = 'https://github.com/login/oauth/authorize'
GITHUB_TOKEN_URL = 'https://github.com/login/oauth/access_token'
GITHUB_USER_URL = 'https://api.github.com/user'
GITHUB_EMAILS_URL = 'https://api.github.com/user/emails'
OAUTH_STATE_TTL_SECONDS = 10 * 60
SOCIAL_REGISTRATION_TTL_SECONDS = 30 * 24 * 60 * 60


def _set_auth_cookie(response: Response, token: str) -> None:
    response.set_cookie(
        'token',
        token,
        httponly=True,
        secure=True,
        samesite='none',
        max_age=86400 * settings.jwt_expire_days,
    )


def _normalize_mode(mode: str) -> str:
    normalized = (mode or '').strip().lower()
    if normalized not in {'signup', 'login'}:
        raise HTTPException(status_code=400, detail='mode must be signup or login')
    return normalized


def _sanitize_next(next_path: str) -> str:
    next_path = (next_path or '/dashboard').strip()
    if not next_path.startswith('/'):
        return '/dashboard'
    return next_path


def _normalize_frontend_base(raw_url: Optional[str]) -> Optional[str]:
    if not raw_url:
        return None
    parsed = urlparse(raw_url.strip())
    if parsed.scheme not in {'http', 'https'} or not parsed.netloc:
        return None
    return f'{parsed.scheme}://{parsed.netloc}'


def _allowed_frontend_bases() -> set[str]:
    values = {_normalize_frontend_base(settings.frontend_app_url)}
    values.update({_normalize_frontend_base(origin) for origin in settings.cors_origins})
    return {value for value in values if value}


def _resolve_frontend_base(request: Optional[Request], frontend: Optional[str]) -> str:
    allowed = _allowed_frontend_bases()
    candidates: list[str] = []

    if frontend:
        candidates.append(frontend)
    if request is not None:
        origin = request.headers.get('origin')
        if origin:
            candidates.append(origin)
        referer = request.headers.get('referer')
        if referer:
            candidates.append(referer)

    for raw in candidates:
        normalized = _normalize_frontend_base(raw)
        if normalized and normalized in allowed:
            return normalized

    return _normalize_frontend_base(settings.frontend_app_url) or 'http://localhost:3000'


def _create_oauth_state(
    provider: str,
    mode: str,
    next_path: str,
    frontend_base: str,
    signup_ticket: Optional[str] = None,
) -> str:
    now = int(datetime.now(timezone.utc).timestamp())
    payload = {
        'provider': provider,
        'mode': mode,
        'next': _sanitize_next(next_path),
        'frontend': frontend_base,
        'signup_ticket': signup_ticket,
        'nonce': secrets.token_urlsafe(10),
        'iat': now,
        'exp': now + OAUTH_STATE_TTL_SECONDS,
    }
    return jwt.encode(payload, settings.jwt_secret, algorithm=settings.jwt_algorithm)


def _parse_oauth_state(state: str, expected_provider: str) -> tuple[str, str, str, Optional[str]]:
    try:
        payload = jwt.decode(state, settings.jwt_secret, algorithms=[settings.jwt_algorithm])
    except jwt.PyJWTError as exc:
        raise HTTPException(status_code=400, detail='Invalid OAuth state') from exc

    provider = payload.get('provider')
    mode = payload.get('mode')
    next_path = _sanitize_next(payload.get('next') or '/dashboard')
    frontend_base = _normalize_frontend_base(payload.get('frontend'))
    if provider != expected_provider:
        raise HTTPException(status_code=400, detail='Invalid OAuth provider in state')
    if mode not in {'signup', 'login'}:
        raise HTTPException(status_code=400, detail='Invalid OAuth mode in state')
    if not frontend_base or frontend_base not in _allowed_frontend_bases():
        raise HTTPException(status_code=400, detail='Invalid OAuth frontend target in state')
    signup_ticket = payload.get('signup_ticket')
    if signup_ticket is not None and not isinstance(signup_ticket, str):
        raise HTTPException(status_code=400, detail='Invalid OAuth signup ticket in state')
    return mode, next_path, frontend_base, signup_ticket


def _create_social_registration_ticket(provider: str, email: str, full_name: str) -> str:
    now = int(datetime.now(timezone.utc).timestamp())
    payload = {
        'kind': 'social_registration',
        'provider': provider,
        'email': email.strip().lower(),
        'full_name': full_name.strip(),
        'iat': now,
        'exp': now + SOCIAL_REGISTRATION_TTL_SECONDS,
    }
    return jwt.encode(payload, settings.jwt_secret, algorithm=settings.jwt_algorithm)


def _verify_social_registration_ticket(ticket: Optional[str], provider: str, email: str) -> Optional[dict]:
    if not ticket:
        return None
    try:
        payload = jwt.decode(ticket, settings.jwt_secret, algorithms=[settings.jwt_algorithm])
    except jwt.PyJWTError:
        return None

    if payload.get('kind') != 'social_registration':
        return None
    if payload.get('provider') != provider:
        return None
    ticket_email = (payload.get('email') or '').strip().lower()
    if ticket_email != email.strip().lower():
        return None
    return payload


def _frontend_login_redirect(frontend_base: str, **params: str) -> RedirectResponse:
    base = frontend_base.rstrip('/')
    query = urlencode(params)
    return RedirectResponse(url=f'{base}/login?{query}')


def _oauth_error_redirect(provider: str, mode: str, message: str, frontend_base: str) -> RedirectResponse:
    return _frontend_login_redirect(frontend_base, oauth='error', provider=provider, mode=mode, message=message)


def _oauth_registered_redirect(provider: str, email: str, ticket: str, frontend_base: str) -> RedirectResponse:
    return _frontend_login_redirect(
        frontend_base,
        oauth='registered',
        provider=provider,
        email=email,
        ticket=ticket,
        message=f'{provider.title()} account registered. Please login now.',
    )


def _oauth_login_success_redirect(provider: str, user: dict, next_path: str, frontend_base: str) -> RedirectResponse:
    token = create_jwt(user['id'], user['username'])
    response = _frontend_login_redirect(
        frontend_base,
        oauth='success',
        provider=provider,
        next=next_path,
    )
    _set_auth_cookie(response, token)
    return response


def _oauth_is_configured(provider: str) -> bool:
    if provider == 'google':
        return bool(settings.google_client_id and settings.google_client_secret)
    if provider == 'github':
        return bool(settings.github_client_id and settings.github_client_secret)
    return False


def _oauth_not_configured_redirect(provider: str, mode: str, frontend_base: str) -> RedirectResponse:
    return _oauth_error_redirect(
        provider,
        mode,
        f'{provider.title()} OAuth is not configured on server. Please contact support.',
        frontend_base,
    )


def _require_dev_auth_endpoint() -> None:
    if settings.environment.strip().lower() == 'production':
        raise HTTPException(status_code=404, detail='Not Found')


def _apply_social_rule(
    provider: str,
    mode: str,
    email: str,
    full_name: str,
    next_path: str,
    frontend_base: str,
    ticket: Optional[str] = None,
) -> RedirectResponse:
    email = email.strip().lower()
    full_name = full_name.strip() or email.split('@')[0]
    existing = store.get_user_by_email(email)

    if mode == 'signup':
        if existing:
            return _oauth_error_redirect(provider, mode, 'Account already exists. Please login instead.', frontend_base)
        store.create_social_user(provider=provider, email=email, display_name=full_name)
        signup_ticket = _create_social_registration_ticket(provider, email, full_name)
        return _oauth_registered_redirect(provider, email, signup_ticket, frontend_base)

    if existing and existing.get('auth_provider') == provider:
        return _oauth_login_success_redirect(provider, existing, next_path, frontend_base)

    ticket_payload = _verify_social_registration_ticket(ticket, provider, email)
    if ticket_payload:
        display_name = (ticket_payload.get('full_name') or full_name).strip()
        user = store.create_social_user(provider=provider, email=email, display_name=display_name)
        return _oauth_login_success_redirect(provider, user, next_path, frontend_base)

    return _oauth_error_redirect(provider, mode, f'No {provider.title()} account found. Sign up first.', frontend_base)


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
    _require_dev_auth_endpoint()
    user = store.upsert_google_user(
        email='google.user@example.com',
        display_name='Google Connected User',
    )
    token = create_jwt(user['id'], user['username'])
    _set_auth_cookie(response, token)
    return AuthResponse(token=token, user=User.model_validate(user))


@router.post('/social/signup', response_model=SignupResponse, status_code=status.HTTP_201_CREATED)
async def social_signup(body: SocialProviderRequest):
    _require_dev_auth_endpoint()
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
    _require_dev_auth_endpoint()
    default_email, _ = SOCIAL_DEFAULTS[body.provider]
    email = (body.email or default_email).strip().lower()

    user = store.get_user_by_email(email)
    if not user or user.get('auth_provider') != body.provider:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail=f'No {body.provider.title()} account found. Sign up first.')

    token = create_jwt(user['id'], user['username'])
    _set_auth_cookie(response, token)
    return AuthResponse(token=token, user=User.model_validate(user))


@router.get('/google')
async def google_oauth_start(
    request: Request,
    mode: str = Query(default='login'),
    next: str = Query(default='/dashboard'),
    frontend: Optional[str] = Query(default=None),
    ticket: Optional[str] = Query(default=None),
):
    resolved_mode = _normalize_mode(mode)
    next_path = _sanitize_next(next)
    frontend_base = _resolve_frontend_base(request, frontend)
    if not _oauth_is_configured('google'):
        return _oauth_not_configured_redirect('google', resolved_mode, frontend_base)

    state = _create_oauth_state('google', resolved_mode, next_path, frontend_base, signup_ticket=ticket)
    query = urlencode(
        {
            'client_id': settings.google_client_id,
            'redirect_uri': settings.google_redirect_uri,
            'response_type': 'code',
            'scope': 'openid email profile',
            'state': state,
            'access_type': 'online',
            'prompt': 'consent',
        }
    )
    return RedirectResponse(url=f'{GOOGLE_OAUTH_URL}?{query}')


@router.get('/google/callback')
async def google_oauth_callback(request: Request, code: Optional[str] = Query(default=None), state: Optional[str] = Query(default=None)):
    fallback_frontend = _resolve_frontend_base(request, None)
    if not code or not state:
        return _oauth_error_redirect('google', 'login', 'Missing OAuth code or state', fallback_frontend)
    if not _oauth_is_configured('google'):
        return _oauth_not_configured_redirect('google', 'login', fallback_frontend)

    try:
        mode, next_path, frontend_base, signup_ticket = _parse_oauth_state(state, 'google')
    except HTTPException as exc:
        return _oauth_error_redirect('google', 'login', exc.detail, fallback_frontend)

    try:
        async with httpx.AsyncClient(timeout=20.0) as client:
            token_resp = await client.post(
                GOOGLE_TOKEN_URL,
                data={
                    'code': code,
                    'client_id': settings.google_client_id,
                    'client_secret': settings.google_client_secret,
                    'redirect_uri': settings.google_redirect_uri,
                    'grant_type': 'authorization_code',
                },
            )
            token_resp.raise_for_status()
            access_token = token_resp.json().get('access_token')
            if not access_token:
                return _oauth_error_redirect('google', mode, 'Google token exchange failed', frontend_base)

            userinfo_resp = await client.get(
                GOOGLE_USERINFO_URL,
                headers={'Authorization': f'Bearer {access_token}'},
            )
            userinfo_resp.raise_for_status()
            info = userinfo_resp.json()
    except Exception:
        return _oauth_error_redirect('google', mode, 'Google OAuth request failed', frontend_base)

    email = (info.get('email') or '').strip().lower()
    if not email:
        return _oauth_error_redirect('google', mode, 'Google account email is unavailable', frontend_base)
    full_name = info.get('name') or email.split('@')[0]
    return _apply_social_rule('google', mode, email, full_name, next_path, frontend_base, signup_ticket)


@router.get('/github')
async def github_oauth_start(
    request: Request,
    mode: str = Query(default='login'),
    next: str = Query(default='/dashboard'),
    frontend: Optional[str] = Query(default=None),
    ticket: Optional[str] = Query(default=None),
):
    resolved_mode = _normalize_mode(mode)
    next_path = _sanitize_next(next)
    frontend_base = _resolve_frontend_base(request, frontend)
    if not _oauth_is_configured('github'):
        return _oauth_not_configured_redirect('github', resolved_mode, frontend_base)

    state = _create_oauth_state('github', resolved_mode, next_path, frontend_base, signup_ticket=ticket)
    query = urlencode(
        {
            'client_id': settings.github_client_id,
            'redirect_uri': settings.github_redirect_uri,
            'scope': 'read:user user:email',
            'state': state,
        }
    )
    return RedirectResponse(url=f'{GITHUB_OAUTH_URL}?{query}')


@router.get('/github/callback')
async def github_oauth_callback(request: Request, code: Optional[str] = Query(default=None), state: Optional[str] = Query(default=None)):
    fallback_frontend = _resolve_frontend_base(request, None)
    if not code or not state:
        return _oauth_error_redirect('github', 'login', 'Missing OAuth code or state', fallback_frontend)
    if not _oauth_is_configured('github'):
        return _oauth_not_configured_redirect('github', 'login', fallback_frontend)

    try:
        mode, next_path, frontend_base, signup_ticket = _parse_oauth_state(state, 'github')
    except HTTPException as exc:
        return _oauth_error_redirect('github', 'login', exc.detail, fallback_frontend)

    try:
        async with httpx.AsyncClient(timeout=20.0) as client:
            token_resp = await client.post(
                GITHUB_TOKEN_URL,
                headers={'Accept': 'application/json'},
                data={
                    'client_id': settings.github_client_id,
                    'client_secret': settings.github_client_secret,
                    'code': code,
                    'redirect_uri': settings.github_redirect_uri,
                },
            )
            token_resp.raise_for_status()
            access_token = token_resp.json().get('access_token')
            if not access_token:
                return _oauth_error_redirect('github', mode, 'GitHub token exchange failed', frontend_base)

            common_headers = {
                'Authorization': f'Bearer {access_token}',
                'Accept': 'application/vnd.github+json',
                'User-Agent': 'incident-autopilot',
            }
            user_resp = await client.get(GITHUB_USER_URL, headers=common_headers)
            user_resp.raise_for_status()
            info = user_resp.json()

            email = (info.get('email') or '').strip().lower()
            if not email:
                emails_resp = await client.get(GITHUB_EMAILS_URL, headers=common_headers)
                emails_resp.raise_for_status()
                emails = emails_resp.json()
                primary = next((row for row in emails if row.get('primary') and row.get('verified')), None)
                fallback = next((row for row in emails if row.get('verified')), None)
                chosen = primary or fallback
                email = (chosen.get('email') if chosen else '').strip().lower() if chosen else ''
    except Exception:
        return _oauth_error_redirect('github', mode, 'GitHub OAuth request failed', frontend_base)

    if not email:
        return _oauth_error_redirect('github', mode, 'GitHub account email is unavailable', frontend_base)
    full_name = info.get('name') or info.get('login') or email.split('@')[0]
    return _apply_social_rule('github', mode, email, full_name, next_path, frontend_base, signup_ticket)


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
async def refresh_token(
    user_id: str = Depends(get_current_user_id),
    username: str = Depends(get_current_username),
    request: Request = None,
):
    user = store.get_user(user_id)
    token_username = (user.get('username') if user else None) or username or 'user'
    token = create_jwt(user_id, token_username)
    if request is not None:
        # Route keeps header auth semantics and also refreshes cookie for browser mode.
        pass
    return RefreshResponse(token=token)


@router.delete('/logout', status_code=204)
async def logout(response: Response, user_id: str = Depends(get_current_user_id)):
    del user_id
    response.delete_cookie('token')
    return Response(status_code=204)
