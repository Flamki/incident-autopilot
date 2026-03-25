from __future__ import annotations

import secrets
import time

import httpx
from fastapi import APIRouter, Depends, HTTPException, Request, Response, status

from api.core.config import get_settings
from api.core.deps import get_current_user_id
from api.core.security import decrypt_token
from api.db.store import store
from api.models.incident import Incident
from api.models.repo import CreateRepositoryRequest, GitLabProjectSummary, RepoTestResponse, Repository

router = APIRouter()
settings = get_settings()
GITLAB_API_BASE = 'https://gitlab.com/api/v4'


def _public_api_base(request: Request) -> str:
    if settings.public_api_base_url:
        return settings.public_api_base_url.rstrip('/')
    return f'{request.url.scheme}://{request.url.netloc}'


def _gitlab_request(token: str, method: str, path: str, *, params: dict | None = None, data: dict | None = None):
    url = f'{GITLAB_API_BASE}{path}'
    headers = {'PRIVATE-TOKEN': token, 'Content-Type': 'application/json'}
    try:
        response = httpx.request(method, url, headers=headers, params=params, json=data, timeout=20.0)
        response.raise_for_status()
        return response.json()
    except httpx.HTTPError as exc:
        raise HTTPException(status_code=502, detail='GitLab API request failed') from exc


def _gitlab_client_for_user(user_id: str) -> tuple[dict, str]:
    user = store.get_user(user_id)
    if not user:
        raise HTTPException(status_code=404, detail='User not found')
    encrypted_token = user.get('access_token')
    token = ''
    if encrypted_token:
        try:
            token = decrypt_token(encrypted_token)
        except Exception as exc:  # pragma: no cover - defensive fallback
            raise HTTPException(status_code=500, detail='Stored GitLab token is invalid') from exc
    if not token:
        token = settings.gitlab_access_token
    if not token:
        raise HTTPException(status_code=400, detail='GitLab is not connected. Login with GitLab or set GITLAB_ACCESS_TOKEN.')
    return user, token


@router.get('', response_model=list[Repository])
async def list_repositories(user_id: str = Depends(get_current_user_id)):
    return [Repository.model_validate(r) for r in store.list_repos(user_id)]


@router.get('/discover', response_model=list[GitLabProjectSummary])
async def discover_repositories(
    request: Request,
    user_id: str = Depends(get_current_user_id),
    search: str | None = None,
):
    del request
    _, token = _gitlab_client_for_user(user_id)
    params = {'membership': True, 'simple': True, 'per_page': 100, 'order_by': 'last_activity_at', 'sort': 'desc'}
    if search:
        params['search'] = search

    projects = _gitlab_request(token, 'GET', '/projects', params=params)

    return [
        GitLabProjectSummary.model_validate(
            {
                'id': project.get('id'),
                'path_with_namespace': project.get('path_with_namespace'),
                'name': project.get('name'),
                'web_url': project.get('web_url'),
                'default_branch': project.get('default_branch'),
            }
        )
        for project in projects
        if project.get('id') and project.get('path_with_namespace')
    ]


@router.post('', response_model=Repository, status_code=status.HTTP_201_CREATED)
async def create_repository(body: CreateRepositoryRequest, request: Request, user_id: str = Depends(get_current_user_id)):
    existing = store.get_repo_by_project_id(body.gitlab_project_id)
    if existing and existing.get('is_active'):
        raise HTTPException(status_code=409, detail='Repository is already connected')

    token = ''
    try:
        _, token = _gitlab_client_for_user(user_id)
    except HTTPException:
        token = ''

    if not token:
        if not body.project_path:
            raise HTTPException(
                status_code=400,
                detail='GitLab token is unavailable. Provide project_path for manual repository registration.',
            )
        payload = body.model_dump()
        payload['project_name'] = body.project_name or body.project_path.split('/')[-1]
        payload['webhook_secret'] = body.webhook_secret or secrets.token_urlsafe(32)
        payload['webhook_id'] = None
        payload['project_url'] = body.project_url or f'https://gitlab.com/{body.project_path}'
        repo = store.create_repo(user_id, payload)
        return Repository.model_validate(repo)

    project = _gitlab_request(token, 'GET', f'/projects/{body.gitlab_project_id}')

    webhook_secret = body.webhook_secret or secrets.token_urlsafe(32)
    webhook_url = f'{_public_api_base(request)}/webhooks/gitlab'
    webhook_id = body.webhook_id

    try:
        webhook = _gitlab_request(
            token,
            'POST',
            f'/projects/{body.gitlab_project_id}/hooks',
            data={
                'url': webhook_url,
                'token': webhook_secret,
                'push_events': False,
                'pipeline_events': True,
                'enable_ssl_verification': True,
            },
        )
        webhook_id = webhook.get('id')
    except Exception:
        try:
            hooks = _gitlab_request(token, 'GET', f'/projects/{body.gitlab_project_id}/hooks')
            existing_hook = next((hook for hook in hooks if hook.get('url') == webhook_url), None)
            webhook_id = existing_hook.get('id') if existing_hook else webhook_id
        except Exception as exc:
            raise HTTPException(status_code=502, detail='Failed to create or verify GitLab webhook') from exc

    payload = body.model_dump()
    payload['project_path'] = project.get('path_with_namespace') or body.project_path or str(body.gitlab_project_id)
    payload['project_name'] = body.project_name or project.get('name') or payload['project_path'].split('/')[-1]
    payload['project_url'] = body.project_url or project.get('web_url')
    payload['branch'] = body.branch or project.get('default_branch') or 'main'
    payload['webhook_id'] = webhook_id
    payload['webhook_secret'] = webhook_secret

    repo = store.create_repo(user_id, payload)
    return Repository.model_validate(repo)


@router.delete('/{repo_id}', status_code=204)
async def delete_repository(repo_id: str, user_id: str = Depends(get_current_user_id)):
    ok = store.deactivate_repo(user_id, repo_id)
    if not ok:
        raise HTTPException(status_code=404, detail='Repository not found')
    return Response(status_code=204)


@router.get('/{repo_id}/test', response_model=RepoTestResponse)
async def test_repository_connection(repo_id: str, user_id: str = Depends(get_current_user_id)):
    repo = store.get_repo(user_id, repo_id)
    if not repo:
        raise HTTPException(status_code=404, detail='Repository not found')

    token = ''
    try:
        _, token = _gitlab_client_for_user(user_id)
    except HTTPException:
        token = ''
    started = time.perf_counter()
    if not token:
        return RepoTestResponse(status='manual', latency=0)
    _gitlab_request(token, 'GET', f'/projects/{repo["gitlab_project_id"]}')
    latency_ms = int((time.perf_counter() - started) * 1000)
    return RepoTestResponse(status='ok', latency=latency_ms)


@router.get('/{repo_id}/incidents', response_model=list[Incident])
async def list_repo_incidents(repo_id: str, user_id: str = Depends(get_current_user_id)):
    repo = store.get_repo(user_id, repo_id)
    if not repo:
        raise HTTPException(status_code=404, detail='Repository not found')
    incidents = store.list_incidents_for_repo(user_id, repo_id)
    return [Incident.model_validate(i) for i in incidents]
