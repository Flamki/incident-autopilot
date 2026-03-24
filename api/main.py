from __future__ import annotations

from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from api.core.config import get_settings
from api.middleware.auth import AuthMiddleware
from api.routes import analytics, auth, incidents, me, repos, settings, webhooks, ws

settings_obj = get_settings()


@asynccontextmanager
async def lifespan(app: FastAPI):
    del app
    yield


app = FastAPI(
    title='Incident Autopilot API',
    description='Backend for Incident Autopilot - GitLab AI Hackathon 2026',
    version='1.0.0',
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings_obj.cors_origins,
    allow_credentials=True,
    allow_methods=['*'],
    allow_headers=['*'],
)

app.add_middleware(AuthMiddleware)

app.include_router(auth.router, prefix='/auth', tags=['Auth'])
app.include_router(incidents.router, prefix='/incidents', tags=['Incidents'])
app.include_router(repos.router, prefix='/repos', tags=['Repositories'])
app.include_router(settings.router, prefix='/settings', tags=['Settings'])
app.include_router(analytics.router, prefix='/analytics', tags=['Analytics'])
app.include_router(me.router, prefix='/me', tags=['Me'])
app.include_router(webhooks.router, prefix='/webhooks', tags=['Webhooks'])
app.include_router(ws.router, tags=['WebSocket'])


@app.get('/')
async def root():
    return {
        'name': 'Incident Autopilot API',
        'status': 'ok',
        'version': '1.0.0',
        'health': '/health',
        'docs': '/docs',
    }


@app.get('/health')
async def health():
    return {'status': 'ok', 'version': '1.0.0'}
