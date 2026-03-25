from __future__ import annotations

import hmac
from datetime import datetime, timezone
from typing import Optional

from fastapi import APIRouter, BackgroundTasks, Header, HTTPException, Request

from api.core.config import get_settings
from api.db.store import store
from api.routes.ws import manager
from api.services.agent_runtime import run_incident_pipeline

router = APIRouter()
settings = get_settings()


def _is_protected_branch(ref: Optional[str]) -> bool:
    return (ref or '').lower() in {'main', 'master', 'production', 'prod', 'release'}


def _validate_webhook_secret(received: Optional[str], expected: Optional[str]) -> bool:
    if not expected:
        return True
    return hmac.compare_digest(received or '', expected)


def _runtime_mode() -> str:
    return (settings.agent_runtime_mode or 'gitlab_duo').strip().lower()


def _coerce_int(value: object) -> int | None:
    if value is None or value == '':
        return None
    if isinstance(value, bool):
        return None
    if isinstance(value, int):
        return value
    try:
        return int(str(value).strip())
    except (TypeError, ValueError):
        return None


def _extract_pipeline_meta(context: dict) -> tuple[int | None, str | None, str | None]:
    pipeline = context.get('pipeline') if isinstance(context.get('pipeline'), dict) else {}
    pipeline_id = _coerce_int(context.get('pipeline_id')) or _coerce_int(pipeline.get('id'))
    pipeline_ref = context.get('pipeline_ref') or pipeline.get('ref')
    pipeline_url = context.get('pipeline_url') or pipeline.get('web_url') or pipeline.get('url')
    return pipeline_id, pipeline_ref, pipeline_url


def _normalize_callback_status(raw_status: object) -> str:
    normalized = str(raw_status or '').strip().upper().replace('-', '_').replace(' ', '_')
    if normalized in {'ANALYZING', 'AGENTS_RUNNING', 'PENDING_APPROVAL', 'RESOLVED', 'DISMISSED', 'ERROR'}:
        return normalized
    if normalized in {'COMPLETED', 'SUCCESS', 'SUCCEEDED'}:
        return 'PENDING_APPROVAL'
    if normalized in {'FAILED', 'FAILURE'}:
        return 'ERROR'
    return 'PENDING_APPROVAL'


def _resolve_incident_for_callback(context: dict) -> dict | None:
    incident_id = context.get('incident_id')
    if incident_id:
        incident = store.get_incident_any(str(incident_id))
        if incident:
            return incident

    project_obj = context.get('project') if isinstance(context.get('project'), dict) else {}
    project_id = _coerce_int(context.get('project_id')) or _coerce_int(project_obj.get('id'))
    pipeline_id, pipeline_ref, pipeline_url = _extract_pipeline_meta(context)
    if project_id is None:
        return None

    repo = store.get_repo_by_project_id(project_id)
    if not repo:
        return None

    candidates = store.list_incidents_for_repo(repo['user_id'], repo['id'])
    if pipeline_id is not None:
        for item in candidates:
            if _coerce_int(item.get('gitlab_pipeline_id')) == pipeline_id:
                return item

    if candidates:
        return candidates[0]

    return store.create_incident(
        {
            'id': str(incident_id) if incident_id else None,
            'user_id': repo['user_id'],
            'repo_id': repo['id'],
            'gitlab_pipeline_id': pipeline_id,
            'pipeline_ref': pipeline_ref,
            'pipeline_url': pipeline_url,
            'status': 'AGENTS_RUNNING',
            'severity': 'warning',
            'error_type': 'pipeline_failure',
            'error_summary': 'Created from GitLab Duo callback',
            'title': f"Pipeline failure - {repo['project_name']} - {pipeline_ref or 'unknown'}",
            'triggered_at': context.get('triggered_at') or datetime.now(timezone.utc).isoformat(),
            'type': 'CI/CD',
        }
    )


