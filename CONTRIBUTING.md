# Contributing

Thanks for contributing to Incident Autopilot.

## Prerequisites

- Node.js 20+ (`.nvmrc` is included)
- Python 3.12
- Git

## Local Setup

1. Clone the repo.
2. Install frontend dependencies:
   - `npm install`
3. Create and activate a Python virtual environment:
   - PowerShell: `python -m venv .venv; . .venv/Scripts/Activate.ps1`
4. Install backend dependencies:
   - `pip install -r requirements.txt`
5. Copy environment template:
   - `cp .env.example .env` (or create `.env` manually on Windows)

## Run Locally

- Frontend dev server: `npm run dev`
- Backend API server: `uvicorn api.main:app --reload --port 8000`

## Validation Before PR

Run all checks locally before opening a pull request:

- `npm run lint`
- `npm run build`
- `pytest tests/unit tests/integration -q`
- `python -m compileall api agents shared`

## Branching

- `main`: production-ready branch
- `preview`: branch used for preview environment testing
- Feature branches: `feat/<short-name>` or `fix/<short-name>`

## Pull Request Checklist

- Include clear summary and test evidence in PR description.
- Keep scope focused; avoid unrelated refactors.
- Update docs when behavior or setup changes.
- Ensure no secrets are committed.

