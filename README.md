# Incident Autopilot

[![CI](https://github.com/Flamki/incident-autopilot/actions/workflows/ci.yml/badge.svg)](https://github.com/Flamki/incident-autopilot/actions/workflows/ci.yml)
[![Release](https://img.shields.io/github/v/release/Flamki/incident-autopilot)](https://github.com/Flamki/incident-autopilot/releases)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
[![Frontend](https://img.shields.io/badge/frontend-live-success)](https://incident-autopilot-three.vercel.app)
[![Backend API](https://img.shields.io/badge/backend-live-success)](https://incident-autopilot-backend-vercel.vercel.app/health)

Incident Autopilot is a full-stack incident response platform prototype based on the GitLab AI Hackathon backend blueprint.

- Frontend: React 19 + Vite + TypeScript + Tailwind CSS
- Backend: FastAPI + JWT auth + WebSocket updates + GitLab webhook receiver
- Agent Chain: 6 Python agents scaffolded for GitLab Duo Agent Platform

## Live Deployments

- Frontend (production): `https://incident-autopilot-three.vercel.app`
- Backend API (production): `https://incident-autopilot-backend-vercel.vercel.app`
- Backend health: `https://incident-autopilot-backend-vercel.vercel.app/health`

## Architecture

- `src/`: frontend SPA
- `api/`: FastAPI backend with blueprint endpoint coverage
- `agents/`: six agent implementations (`log_analyzer` through `action_executor`)
- `shared/`: reusable agent and API utilities
- `.gitlab/agents`: GitLab Agent definitions
- `.gitlab/flows`: GitLab Flow orchestration YAML
- `schemas/incident_context.json`: context contract
- `api/db/migrations`: SQL schema/index migrations

## API Coverage

Implemented from blueprint:

- Auth: `/auth/gitlab`, `/auth/gitlab/callback`, `/auth/refresh`, `/auth/logout`
- Incidents: list/detail/approve/dismiss/reopen/agent runs/retry
- Repositories: list/create/delete/test/repo incidents
- Settings: general/agents/notifications
- Analytics: summary + agent metrics
- Me/Team: profile/team/invite
- Webhooks: `/webhooks/gitlab`
- WebSocket: `/ws?token=...`

## Local Setup

### Frontend

```bash
npm install
npm run dev
```

Frontend runs at `http://localhost:3000`.

### Backend

```bash
python -m venv .venv
. .venv/Scripts/Activate.ps1
pip install -r requirements.txt
uvicorn api.main:app --reload --port 8000
```

Backend runs at `http://localhost:8000`.

### Local Auth

Use the frontend login page (`/login`).
In development, auth uses `GET /auth/gitlab/callback?code=dev` to issue a local JWT.

## Environment Variables

Copy `.env.example` and set values.

Frontend:

- `VITE_API_BASE_URL`
- `VITE_WS_BASE_URL`

Backend:

- `JWT_SECRET`
- `GITLAB_CLIENT_ID`
- `GITLAB_CLIENT_SECRET`
- `GITLAB_REDIRECT_URI`
- `ALLOWED_ORIGINS`

## Verification Commands

Run this set before every push:

```bash
npm run lint
npm run build
pytest tests/unit tests/integration -q
python -m compileall api agents shared
```

## Deploy

### Frontend (Vercel)

This repository includes `vercel.json` for SPA rewrites.

1. Import GitHub repo into Vercel
2. Set `VITE_API_BASE_URL` and `VITE_WS_BASE_URL`
3. Deploy

### Backend

Backend is deployable on Vercel, Railway, or Render.

Docker run example:

```bash
docker build -t incident-autopilot-api .
docker run -p 8000:8000 --env-file .env incident-autopilot-api
```

## Branching and Releases

- `main`: production branch
- `preview`: preview environment branch
- CI runs on both branches and on PRs
- Push a semantic tag (`v1.0.0`, `v1.1.0`, etc.) to trigger automated GitHub Release publishing

## GitLab Agent Platform Setup

1. Register `.gitlab/agents/*.yml`
2. Register `.gitlab/flows/incident_autopilot.yml`
3. Connect monitored repository webhooks to `/webhooks/gitlab`
4. Trigger failing pipeline to test end-to-end flow

## Scripts

- `npm run dev`: frontend dev server
- `npm run build`: frontend production build
- `npm run lint`: frontend typecheck

## Project Docs

- [Contributing](CONTRIBUTING.md)
- [Security](SECURITY.md)
- [Changelog](CHANGELOG.md)

## License

MIT
