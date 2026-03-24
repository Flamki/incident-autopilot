from __future__ import annotations

from dataclasses import dataclass
from datetime import datetime, timedelta, timezone
import re
from typing import Any, Dict, List, Optional
from uuid import uuid4


@dataclass
class RequestUser:
    id: str
    username: str


def utcnow_iso() -> str:
    return datetime.now(timezone.utc).isoformat()


def minutes_ago(minutes: int) -> str:
    return (datetime.now(timezone.utc) - timedelta(minutes=minutes)).isoformat()


def seed_data() -> Dict[str, Any]:
    demo_user_id = str(uuid4())

    repos = [
        {
            'id': str(uuid4()),
            'user_id': demo_user_id,
            'gitlab_project_id': 1001,
            'project_path': 'org/api-service',
            'project_name': 'api-service',
            'project_url': 'https://gitlab.com/org/api-service',
            'webhook_id': 501,
            'webhook_secret': 'demo-webhook-secret',
            'is_active': True,
            'created_at': minutes_ago(300),
            'health': 98,
            'branch': 'main',
            'active_incidents': 1,
            'agents': 6,
            'type': 'Backend',
        },
        {
            'id': str(uuid4()),
            'user_id': demo_user_id,
            'gitlab_project_id': 1002,
            'project_path': 'org/auth-service',
            'project_name': 'auth-service',
            'project_url': 'https://gitlab.com/org/auth-service',
            'webhook_id': 502,
            'webhook_secret': 'demo-webhook-secret',
            'is_active': True,
            'created_at': minutes_ago(280),
            'health': 84,
            'branch': 'main',
            'active_incidents': 1,
            'agents': 4,
            'type': 'Auth',
        },
        {
            'id': str(uuid4()),
            'user_id': demo_user_id,
            'gitlab_project_id': 1003,
            'project_path': 'org/worker-node',
            'project_name': 'worker-node',
            'project_url': 'https://gitlab.com/org/worker-node',
            'webhook_id': 503,
            'webhook_secret': 'demo-webhook-secret',
            'is_active': True,
            'created_at': minutes_ago(260),
            'health': 96,
            'branch': 'main',
            'active_incidents': 0,
            'agents': 2,
            'type': 'Worker',
        },
    ]

    incidents = [
        {
            'id': '1042',
            'user_id': demo_user_id,
            'repo_id': repos[0]['id'],
            'gitlab_pipeline_id': 88771,
            'gitlab_issue_iid': None,
            'gitlab_issue_url': None,
            'status': 'PENDING_APPROVAL',
            'severity': 'critical',
            'pipeline_analysis': {
                'failed_stage': 'test',
                'failed_job': 'unit-tests',
                'error_type': 'test_failure',
                'error_summary': 'Auth middleware null-check regression breaks login tests.',
                'affected_files': ['src/middleware/auth.ts'],
                'confidence': 0.97,
            },
            'breaking_commit': {
                'breaking_commit_sha': 'a1b2c3d4e5f6g7h8i9j0',
                'confidence_score': 0.94,
                'reasoning': 'Recent OAuth refresh change modified null handling.',
                'author_username': 'john.doe',
                'commit_message': 'feat: add OAuth refresh handling',
            },
            'code_context': {
                'affected_functions': ['authenticateRequest'],
                'root_cause_hypothesis': 'user.profile is accessed without null-guard for guest sessions',
                'bug_class': 'logic_error',
                'complexity_score': 6,
            },
            'ownership': {
                'primary_owner': 'john.doe',
                'expertise_score': 9.2,
                'gitlab_user_id': 2001,
                'secondary_owners': ['jane.smith'],
            },
            'recovery_plan': {
                'recommendation': 'rollback',
                'urgency': 'critical',
                'reasoning': 'Rollback restores previous auth behavior fastest and safest.',
                'steps': [
                    'Revert commit a1b2c3d4e5f6g7h8i9j0',
                    'Re-run unit and smoke tests',
                    'Create hotfix PR with null-guard',
                ],
                'rollback_command': 'git revert a1b2c3d4e5f6g7h8i9j0',
                'estimated_minutes': 12,
                'risk_level': 'low',
                'prevention': 'Add regression tests for guest and null profile auth flows.',
            },
            'approved_by': None,
            'approved_at': None,
            'dismissed_by': None,
            'dismissed_at': None,
            'dismissed_reason': None,
            'triggered_at': minutes_ago(3),
            'agents_completed_at': minutes_ago(2),
            'resolved_at': None,
            'diagnosis_seconds': 73,
            'resolution_seconds': None,
            'pipeline_ref': 'main',
            'pipeline_url': 'https://gitlab.com/org/api-service/-/pipelines/88771',
            'error_type': 'test_failure',
            'error_summary': 'Auth middleware null-check regression breaks login tests.',
            'created_at': minutes_ago(3),
            'title': 'Pipeline failure - api-service - test stage',
            'type': 'CI/CD',
        },
        {
            'id': '1041',
            'user_id': demo_user_id,
            'repo_id': repos[1]['id'],
            'gitlab_pipeline_id': 88755,
            'gitlab_issue_iid': None,
            'gitlab_issue_url': None,
            'status': 'ANALYZING',
            'severity': 'warning',
            'pipeline_analysis': {
                'failed_stage': 'deploy',
                'failed_job': 'deploy-auth',
                'error_type': 'runtime_error',
                'error_summary': 'High 5xx rate detected after latest deploy.',
                'affected_files': ['src/services/session.ts'],
                'confidence': 0.89,
            },
            'breaking_commit': {},
            'code_context': {},
            'ownership': {},
            'recovery_plan': {},
            'approved_by': None,
            'approved_at': None,
            'dismissed_by': None,
            'dismissed_at': None,
            'dismissed_reason': None,
            'triggered_at': minutes_ago(12),
            'agents_completed_at': None,
            'resolved_at': None,
            'diagnosis_seconds': None,
            'resolution_seconds': None,
            'pipeline_ref': 'main',
            'pipeline_url': 'https://gitlab.com/org/auth-service/-/pipelines/88755',
            'error_type': 'runtime_error',
            'error_summary': 'High 5xx rate detected after latest deploy.',
            'created_at': minutes_ago(12),
            'title': 'High error rate - auth-service - production',
            'type': 'Runtime',
        },
        {
            'id': '1040',
            'user_id': demo_user_id,
            'repo_id': repos[2]['id'],
            'gitlab_pipeline_id': 88710,
            'gitlab_issue_iid': 77,
            'gitlab_issue_url': 'https://gitlab.com/org/worker-node/-/issues/77',
            'status': 'RESOLVED',
            'severity': 'resolved',
            'pipeline_analysis': {
                'failed_stage': 'load-test',
                'failed_job': 'wrk-load-test',
                'error_type': 'oom',
                'error_summary': 'Worker memory pressure exceeded request limits.',
                'affected_files': ['charts/worker/values.yaml'],
                'confidence': 0.91,
            },
            'breaking_commit': {
                'breaking_commit_sha': 'b7a8c9d0a1b2c3d4e5',
                'confidence_score': 0.79,
                'reasoning': 'Memory limits lowered in chart update.',
                'author_username': 'jane.smith',
                'commit_message': 'chore: optimize worker memory limits',
            },
            'code_context': {
                'root_cause_hypothesis': 'Memory request too low for peak queue volume',
                'bug_class': 'config',
            },
            'ownership': {
                'primary_owner': 'jane.smith',
                'expertise_score': 8.7,
            },
            'recovery_plan': {
                'recommendation': 'config_change',
                'steps': ['Increase memory limit', 'Redeploy worker', 'Monitor for 30 mins'],
                'estimated_minutes': 18,
                'risk_level': 'medium',
            },
            'approved_by': demo_user_id,
            'approved_at': minutes_ago(65),
            'dismissed_by': None,
            'dismissed_at': None,
            'dismissed_reason': None,
            'triggered_at': minutes_ago(90),
            'agents_completed_at': minutes_ago(80),
            'resolved_at': minutes_ago(70),
            'diagnosis_seconds': 121,
            'resolution_seconds': 1200,
            'pipeline_ref': 'main',
            'pipeline_url': 'https://gitlab.com/org/worker-node/-/pipelines/88710',
            'error_type': 'oom',
            'error_summary': 'Worker memory pressure exceeded request limits.',
            'created_at': minutes_ago(90),
            'title': 'Memory leak - worker-node - staging',
            'type': 'Infrastructure',
        },
    ]

    agent_runs = [
        {
            'id': str(uuid4()),
            'incident_id': '1042',
            'agent_name': 'log_analyzer',
            'agent_index': 1,
            'status': 'completed',
            'started_at': minutes_ago(3),
            'completed_at': minutes_ago(3),
            'duration_ms': 1200,
            'claude_tokens': 800,
            'error_message': None,
            'output_snapshot': incidents[0]['pipeline_analysis'],
        },
        {
            'id': str(uuid4()),
            'incident_id': '1042',
            'agent_name': 'commit_bisector',
            'agent_index': 2,
            'status': 'completed',
            'started_at': minutes_ago(3),
            'completed_at': minutes_ago(2),
            'duration_ms': 2200,
            'claude_tokens': 970,
            'error_message': None,
            'output_snapshot': incidents[0]['breaking_commit'],
        },
        {
            'id': str(uuid4()),
            'incident_id': '1042',
            'agent_name': 'code_context',
            'agent_index': 3,
            'status': 'completed',
            'started_at': minutes_ago(2),
            'completed_at': minutes_ago(2),
            'duration_ms': 1800,
            'claude_tokens': 720,
            'error_message': None,
            'output_snapshot': incidents[0]['code_context'],
        },
        {
            'id': str(uuid4()),
            'incident_id': '1042',
            'agent_name': 'owner_finder',
            'agent_index': 4,
            'status': 'completed',
            'started_at': minutes_ago(2),
            'completed_at': minutes_ago(2),
            'duration_ms': 900,
            'claude_tokens': 0,
            'error_message': None,
            'output_snapshot': incidents[0]['ownership'],
        },
        {
            'id': str(uuid4()),
            'incident_id': '1042',
            'agent_name': 'recovery_planner',
            'agent_index': 5,
            'status': 'completed',
            'started_at': minutes_ago(2),
            'completed_at': minutes_ago(2),
            'duration_ms': 1400,
            'claude_tokens': 1020,
            'error_message': None,
            'output_snapshot': incidents[0]['recovery_plan'],
        },
        {
            'id': str(uuid4()),
            'incident_id': '1041',
            'agent_name': 'log_analyzer',
            'agent_index': 1,
            'status': 'running',
            'started_at': minutes_ago(12),
            'completed_at': None,
            'duration_ms': None,
            'claude_tokens': None,
            'error_message': None,
            'output_snapshot': None,
        },
    ]

    settings = {
        demo_user_id: {
            'id': str(uuid4()),
            'user_id': demo_user_id,
            'notification_email': True,
            'notification_slack': False,
            'slack_webhook_url': None,
            'min_confidence': 0.6,
            'lookback_hours': 48,
            'agents_enabled': {
                'all': True,
                'log_analyzer': True,
                'commit_bisector': True,
                'code_context': True,
                'owner_finder': True,
                'recovery_planner': True,
                'action_executor': True,
            },
            'quiet_hours_start': None,
            'quiet_hours_end': None,
            'created_at': minutes_ago(300),
        }
    }

    team = [
        {
            'id': str(uuid4()),
            'name': 'John Doe',
            'username': 'john.doe',
            'role': 'Senior SRE',
            'email': 'john.doe@org.com',
            'expertise': ['api-service', 'auth-service', 'k8s'],
            'score': 9.2,
            'incidents': 42,
            'status': 'online',
            'initials': 'JD',
        },
        {
            'id': str(uuid4()),
            'name': 'Jane Smith',
            'username': 'jane.smith',
            'role': 'Platform Engineer',
            'email': 'jane.smith@org.com',
            'expertise': ['worker-node', 'db-proxy', 'terraform'],
            'score': 8.7,
            'incidents': 28,
            'status': 'online',
            'initials': 'JS',
        },
        {
            'id': str(uuid4()),
            'name': 'Alice Jones',
            'username': 'alice.jones',
            'role': 'Security Engineer',
            'email': 'alice.jones@org.com',
            'expertise': ['auth-service', 'db-proxy', 'vault'],
            'score': 9.5,
            'incidents': 34,
            'status': 'online',
            'initials': 'AJ',
        },
        {
            'id': str(uuid4()),
            'name': 'Charlie Brown',
            'username': 'charlie.brown',
            'role': 'SRE Associate',
            'email': 'charlie.brown@org.com',
            'expertise': ['gateway', 'api-service', 'logs'],
            'score': 6.8,
            'incidents': 12,
            'status': 'online',
            'initials': 'CB',
        },
    ]

    users = {
        demo_user_id: {
            'id': demo_user_id,
            'gitlab_user_id': 999001,
            'username': 'demo.user',
            'email': 'demo@incident-autopilot.dev',
            'display_name': 'Demo User',
            'avatar_url': None,
            'auth_provider': 'gitlab',
            'password_hash': None,
            'access_token': 'demo-access-token',
            'refresh_token': None,
            'token_expires_at': None,
            'created_at': minutes_ago(300),
            'updated_at': utcnow_iso(),
        }
    }

    return {
        'demo_user_id': demo_user_id,
        'users': users,
        'repos': {repo['id']: repo for repo in repos},
        'incidents': {item['id']: item for item in incidents},
        'agent_runs': {row['id']: row for row in agent_runs},
        'settings': settings,
        'team': team,
        'team_invites': [],
    }


