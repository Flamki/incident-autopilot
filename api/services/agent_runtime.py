from __future__ import annotations

import asyncio
import json
import time
from datetime import datetime, timezone
from types import SimpleNamespace
from typing import Any

import httpx

from agents.action_executor.agent import ActionExecutorAgent
from agents.code_context.agent import CodeContextAgent
from agents.commit_bisector.agent import CommitBisectorAgent
from agents.log_analyzer.agent import LogAnalyzerAgent
from agents.owner_finder.agent import OwnerFinderAgent
from agents.recovery_planner.agent import RecoveryPlannerAgent
from api.core.config import get_settings
from api.core.security import decrypt_token
from api.db.store import store
from api.routes.ws import manager
from shared.gitlab_client import GitLabClient

settings = get_settings()


class AnthropicModelClient:
    def __init__(self, api_key: str, model: str, api_base: str) -> None:
        self.api_key = api_key
        self.model = model
        self.api_base = api_base
        self.last_output_tokens = 0

    def complete(self, prompt: str, max_tokens: int = 1000):
        payload = {
            'model': self.model,
            'max_tokens': max_tokens,
            'temperature': 0.2,
            'messages': [{'role': 'user', 'content': prompt}],
        }
        headers = {
            'x-api-key': self.api_key,
            'anthropic-version': '2023-06-01',
            'content-type': 'application/json',
        }
        response = httpx.post(self.api_base, headers=headers, json=payload, timeout=45.0)
        response.raise_for_status()
        data = response.json()

        blocks = data.get('content') or []
        text = '\n'.join(block.get('text', '') for block in blocks if block.get('type') == 'text').strip()
        usage = data.get('usage') or {}
        self.last_output_tokens = int(usage.get('output_tokens') or 0)
        return SimpleNamespace(text=text)


class FallbackJsonModel:
    def __init__(self) -> None:
        self.last_output_tokens = 0

    def complete(self, prompt: str, max_tokens: int = 1000):
        del max_tokens
        lowered = prompt.lower()
        if '"error_type"' in prompt and '"error_summary"' in prompt:
            text = json.dumps(
                {
                    'error_type': 'unknown',
                    'error_summary': 'Fallback analysis: pipeline failed but Claude API is unavailable.',
                    'affected_files': [],
                    'confidence': 0.3,
                }
            )
        elif '"breaking_commit_sha"' in prompt:
            text = json.dumps(
                {
                    'breaking_commit_sha': '',
                    'confidence_score': 0.2,
                    'reasoning': 'Fallback analysis: no reliable candidate without Claude.',
                    'alternative_sha': None,
                    'alternative_confidence': 0.0,
                }
            )
        elif '"affected_functions"' in prompt and '"root_cause_hypothesis"' in prompt:
            text = json.dumps(
                {
                    'affected_functions': [],
                    'root_cause_hypothesis': 'Fallback analysis: insufficient semantic context without Claude.',
                    'bug_class': 'config',
                    'complexity_score': 3,
                }
            )
        elif '"recommendation"' in prompt and '"rollback_command"' in prompt:
            text = json.dumps(
                {
                    'recommendation': 'retry',
                    'urgency': 'medium',
                    'reasoning': 'Fallback plan: rerun failing jobs and inspect logs for deterministic failure.',
                    'steps': ['Retry failed pipeline job', 'Review error logs', 'Escalate if repeated'],
                    'rollback_command': None,
                    'estimated_minutes': 15,
                    'risk_level': 'medium',
                    'prevention': 'Add stronger pre-merge pipeline checks.',
                }
            )
        elif 'gitlab issue' in lowered or '"title"' in prompt:
            text = json.dumps({'title': 'Fallback incident issue'})
        else:
            text = json.dumps({'ok': True})
        return SimpleNamespace(text=text)


def _build_model():
    if settings.anthropic_api_key:
        return AnthropicModelClient(settings.anthropic_api_key, settings.anthropic_model, settings.anthropic_api_base)
    return FallbackJsonModel()


def _gitlab_client_for_user(user_id: str) -> GitLabClient:
    user = store.get_user(user_id)
    encrypted = user.get('access_token') if user else None
    if encrypted:
        token = decrypt_token(encrypted)
        return GitLabClient(token)
    if settings.gitlab_access_token:
        return GitLabClient(settings.gitlab_access_token)
    raise RuntimeError('No GitLab access token available for agent runtime')


def _mark_agent_failed(run_id: str, started_at: float, error: Exception) -> None:
    store.update_agent_run(
        run_id,
        status='failed',
        completed_at=datetime.now(timezone.utc).isoformat(),
        duration_ms=int((time.perf_counter() - started_at) * 1000),
        error_message=str(error),
    )


def _merge_agent_outputs(incident: dict, context: dict[str, Any]) -> None:
    pipeline = context.get('pipeline') or {}
    store.update_incident(
        incident,
        pipeline_analysis=pipeline,
        breaking_commit=context.get('breaking_commit') or {},
        code_context=context.get('code_context') or {},
        ownership=context.get('ownership') or {},
        recovery_plan=context.get('recovery_plan') or {},
        status='PENDING_APPROVAL',
        error_type=pipeline.get('error_type') or incident.get('error_type'),
        error_summary=pipeline.get('error_summary') or incident.get('error_summary'),
        agents_completed_at=datetime.now(timezone.utc).isoformat(),
        diagnosis_seconds=max(
            1,
            int(
                (
                    datetime.now(timezone.utc)
                    - datetime.fromisoformat((incident.get('triggered_at') or datetime.now(timezone.utc).isoformat()).replace('Z', '+00:00'))
                ).total_seconds()
            ),
        ),
    )


