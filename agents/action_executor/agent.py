from __future__ import annotations

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
        api_url = context.get('__api_callback_url')
        if not api_url:
            return
        try:
            httpx.post(
                api_url,
                json={
                    'incident_id': context.get('incident_id'),
                    'issue_url': issue.get('web_url'),
                    'status': 'resolved',
                },
                timeout=5,
            )
        except Exception:
            return