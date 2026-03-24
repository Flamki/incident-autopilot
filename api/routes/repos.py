from __future__ import annotations

import random
import time

from fastapi import APIRouter, Depends, HTTPException, Response, status

from api.core.deps import get_current_user_id
from api.db.store import store
from api.models.incident import Incident
from api.models.repo import CreateRepositoryRequest, RepoTestResponse, Repository

router = APIRouter()


@router.get('', response_model=list[Repository])
async def list_repositories(user_id: str = Depends(get_current_user_id)):
    return [Repository.model_validate(r) for r in store.list_repos(user_id)]


@router.post('', response_model=Repository, status_code=status.HTTP_201_CREATED)
async def create_repository(body: CreateRepositoryRequest, user_id: str = Depends(get_current_user_id)):
    repo = store.create_repo(user_id, body.model_dump())
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

    started = time.perf_counter()
    time.sleep(random.uniform(0.01, 0.03))
    latency_ms = int((time.perf_counter() - started) * 1000)
    return RepoTestResponse(status='ok', latency=latency_ms)


@router.get('/{repo_id}/incidents', response_model=list[Incident])
async def list_repo_incidents(repo_id: str, user_id: str = Depends(get_current_user_id)):
    repo = store.get_repo(user_id, repo_id)
    if not repo:
        raise HTTPException(status_code=404, detail='Repository not found')
    incidents = store.list_incidents_for_repo(user_id, repo_id)
    return [Incident.model_validate(i) for i in incidents]