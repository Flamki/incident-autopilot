from __future__ import annotations

from starlette.middleware.base import BaseHTTPMiddleware
from starlette.requests import Request
from starlette.responses import JSONResponse

from api.core.config import get_settings
from api.core.security import get_bearer_token, verify_jwt
from api.db.store import store


class AuthMiddleware(BaseHTTPMiddleware):
    def __init__(self, app):
        super().__init__(app)
        self.settings = get_settings()

    async def dispatch(self, request: Request, call_next):
        path = request.url.path
        if self._is_public(path):
            return await call_next(request)

        token = get_bearer_token(request.headers.get('Authorization')) or request.cookies.get('token')

        if not token and self.settings.dev_auth_bypass:
            request.state.user_id = store.demo_user_id
            request.state.username = 'demo.user'
            return await call_next(request)

        if not token:
            return JSONResponse(status_code=401, content={'error': 'unauthorized', 'detail': 'Missing token'})

        try:
            payload = verify_jwt(token)
        except Exception as exc:
            detail = getattr(exc, 'detail', 'Invalid token')
            return JSONResponse(status_code=401, content={'error': 'unauthorized', 'detail': detail})

        request.state.user_id = payload.get('sub')
        request.state.username = payload.get('username', '')
        return await call_next(request)

    @staticmethod
    def _is_public(path: str) -> bool:
        public_prefixes = ['/auth/', '/webhooks/', '/health', '/docs', '/openapi.json', '/redoc']
        return path == '/' or any(path.startswith(prefix) for prefix in public_prefixes)
