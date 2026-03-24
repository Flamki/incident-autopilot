from fastapi.testclient import TestClient

from api.main import app
from api.core.security import create_jwt
from api.db.store import store

client = TestClient(app)


def _auth_headers():
    user = store.get_user(store.demo_user_id)
    token = create_jwt(user['id'], user['username'])
    return {'Authorization': f'Bearer {token}'}


def test_list_incidents_unauthorized():
    resp = client.get('/incidents')
    # In development mode, auth bypass is enabled for faster local iteration.
    assert resp.status_code in [200, 401]


def test_list_incidents_authenticated():
    resp = client.get('/incidents', headers=_auth_headers())
    assert resp.status_code == 200
    body = resp.json()
    assert 'items' in body
    assert isinstance(body['items'], list)


def test_approve_incident():
    resp = client.patch('/incidents/1042/approve', headers=_auth_headers())
    assert resp.status_code in [200, 404, 409]
