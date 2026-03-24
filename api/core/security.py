from __future__ import annotations

import base64
from datetime import datetime, timedelta, timezone
from typing import Any, Optional

import jwt
from cryptography.fernet import Fernet
from fastapi import HTTPException, status

from api.core.config import get_settings


def _get_fernet() -> Optional[Fernet]:
    settings = get_settings()
    if not settings.encryption_key:
        return None
    return Fernet(settings.encryption_key.encode('utf-8'))


def encrypt_token(token: str) -> str:
    fernet = _get_fernet()
    if not fernet:
        return base64.urlsafe_b64encode(token.encode('utf-8')).decode('utf-8')
    return fernet.encrypt(token.encode('utf-8')).decode('utf-8')


def decrypt_token(token: str) -> str:
    fernet = _get_fernet()
    if not fernet:
        return base64.urlsafe_b64decode(token.encode('utf-8')).decode('utf-8')
    return fernet.decrypt(token.encode('utf-8')).decode('utf-8')


def create_jwt(user_id: str, username: str) -> str:
    settings = get_settings()
    now = datetime.now(timezone.utc)
    payload = {
        'sub': user_id,
        'username': username,
        'iat': int(now.timestamp()),
        'exp': int((now + timedelta(days=settings.jwt_expire_days)).timestamp()),
    }
    return jwt.encode(payload, settings.jwt_secret, algorithm=settings.jwt_algorithm)


def verify_jwt(token: str) -> dict[str, Any]:
    settings = get_settings()
    try:
        return jwt.decode(token, settings.jwt_secret, algorithms=[settings.jwt_algorithm])
    except jwt.ExpiredSignatureError as exc:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail='Token expired') from exc
    except jwt.PyJWTError as exc:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail='Invalid token') from exc


def get_bearer_token(header_value: Optional[str]) -> Optional[str]:
    if not header_value:
        return None
    if not header_value.lower().startswith('bearer '):
        return None
    return header_value.split(' ', 1)[1].strip() or None