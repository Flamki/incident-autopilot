from __future__ import annotations

from fastapi import HTTPException, Request, status


def get_current_user_id(request: Request) -> str:
    user_id = getattr(request.state, 'user_id', None)
    if not user_id:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail='Unauthorized')
    return user_id


def get_current_username(request: Request) -> str:
    return getattr(request.state, 'username', '')