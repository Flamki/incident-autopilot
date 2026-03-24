# Incident Autopilot

Incident Autopilot is a full-stack incident response platform prototype based on the GitLab AI Hackathon backend blueprint.

- Frontend: React 19 + Vite + TypeScript + Tailwind CSS
- Backend: FastAPI + JWT auth + WebSocket updates + GitLab webhook receiver
- Agent Chain: 6 Python agents scaffolded for GitLab Duo Agent Platform

## Repository Layout

- `src/` frontend SPA
- `api/` FastAPI backend with all 28 blueprint endpoints
- `agents/` six agent implementations (`log_analyzer` ... `action_executor`)
- `.gitlab/agents` GitLab Agent definitions
- `.gitlab/flows` GitLab Flow orchestration YAML
- `schemas/incident_context.json` context schema
- `api/db/migrations` PostgreSQL schema/index SQL

## Quick Start (Local)

### 1. Frontend

```bash
npm install
npm run dev
```

Frontend runs at `http://localhost:3000`.

### 2. Backend

```bash
python -m venv .venv
. .venv/Scripts/Activate.ps1
pip install -r requirements.txt
uvicorn api.main:app --reload --port 8000
```

Backend runs at `http://localhost:8000`.

### 3. Local Auth Flow

Use the login page in the frontend (`/login`).
In development mode, auth uses `GET /auth/gitlab/callback?code=dev` to issue a local JWT.

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

## Environment Variables

Copy `.env.example` and fill values as needed.

Important frontend vars:

- `VITE_API_BASE_URL`
- `VITE_WS_BASE_URL`

Important backend vars:

- `JWT_SECRET`
- `GITLAB_CLIENT_ID`, `GITLAB_CLIENT_SECRET`, `GITLAB_REDIRECT_URI`
- `ALLOWED_ORIGINS`

## Deploy

### Frontend (Vercel)

This repo already includes `vercel.json` for SPA rewrites.

1. Import GitHub repo into Vercel
2. Set `VITE_API_BASE_URL` and `VITE_WS_BASE_URL`
3. Deploy

### Backend (Railway/Render)

Use `Dockerfile` (or direct Python deploy):

```bash
docker build -t incident-autopilot-api .
docker run -p 8000:8000 --env-file .env incident-autopilot-api
```

## Live URLs

- Frontend (production): `https://incident-autopilot-three.vercel.app`
- Backend API (production): `https://incident-autopilot-backend-vercel.vercel.app`

Notes:

- Frontend production env `VITE_API_BASE_URL` points to the backend URL above.
- `VITE_WS_BASE_URL` is set to `disabled` in production for stable behavior on Vercel serverless.

## GitLab Agent Platform Setup

1. Register the six `.gitlab/agents/*.yml` definitions
2. Register `.gitlab/flows/incident_autopilot.yml`
3. Connect monitored repository webhooks to `/webhooks/gitlab`
4. Trigger a failing pipeline to test full flow

## Scripts

- `npm run dev` frontend dev server
- `npm run build` frontend production build
- `npm run lint` frontend typecheck

## License

MIT