class DataStore:
    def __init__(self) -> None:
        self._data = seed_data()

    @property
    def demo_user_id(self) -> str:
        return self._data['demo_user_id']

    def get_user(self, user_id: str) -> Optional[Dict[str, Any]]:
        return self._data['users'].get(user_id)

    def get_user_by_username(self, username: str) -> Optional[Dict[str, Any]]:
        return next((u for u in self._data['users'].values() if u['username'] == username), None)

    def get_user_by_email(self, email: str) -> Optional[Dict[str, Any]]:
        email_norm = email.strip().lower()
        return next((u for u in self._data['users'].values() if (u.get('email') or '').strip().lower() == email_norm), None)

    def _ensure_user_settings(self, user_id: str) -> None:
        if user_id in self._data['settings']:
            return
        self._data['settings'][user_id] = {
            'id': str(uuid4()),
            'user_id': user_id,
            'notification_email': True,
            'notification_slack': False,
            'slack_webhook_url': None,
            'min_confidence': 0.6,
            'lookback_hours': 48,
            'agents_enabled': {'all': True},
            'quiet_hours_start': None,
            'quiet_hours_end': None,
            'created_at': utcnow_iso(),
        }

    def _next_external_user_id(self) -> int:
        existing = [int(u.get('gitlab_user_id', 0) or 0) for u in self._data['users'].values()]
        return max(existing + [1_000_000]) + 1

    def _unique_username(self, base: str) -> str:
        candidate = re.sub(r'[^a-z0-9_.-]', '.', base.strip().lower()) or 'user'
        candidate = candidate[:24]
        usernames = {u['username'] for u in self._data['users'].values()}
        if candidate not in usernames:
            return candidate
        idx = 1
        while f'{candidate}.{idx}' in usernames:
            idx += 1
        return f'{candidate}.{idx}'

    def create_local_user(self, full_name: str, email: str, password_hash: str) -> Dict[str, Any]:
        username_seed = email.split('@', 1)[0] if '@' in email else full_name
        user_id = str(uuid4())
        row = {
            'id': user_id,
            'gitlab_user_id': self._next_external_user_id(),
            'username': self._unique_username(username_seed),
            'email': email.strip().lower(),
            'display_name': full_name.strip(),
            'avatar_url': None,
            'auth_provider': 'local',
            'password_hash': password_hash,
            'access_token': None,
            'refresh_token': None,
            'token_expires_at': None,
            'created_at': utcnow_iso(),
            'updated_at': utcnow_iso(),
        }
        self._data['users'][user_id] = row
        self._ensure_user_settings(user_id)
        return row

    def create_social_user(self, provider: str, email: str, display_name: str) -> Dict[str, Any]:
        username_seed = email.split('@', 1)[0] if '@' in email else display_name
        user_id = str(uuid4())
        row = {
            'id': user_id,
            'gitlab_user_id': self._next_external_user_id(),
            'username': self._unique_username(username_seed),
            'email': email.strip().lower(),
            'display_name': display_name.strip(),
            'avatar_url': None,
            'auth_provider': provider,
            'password_hash': None,
            'access_token': None,
            'refresh_token': None,
            'token_expires_at': None,
            'created_at': utcnow_iso(),
            'updated_at': utcnow_iso(),
        }
        self._data['users'][user_id] = row
        self._ensure_user_settings(user_id)
        return row

    def upsert_google_user(self, email: str, display_name: str) -> Dict[str, Any]:
        existing = self.get_user_by_email(email)
        if existing:
            existing['auth_provider'] = 'google'
            existing['display_name'] = display_name
            existing['updated_at'] = utcnow_iso()
            existing['password_hash'] = None
            self._ensure_user_settings(existing['id'])
            return existing
        username_seed = email.split('@', 1)[0] if '@' in email else display_name
        user_id = str(uuid4())
        row = {
            'id': user_id,
            'gitlab_user_id': self._next_external_user_id(),
            'username': self._unique_username(username_seed),
            'email': email.strip().lower(),
            'display_name': display_name.strip(),
            'avatar_url': None,
            'auth_provider': 'google',
            'password_hash': None,
            'access_token': None,
            'refresh_token': None,
            'token_expires_at': None,
            'created_at': utcnow_iso(),
            'updated_at': utcnow_iso(),
        }
        self._data['users'][user_id] = row
        self._ensure_user_settings(user_id)
        return row

    def upsert_user(self, user: Dict[str, Any]) -> Dict[str, Any]:
        existing = next((u for u in self._data['users'].values() if u['gitlab_user_id'] == user['gitlab_user_id']), None)
        if existing:
            existing.update(user)
            existing.setdefault('auth_provider', 'gitlab')
            existing.setdefault('password_hash', None)
            existing['updated_at'] = utcnow_iso()
            return existing
        user_id = str(uuid4())
        merged = {
            'id': user_id,
            'created_at': utcnow_iso(),
            'updated_at': utcnow_iso(),
            'auth_provider': 'gitlab',
            'password_hash': None,
            **user,
        }
        self._data['users'][user_id] = merged
        self._ensure_user_settings(user_id)
        return merged

    def list_repos(self, user_id: str) -> List[Dict[str, Any]]:
        return [r for r in self._data['repos'].values() if r['user_id'] == user_id and r['is_active']]

    def get_repo(self, user_id: str, repo_id: str) -> Optional[Dict[str, Any]]:
        repo = self._data['repos'].get(repo_id)
        if not repo or repo['user_id'] != user_id:
            return None
        return repo

    def get_repo_by_project_id(self, project_id: int) -> Optional[Dict[str, Any]]:
        return next((r for r in self._data['repos'].values() if r['gitlab_project_id'] == project_id and r['is_active']), None)

    def create_repo(self, user_id: str, payload: Dict[str, Any]) -> Dict[str, Any]:
        repo_id = str(uuid4())
        repo = {
            'id': repo_id,
            'user_id': user_id,
            'gitlab_project_id': payload['gitlab_project_id'],
            'project_path': payload['project_path'],
            'project_name': payload.get('project_name') or payload['project_path'].split('/')[-1],
            'project_url': payload.get('project_url'),
            'webhook_id': payload.get('webhook_id'),
            'webhook_secret': payload.get('webhook_secret', ''),
            'is_active': True,
            'created_at': utcnow_iso(),
            'health': payload.get('health', 90),
            'branch': payload.get('branch', 'main'),
            'active_incidents': 0,
            'agents': 0,
            'type': payload.get('type', 'Service'),
        }
        self._data['repos'][repo_id] = repo
        return repo

    def deactivate_repo(self, user_id: str, repo_id: str) -> bool:
        repo = self.get_repo(user_id, repo_id)
        if not repo:
            return False
        repo['is_active'] = False
        return True

    def list_incidents(self, user_id: str) -> List[Dict[str, Any]]:
        incidents = [i for i in self._data['incidents'].values() if i['user_id'] == user_id]
        incidents.sort(key=lambda i: i.get('created_at') or '', reverse=True)
        return incidents

    def list_incidents_for_repo(self, user_id: str, repo_id: str) -> List[Dict[str, Any]]:
        return [i for i in self.list_incidents(user_id) if i['repo_id'] == repo_id]

    def get_incident(self, user_id: str, incident_id: str) -> Optional[Dict[str, Any]]:
        incident = self._data['incidents'].get(incident_id)
        if not incident or incident['user_id'] != user_id:
            return None
        return incident

    def create_incident(self, payload: Dict[str, Any]) -> Dict[str, Any]:
        incident_id = payload.get('id') or str(uuid4())
        incident = {
            'id': incident_id,
            'gitlab_issue_iid': None,
            'gitlab_issue_url': None,
            'status': 'ANALYZING',
            'severity': 'warning',
            'pipeline_analysis': {},
            'breaking_commit': {},
            'code_context': {},
            'ownership': {},
            'recovery_plan': {},
            'approved_by': None,
            'approved_at': None,
            'dismissed_by': None,
            'dismissed_at': None,
            'dismissed_reason': None,
            'agents_completed_at': None,
            'resolved_at': None,
            'diagnosis_seconds': None,
            'resolution_seconds': None,
            'error_type': None,
            'error_summary': None,
            'created_at': utcnow_iso(),
            'triggered_at': utcnow_iso(),
            'title': 'New pipeline incident',
            'type': 'CI/CD',
            **payload,
        }
        self._data['incidents'][incident_id] = incident
        return incident

    def update_incident(self, incident: Dict[str, Any], **changes: Any) -> Dict[str, Any]:
        incident.update(changes)
        return incident

    def get_agent_runs(self, incident_id: str) -> List[Dict[str, Any]]:
        runs = [r for r in self._data['agent_runs'].values() if r['incident_id'] == incident_id]
        runs.sort(key=lambda r: r['agent_index'])
        return runs

    def create_agent_run(self, payload: Dict[str, Any]) -> Dict[str, Any]:
        row = {
            'id': str(uuid4()),
            'status': 'running',
            'started_at': utcnow_iso(),
            'completed_at': None,
            'duration_ms': None,
            'claude_tokens': None,
            'error_message': None,
            'output_snapshot': None,
            **payload,
        }
        self._data['agent_runs'][row['id']] = row
        return row

    def get_settings(self, user_id: str) -> Dict[str, Any]:
        self._ensure_user_settings(user_id)
        return self._data['settings'][user_id]

    def update_settings(self, user_id: str, payload: Dict[str, Any]) -> Dict[str, Any]:
        self._ensure_user_settings(user_id)
        settings = self._data['settings'][user_id]
        settings.update(payload)
        return settings

    def get_team(self) -> List[Dict[str, Any]]:
        return list(self._data['team'])

    def add_team_invite(self, invite: Dict[str, Any]) -> Dict[str, Any]:
        row = {
            'id': str(uuid4()),
            'created_at': utcnow_iso(),
            **invite,
        }
        self._data['team_invites'].append(row)
        return row


store = DataStore()
