from __future__ import annotations

import os
from datetime import datetime, timezone

import httpx

from shared.base_agent import BaseAgent

from .issue_formatter import format_incident_issue


class ActionExecutorAgent(BaseAgent):
    def run(self, context: dict) -> dict:
        project_id = context['project_id']

        issue_payload = {
            'title': self._generate_title(context),
            'description': self._format_issue(context),
            'labels': 'incident,incident:critical,autopilot-created',
            'assignee_ids': [context.get('ownership', {}).get('gitlab_user_id')] if context.get('ownership', {}).get('gitlab_user_id') else [],
        }

        created_issue = self.gitlab.post(f'/projects/{project_id}/issues', data=issue_payload)
        self._notify_api_server(context, created_issue)

        return {
            'gitlab_issue_url': created_issue.get('web_url'),
            'gitlab_issue_iid': created_issue.get('iid'),
            'status': 'completed',
        }

    @staticmethod
    def _generate_title(context: dict) -> str:
        stage = context.get('pipeline', {}).get('failed_stage', 'unknown')
        etype = context.get('pipeline', {}).get('error_type', 'failure')
        sha = (context.get('breaking_commit', {}).get('breaking_commit_sha') or '?')[:7]
        return f'[INCIDENT] {etype} in {stage} stage - commit {sha}'

    @staticmethod
    def _format_issue(context: dict) -> str:
        return format_incident_issue(context)

    @staticmethod
    def _notify_api_server(context: dict, issue: dict) -> None:
        api_url = context.get('__api_callback_url') or os.getenv('API_CALLBACK_URL')
        if not api_url:
            return
        callback_secret = context.get('__api_callback_secret') or os.getenv('API_CALLBACK_SECRET')
        payload = {
            'context': {
                'incident_id': context.get('incident_id'),
                'project_id': context.get('project_id'),
                'project_path': context.get('project_path'),
                'pipeline_id': context.get('pipeline_id'),
                'pipeline_ref': context.get('pipeline_ref'),
                'pipeline_url': context.get('pipeline_url'),
                'pipeline': context.get('pipeline') or {},
                'breaking_commit': context.get('breaking_commit') or {},
                'code_context': context.get('code_context') or {},
                'ownership': context.get('ownership') or {},
                'recovery_plan': context.get('recovery_plan') or {},
                'gitlab_issue_url': issue.get('web_url'),
                'gitlab_issue_iid': issue.get('iid'),
                'status': context.get('status') or 'PENDING_APPROVAL',
                'completed_at': datetime.now(timezone.utc).isoformat(),
            }
        }
        headers = {'content-type': 'application/json'}
        if callback_secret:
            headers['x-agent-callback-secret'] = callback_secret
        try:
            httpx.post(
                api_url,
                json=payload,
                headers=headers,
                timeout=8,
            )
        except Exception:
            return
