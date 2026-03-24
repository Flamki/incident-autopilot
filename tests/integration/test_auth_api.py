from uuid import uuid4
from urllib.parse import parse_qs, urlparse

from fastapi.testclient import TestClient

from api.main import app

client = TestClient(app)


def _redirect_query(response) -> dict[str, list[str]]:
    location = response.headers.get('location')
    assert location
    return parse_qs(urlparse(location).query)


def test_signup_then_login_flow():
    email = f'user.{uuid4().hex[:8]}@example.com'
    password = 'supersecure123'
    full_name = 'Test User'

    signup = client.post(
        '/auth/signup',
        json={'full_name': full_name, 'email': email, 'password': password},
    )
    assert signup.status_code == 201
    signup_body = signup.json()
    assert signup_body['user']['email'] == email

    login = client.post('/auth/login', json={'email': email, 'password': password})
    assert login.status_code == 200
    body = login.json()
    assert body['token']
    assert body['user']['email'] == email

    protected = client.get('/me', headers={'Authorization': f'Bearer {body["token"]}'})
    assert protected.status_code == 200
    assert protected.json()['email'] == email


def test_google_dev_login_works():
    resp = client.post('/auth/google/dev')
    assert resp.status_code == 200
    body = resp.json()
    assert body['token']
    assert body['user']['email'] == 'google.user@incident-autopilot.app'


def test_social_google_signup_then_login_required():
    login_before_signup = client.post('/auth/social/login', json={'provider': 'google', 'email': 'social.google@example.com'})
    assert login_before_signup.status_code == 401

    signup = client.post(
        '/auth/social/signup',
        json={'provider': 'google', 'email': 'social.google@example.com', 'full_name': 'Social Google'},
    )
    assert signup.status_code == 201

    login_after_signup = client.post('/auth/social/login', json={'provider': 'google', 'email': 'social.google@example.com'})
    assert login_after_signup.status_code == 200
    assert login_after_signup.json()['token']


def test_social_github_signup_then_login_required():
    login_before_signup = client.post('/auth/social/login', json={'provider': 'github', 'email': 'social.github@example.com'})
    assert login_before_signup.status_code == 401

    signup = client.post(
        '/auth/social/signup',
        json={'provider': 'github', 'email': 'social.github@example.com', 'full_name': 'Social Github'},
    )
    assert signup.status_code == 201

    login_after_signup = client.post('/auth/social/login', json={'provider': 'github', 'email': 'social.github@example.com'})
    assert login_after_signup.status_code == 200
    assert login_after_signup.json()['token']


def test_google_oauth_fallback_requires_signup_before_login():
    email = f'google.oauth.{uuid4().hex[:8]}@example.com'
    frontend = 'https://incident-autopilot-three.vercel.app'

    login_before_signup = client.get(
        '/auth/google',
        params={'mode': 'login', 'frontend': frontend, 'email': email},
        follow_redirects=False,
    )
    assert login_before_signup.status_code == 307
    query = _redirect_query(login_before_signup)
    assert query['oauth'][0] == 'error'
    assert query['provider'][0] == 'google'

    signup = client.get(
        '/auth/google',
        params={'mode': 'signup', 'frontend': frontend, 'email': email, 'full_name': 'Google OAuth'},
        follow_redirects=False,
    )
    assert signup.status_code == 307
    signup_query = _redirect_query(signup)
    assert signup_query['oauth'][0] == 'registered'
    assert signup_query['email'][0] == email
    assert signup_query['ticket'][0]

    login_after_signup = client.get(
        '/auth/google',
        params={
            'mode': 'login',
            'frontend': frontend,
            'email': email,
            'next': '/incidents',
            'ticket': signup_query['ticket'][0],
        },
        follow_redirects=False,
    )
    assert login_after_signup.status_code == 307
    query = _redirect_query(login_after_signup)
    assert query['oauth'][0] == 'success'
    assert query['provider'][0] == 'google'
    assert query['token'][0]
    assert query['next'][0] == '/incidents'


def test_github_oauth_fallback_requires_signup_before_login():
    email = f'github.oauth.{uuid4().hex[:8]}@example.com'
    frontend = 'https://incident-autopilot-three.vercel.app'

    login_before_signup = client.get(
        '/auth/github',
        params={'mode': 'login', 'frontend': frontend, 'email': email},
        follow_redirects=False,
    )
    assert login_before_signup.status_code == 307
    query = _redirect_query(login_before_signup)
    assert query['oauth'][0] == 'error'
    assert query['provider'][0] == 'github'

    signup = client.get(
        '/auth/github',
        params={'mode': 'signup', 'frontend': frontend, 'email': email, 'full_name': 'GitHub OAuth'},
        follow_redirects=False,
    )
    assert signup.status_code == 307
    signup_query = _redirect_query(signup)
    assert signup_query['oauth'][0] == 'registered'
    assert signup_query['email'][0] == email
    assert signup_query['ticket'][0]

    login_after_signup = client.get(
        '/auth/github',
        params={
            'mode': 'login',
            'frontend': frontend,
            'email': email,
            'next': '/repos',
            'ticket': signup_query['ticket'][0],
        },
        follow_redirects=False,
    )
    assert login_after_signup.status_code == 307
    query = _redirect_query(login_after_signup)
    assert query['oauth'][0] == 'success'
    assert query['provider'][0] == 'github'
    assert query['token'][0]
    assert query['next'][0] == '/repos'