@router.post('/gitlab')
async def gitlab_webhook(
    request: Request,
    background_tasks: BackgroundTasks,
    x_gitlab_token: Optional[str] = Header(default=None),
    x_gitlab_event: Optional[str] = Header(default=None),
):
    payload = await request.json()
    project_id = _coerce_int(payload.get('project', {}).get('id'))
    if project_id is None:
        return {'status': 'ignored', 'reason': 'missing_project'}

    repo = store.get_repo_by_project_id(project_id)
    if not repo:
        return {'status': 'repo_not_monitored'}

    if not _validate_webhook_secret(x_gitlab_token, repo.get('webhook_secret')):
        raise HTTPException(status_code=401, detail='Invalid webhook token')

    if x_gitlab_event == 'Pipeline Hook':
        pipeline = payload.get('object_attributes', {})
        if pipeline.get('status') != 'failed':
            return {'status': 'ignored', 'reason': 'pipeline_not_failed'}

        ref = pipeline.get('ref')
        if not _is_protected_branch(ref):
            return {'status': 'ignored', 'reason': 'not_protected_branch'}

        incident = store.create_incident(
            {
                'user_id': repo['user_id'],
                'repo_id': repo['id'],
                'gitlab_pipeline_id': pipeline.get('id'),
                'pipeline_ref': ref,
                'pipeline_url': pipeline.get('web_url'),
                'status': 'AGENTS_RUNNING' if _runtime_mode() == 'gitlab_duo' else 'ANALYZING',
                'severity': 'critical' if ref in {'main', 'master'} else 'warning',
                'error_type': 'pipeline_failure',
                'error_summary': pipeline.get(
                    'detailed_status',
                    'Pipeline failed - waiting for GitLab Duo agents' if _runtime_mode() == 'gitlab_duo' else 'Pipeline failed',
                ),
                'title': f"Pipeline failure - {repo['project_name']} - {ref}",
                'triggered_at': datetime.now(timezone.utc).isoformat(),
                'type': 'CI/CD',
            }
        )
        if _runtime_mode() == 'local':
            background_tasks.add_task(run_incident_pipeline, incident['id'])

        await manager.push_to_user(
            repo['user_id'],
            {
                'type': 'incident.created',
                'incident': {'id': incident['id'], 'status': incident['status']},
            },
        )

    return {'status': 'received'}


@router.post('/agent-callback')
async def agent_callback(
    request: Request,
    x_agent_callback_secret: Optional[str] = Header(default=None),
):
    if settings.agent_callback_secret and not hmac.compare_digest(x_agent_callback_secret or '', settings.agent_callback_secret):
        raise HTTPException(status_code=401, detail='Invalid callback secret')

    payload = await request.json()
    if not isinstance(payload, dict):
        raise HTTPException(status_code=400, detail='Invalid callback payload')

    context = payload.get('context') if isinstance(payload.get('context'), dict) else payload
    if not isinstance(context, dict):
        raise HTTPException(status_code=400, detail='Invalid callback payload')

    incident = _resolve_incident_for_callback(context)
    if not incident:
        raise HTTPException(status_code=404, detail='No matching incident/repository for callback')

    pipeline = context.get('pipeline') if isinstance(context.get('pipeline'), dict) else {}
    if not pipeline and isinstance(context.get('pipeline_analysis'), dict):
        pipeline = context.get('pipeline_analysis')
    breaking_commit = context.get('breaking_commit') if isinstance(context.get('breaking_commit'), dict) else {}
    code_context = context.get('code_context') if isinstance(context.get('code_context'), dict) else {}
    ownership = context.get('ownership') if isinstance(context.get('ownership'), dict) else {}
    recovery_plan = context.get('recovery_plan') if isinstance(context.get('recovery_plan'), dict) else {}
    issue = context.get('issue') if isinstance(context.get('issue'), dict) else {}
    issue_url = context.get('gitlab_issue_url') or context.get('issue_url') or issue.get('web_url')
    issue_iid = context.get('gitlab_issue_iid') or context.get('issue_iid') or issue.get('iid')
    next_status = _normalize_callback_status(context.get('status') or payload.get('status'))
    pipeline_id, pipeline_ref, pipeline_url = _extract_pipeline_meta(context)

    store.update_incident(
        incident,
        gitlab_pipeline_id=pipeline_id or incident.get('gitlab_pipeline_id'),
        pipeline_ref=pipeline_ref or incident.get('pipeline_ref'),
        pipeline_url=pipeline_url or incident.get('pipeline_url'),
        pipeline_analysis=pipeline or incident.get('pipeline_analysis') or {},
        breaking_commit=breaking_commit or incident.get('breaking_commit') or {},
        code_context=code_context or incident.get('code_context') or {},
        ownership=ownership or incident.get('ownership') or {},
        recovery_plan=recovery_plan or incident.get('recovery_plan') or {},
        gitlab_issue_url=issue_url or incident.get('gitlab_issue_url'),
        gitlab_issue_iid=issue_iid or incident.get('gitlab_issue_iid'),
        status=next_status,
        error_type=(pipeline.get('error_type') if pipeline else None) or context.get('error_type') or incident.get('error_type'),
        error_summary=(pipeline.get('error_summary') if pipeline else None) or context.get('error_summary') or incident.get('error_summary'),
        agents_completed_at=context.get('completed_at') or datetime.now(timezone.utc).isoformat(),
    )

    await manager.push_to_user(
        incident['user_id'],
        {
            'type': 'incident.updated',
            'incident_id': incident['id'],
            'status': next_status,
        },
    )

    return {'status': 'ok', 'incident_id': incident['id']}
