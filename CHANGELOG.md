# Changelog

All notable changes to this project will be documented in this file.

The format is based on Keep a Changelog, and this project follows Semantic Versioning.

## [1.0.0] - 2026-03-24

### Added
- Full FastAPI backend scaffold aligned to the Incident Autopilot backend blueprint.
- JWT-based auth flow with GitLab OAuth callback support and local dev auth mode.
- Complete route coverage for auth, incidents, repos, settings, analytics, me/team, webhooks, and websocket updates.
- Six chained agent scaffolds (`log_analyzer` through `action_executor`) plus shared utilities.
- GitLab hackathon orchestration assets (`.gitlab/agents`, `.gitlab/flows`, schema).
- Frontend-to-backend integration across dashboard, incidents, repositories, analytics, team, auth, and settings pages.
- API client utilities and live event hook wiring.
- Docker and docker-compose support for local backend execution.
- Vercel deployment configuration and environment variable templates.
- GitHub Actions CI workflow for frontend and backend checks.
- GitHub Actions release workflow for semantic tags (`v*`).

### Changed
- README expanded with deployment, validation, architecture, and contributor guidance.

