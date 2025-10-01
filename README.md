# Budget CAR — Dev Environment (FastAPI + React + PostgreSQL)

A dockerized development environment for the **Budget CAR** app (FastAPI backend, Vite/React frontend, PostgreSQL).

## Prerequisites

- Git
- Docker Desktop (macOS/Windows)
- Make (optional; otherwise use raw docker compose commands)

## Quick start

```bash
# Clone repository
git clone https://github.com/Couragous77/625-CAR-Group-Project-.git
cd budget-car

# Copy environment
cp .env.example .env   # Windows PowerShell: copy .env.example .env

# Start services
make up

# Run migrations
make migrate

# Seed demo data
make seed
```

Open:
- Web: http://localhost:5173
- API Docs: http://localhost:8000/docs

## Project layout

- backend/ — FastAPI app, Alembic migrations, models, seed
- frontend/ — React app
- docker-compose.yml — defines db, backend, web services
- Makefile — helpful commands
- .env.example — environment config template

## Makefile commands

- `make up` — build & run
- `make down` — stop
- `make migrate` — run alembic migrations
- `make seed` — seed demo data
- `make be-shell` — shell into backend
- `make we-shell` — shell into web
- `make db-psql` — open psql in db

## Troubleshooting

- **Web container exits immediately**: ensure `docker-compose.yml` has `- /usr/src/app/node_modules` volume for web.
- **npm ci error**: Dockerfile now falls back to `npm install` if lockfile missing.
- **Alembic import error**: fixed by adding `PYTHONPATH=/app` and sys.path in `alembic/env.py`.
- **bcrypt issues**: pinned `bcrypt==3.2.2` in backend requirements.
