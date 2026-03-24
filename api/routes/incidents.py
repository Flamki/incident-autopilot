from __future__ import annotations

from datetime import datetime, timezone
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, Query, status

from api.core.deps import get_current_user_id
from api.db.store import store
from api.models.incident import (
    AgentRun,
    DismissIncidentRequest,
    Incident,
    IncidentListResponse,
    RetryAgentRequest,
)
from api.routes.ws import manager

router = APIRouter()


def _validate_incident(user_id: str, incident_id: str) -> dict:
    incident = store.get_incident(user_id, incident_id)
    if not incident:
        raise HTTPException(status_code=404, detail='Incident not found')
    return incident


@router.get('', response_model=IncidentListResponse)
async def list_incidents(
    user_id: str = Depends(get_current_user_id),
    limit: int = Query(default=50, ge=1, le=200),
    offset: int = Query(default=0, ge=0),
    search: Optional[str] = None,
    status_filter: Optional[str] = Query(default=None, alias='status'),
    severity: Optional[str] = None,
    repo_id: Optional[str] = None,
):
    items = store.list_incidents(user_id)

    if search:
        needle = search.lower()
        items = [
            i
            for i in items
            if needle in (i.get('title') or '').lower()
            or needle in i['id'].lower()
            or needle in (i.get('error_summary') or '').lower()
        ]
    if status_filter:
        items = [i for i in items if (i.get('status') or '').upper() == status_filter.upper()]
    if severity:
        items = [i for i in items if (i.get('severity') or '').lower() == severity.lower()]
    if repo_id:
        items = [i for i in items if i.get('repo_id') == repo_id]

    total = len(items)
    sliced = items[offset : offset + limit]
    return IncidentListResponse(items=[Incident.model_validate(i) for i in sliced], total=total, limit=limit, offset=offset)


@router.get('/{incident_id}', response_model=Incident)
async def get_incident(incident_id: str, user_id: str = Depends(get_current_user_id)):
    incident = _validate_incident(user_id, incident_id)
    return Incident.model_validate(incident)


@router.patch('/{incident_id}/approve', response_model=Incident)
async def approve_incident(incident_id: str, user_id: str = Depends(get_current_user_id)):
    incident = _validate_incident(user_id, incident_id)

    if incident.get('status') == 'RESOLVED':
        raise HTTPException(status_code=409, detail='Incident already resolved')

    now = datetime.now(timezone.utc).isoformat()
    incident = store.update_incident(
        incident,
        status='RESOLVED',
        approved_by=user_id,
        approved_at=now,
        resolved_at=now,
        gitlab_issue_iid=incident.get('gitlab_issue_iid') or 999,
        gitlab_issue_url=incident.get('gitlab_issue_url') or f"https://gitlab.com/demo/project/-/issues/{incident.get('gitlab_issue_iid') or 999}",
    )

    await manager.push_to_user(
        user_id,
        {
            'type': 'incident.resolved',
            'incident_id': incident_id,
            'status': 'RESOLVED',
            'issue_url': incident.get('gitlab_issue_url'),
        },
    )

    return Incident.model_validate(incident)


@router.patch('/{incident_id}/dismiss', response_model=Incident)
async def dismiss_incident(
    incident_id: str,
    body: DismissIncidentRequest,
    user_id: str = Depends(get_current_user_id),
):
    incident = _validate_incident(user_id, incident_id)
    now = datetime.now(timezone.utc).isoformat()
    incident = store.update_incident(
        incident,
        status='DISMISSED',
        dismissed_by=user_id,
        dismissed_at=now,
        dismissed_reason=body.reason,
    )

    await manager.push_to_user(
        user_id,
        {
            'type': 'incident.status',
            'incident_id': incident_id,
            'status': 'DISMISSED',
        },
    )
    return Incident.model_validate(incident)


@router.patch('/{incident_id}/reopen', response_model=Incident)
async def reopen_incident(incident_id: str, user_id: str = Depends(get_current_user_id)):
    incident = _validate_incident(user_id, incident_id)
    incident = store.update_incident(
        incident,
        status='ANALYZING',
        dismissed_by=None,
        dismissed_at=None,
        dismissed_reason=None,
        resolved_at=None,
    )

    await manager.push_to_user(
        user_id,
        {
            'type': 'incident.status',
            'incident_id': incident_id,
            'status': 'ANALYZING',
        },
    )
    return Incident.model_validate(incident)


@router.get('/{incident_id}/agents', response_model=list[AgentRun])
async def get_incident_agents(incident_id: str, user_id: str = Depends(get_current_user_id)):
    _validate_incident(user_id, incident_id)
    return [AgentRun.model_validate(r) for r in store.get_agent_runs(incident_id)]


@router.post('/{incident_id}/retry-agent', response_model=AgentRun, status_code=status.HTTP_201_CREATED)
async def retry_agent(
    incident_id: str,
    body: RetryAgentRequest,
    user_id: str = Depends(get_current_user_id),
):
    _validate_incident(user_id, incident_id)

    index_map = {
        'log_analyzer': 1,
        'commit_bisector': 2,
        'code_context': 3,
        'owner_finder': 4,
        'recovery_planner': 5,
        'action_executor': 6,
    }
    run = store.create_agent_run(
        {
            'incident_id': incident_id,
            'agent_name': body.agent_name,
            'agent_index': index_map.get(body.agent_name, 99),
            'status': 'running',
        }
    )

    await manager.push_to_user(
        user_id,
        {
            'type': 'agent.started',
            'incident_id': incident_id,
            'agent': body.agent_name,
        },
    )

    return AgentRun.model_validate(run)