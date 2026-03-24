from __future__ import annotations

import hmac
from datetime import datetime, timezone
from typing import Optional

from fastapi import APIRouter, Header, HTTPException, Request

from api.db.store import store
from api.routes.ws import manager

router = APIRouter()


def _is_protected_branch(ref: Optional[str]) -> bool:
    return (ref or '').lower() in {'main', 'master', 'production', 'prod', 'release'}


def _validate_webhook_secret(received: Optional[str], expected: Optional[str]) -> bool:
    if not expected:
        return True
    return hmac.compare_digest(received or '', expected)


@router.post('/gitlab')
async def gitlab_webhook(
    request: Request,
    x_gitlab_token: Optional[str] = Header(default=None),
    x_gitlab_event: Optional[str] = Header(default=None),
):
    payload = await request.json()
    project_id = payload.get('project', {}).get('id')
    if not project_id:
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
                'status': 'ANALYZING',
                'severity': 'critical' if ref in {'main', 'master'} else 'warning',
                'error_type': 'pipeline_failure',
                'error_summary': pipeline.get('detailed_status', 'Pipeline failed'),
                'title': f"Pipeline failure - {repo['project_name']} - {ref}",
                'triggered_at': datetime.now(timezone.utc).isoformat(),
                'type': 'CI/CD',
            }
        )

        await manager.push_to_user(
            repo['user_id'],
            {
                'type': 'incident.created',
                'incident': {'id': incident['id'], 'status': incident['status']},
            },
        )

    return {'status': 'received'}