async def run_incident_pipeline(incident_id: str) -> None:
    incident = store.get_incident_any(incident_id)
    if not incident:
        return
    repo = store.get_repo_by_id(incident.get('repo_id'))
    if not repo:
        return

    store.update_incident(incident, status='AGENTS_RUNNING')
    await manager.push_to_user(
        incident['user_id'],
        {
            'type': 'incident.status',
            'incident_id': incident_id,
            'status': 'AGENTS_RUNNING',
        },
    )

    context: dict[str, Any] = {
        'incident_id': incident_id,
        'project_id': repo['gitlab_project_id'],
        'pipeline_id': incident.get('gitlab_pipeline_id'),
        'pipeline_ref': incident.get('pipeline_ref') or repo.get('branch') or 'main',
        'pipeline': incident.get('pipeline_analysis') or {},
    }

    model = _build_model()
    gitlab = None
    gitlab_boot_error = ''
    try:
        gitlab = await asyncio.to_thread(_gitlab_client_for_user, incident['user_id'])
    except Exception as exc:
        gitlab_boot_error = str(exc)

    if gitlab is None:
        context['pipeline'] = context.get('pipeline') or {
            'failed_stage': 'unknown',
            'failed_job': 'unknown',
            'error_type': incident.get('error_type') or 'pipeline_failure',
            'error_summary': incident.get('error_summary') or 'Pipeline failed',
            'affected_files': [],
            'confidence': 0.4,
        }
        run = store.create_agent_run({'incident_id': incident_id, 'agent_name': 'recovery_planner', 'agent_index': 5, 'status': 'running'})
        started = time.perf_counter()
        try:
            result = await asyncio.to_thread(RecoveryPlannerAgent(model=model, gitlab_client=None).run, context)
            context.update(result)
            store.update_agent_run(
                run['id'],
                status='completed',
                completed_at=datetime.now(timezone.utc).isoformat(),
                duration_ms=int((time.perf_counter() - started) * 1000),
                claude_tokens=getattr(model, 'last_output_tokens', 0),
                output_snapshot=result,
            )
            _merge_agent_outputs(incident, context)
            if gitlab_boot_error:
                store.update_incident(
                    incident,
                    error_summary=f'{incident.get("error_summary") or "Pipeline failed"} (GitLab token missing: recovery plan generated in degraded mode)',
                )
        except Exception as exc:
            _mark_agent_failed(run['id'], started, exc)
            store.update_incident(
                incident,
                status='ERROR',
                error_summary=f'Agent runtime failed in degraded mode: {exc}',
            )
        return

    agent_specs = [
        ('log_analyzer', 1, LogAnalyzerAgent),
        ('commit_bisector', 2, CommitBisectorAgent),
        ('code_context', 3, CodeContextAgent),
        ('owner_finder', 4, OwnerFinderAgent),
        ('recovery_planner', 5, RecoveryPlannerAgent),
    ]

    for name, index, agent_cls in agent_specs:
        run = store.create_agent_run({'incident_id': incident_id, 'agent_name': name, 'agent_index': index, 'status': 'running'})
        started = time.perf_counter()

        try:
            result = await asyncio.to_thread(agent_cls(model=model, gitlab_client=gitlab).run, context)
            if isinstance(result, dict):
                context.update(result)
            store.update_agent_run(
                run['id'],
                status='completed',
                completed_at=datetime.now(timezone.utc).isoformat(),
                duration_ms=int((time.perf_counter() - started) * 1000),
                claude_tokens=getattr(model, 'last_output_tokens', 0),
                output_snapshot=result if isinstance(result, dict) else {'raw': str(result)},
            )
            await manager.push_to_user(
                incident['user_id'],
                {
                    'type': 'agent.completed',
                    'incident_id': incident_id,
                    'agent': name,
                },
            )
        except Exception as exc:
            _mark_agent_failed(run['id'], started, exc)

    _merge_agent_outputs(incident, context)
    await manager.push_to_user(
        incident['user_id'],
        {
            'type': 'incident.updated',
            'incident_id': incident_id,
            'status': incident.get('status'),
        },
    )


async def run_action_executor(incident_id: str) -> dict[str, Any] | None:
    incident = store.get_incident_any(incident_id)
    if not incident:
        return None
    repo = store.get_repo_by_id(incident.get('repo_id'))
    if not repo:
        return None

    context = {
        'incident_id': incident_id,
        'project_id': repo['gitlab_project_id'],
        'pipeline': incident.get('pipeline_analysis') or {},
        'breaking_commit': incident.get('breaking_commit') or {},
        'code_context': incident.get('code_context') or {},
        'ownership': incident.get('ownership') or {},
        'recovery_plan': incident.get('recovery_plan') or {},
    }

    try:
        gitlab = await asyncio.to_thread(_gitlab_client_for_user, incident['user_id'])
    except Exception:
        return None
    run = store.create_agent_run({'incident_id': incident_id, 'agent_name': 'action_executor', 'agent_index': 6, 'status': 'running'})
    started = time.perf_counter()
    try:
        result = await asyncio.to_thread(ActionExecutorAgent(gitlab_client=gitlab).run, context)
        store.update_agent_run(
            run['id'],
            status='completed',
            completed_at=datetime.now(timezone.utc).isoformat(),
            duration_ms=int((time.perf_counter() - started) * 1000),
            output_snapshot=result,
        )
        if result.get('gitlab_issue_iid'):
            store.update_incident(
                incident,
                gitlab_issue_iid=result.get('gitlab_issue_iid'),
                gitlab_issue_url=result.get('gitlab_issue_url'),
            )
        return result
    except Exception as exc:
        _mark_agent_failed(run['id'], started, exc)
        return None
