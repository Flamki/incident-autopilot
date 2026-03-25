from uuid import uuid4

from fastapi.testclient import TestClient

from api.db.store import store
from api.main import app
from api.routes import webhooks

client = TestClient(app)


def _new_user_and_repo():
    suffix = uuid4().hex[:8]
    user = store.create_local_user(
        full_name=f'Webhook User {suffix}',
        email=f'webhook.{suffix}@example.com',
        password_hash='hash',
    )
    project_id = 2_000_000 + int(uuid4().int % 900_000)
    repo = store.create_repo(
        user['id'],
        {
            'gitlab_project_id': project_id,
            'project_path': f'team/service-{suffix}',
            'project_name': f'service-{suffix}',
            'project_url': f'https://gitlab.com/team/service-{suffix}',
            'webhook_secret': f'secret-{suffix}',
            'branch': 'main',
        },
    )
    return user, repo


def test_pipeline_hook_creates_agents_running_incident_in_gitlab_duo(monkeypatch):
    monkeypatch.setattr(webhooks.settings, 'agent_runtime_mode', 'gitlab_duo')
    user, repo = _new_user_and_repo()
    pipeline_id = 42_001

    resp = client.post(
        '/webhooks/gitlab',
        headers={
            'X-Gitlab-Token': repo['webhook_secret'],
            'X-Gitlab-Event': 'Pipeline Hook',
        },
        json={
            'project': {'id': repo['gitlab_project_id']},
            'object_attributes': {
                'id': pipeline_id,
                'status': 'failed',
                'ref': 'main',
                'web_url': 'https://gitlab.com/team/service/-/pipelines/42001',
            },
        },
    )

    assert resp.status_code == 200
    assert resp.json()['status'] == 'received'

    incidents = store.list_incidents_for_repo(user['id'], repo['id'])
    created = next(i for i in incidents if i.get('gitlab_pipeline_id') == pipeline_id)
    assert created['status'] == 'AGENTS_RUNNING'
    assert 'waiting for gitlab duo agents' in (created.get('error_summary') or '').lower()


def test_agent_callback_updates_incident_by_project_and_pipeline():
    user, repo = _new_user_and_repo()
    incident = store.create_incident(
        {
            'user_id': user['id'],
            'repo_id': repo['id'],
            'gitlab_pipeline_id': 59_001,
            'pipeline_ref': 'main',
            'status': 'AGENTS_RUNNING',
            'title': 'Pipeline failure',
        }
    )

    resp = client.post(
        '/webhooks/agent-callback',
        json={
            'context': {
                'project_id': str(repo['gitlab_project_id']),
                'pipeline_id': '59001',
                'pipeline_ref': 'main',
                'pipeline': {
                    'failed_stage': 'test',
                    'error_type': 'test_failure',
                    'error_summary': 'Unit tests failed',
                },
                'breaking_commit': {'breaking_commit_sha': 'abc1234'},
                'code_context': {'bug_class': 'logic_error'},
                'ownership': {'primary_owner': 'alice'},
                'recovery_plan': {'recommendation': 'rollback'},
                'status': 'completed',
            }
        },
    )

    assert resp.status_code == 200
    assert resp.json()['incident_id'] == incident['id']

    updated = store.get_incident(user['id'], incident['id'])
    assert updated is not None
    assert updated['status'] == 'PENDING_APPROVAL'
    assert updated['pipeline_analysis'].get('error_type') == 'test_failure'
    assert updated['recovery_plan'].get('recommendation') == 'rollback'
    assert updated['breaking_commit'].get('breaking_commit_sha') == 'abc1234'


def test_agent_callback_with_invalid_project_id_returns_404():
    resp = client.post('/webhooks/agent-callback', json={'context': {'project_id': 'not-a-number'}})
    assert resp.status_code == 404


def test_agent_callback_secret_is_enforced(monkeypatch):
    monkeypatch.setattr(webhooks.settings, 'agent_callback_secret', 'super-secret')
    user, repo = _new_user_and_repo()
    incident = store.create_incident(
        {
            'user_id': user['id'],
            'repo_id': repo['id'],
            'gitlab_pipeline_id': 88_001,
            'pipeline_ref': 'main',
            'status': 'AGENTS_RUNNING',
            'title': 'Pipeline failure',
        }
    )

    denied = client.post('/webhooks/agent-callback', json={'context': {'incident_id': incident['id'], 'status': 'resolved'}})
    assert denied.status_code == 401

    allowed = client.post(
        '/webhooks/agent-callback',
        headers={'X-Agent-Callback-Secret': 'super-secret'},
        json={'context': {'incident_id': incident['id'], 'status': 'resolved'}},
    )
    assert allowed.status_code == 200
    updated = store.get_incident(user['id'], incident['id'])
    assert updated is not None
    assert updated['status'] == 'RESOLVED'
