ENV ?= .env

up: ## build & run all
	docker compose --env-file $(ENV) up --build

down: ## stop
	docker compose down

logs: ## tail logs
	docker compose logs -f

be-shell: ## shell into backend
	docker compose exec backend bash

db-psql: ## psql into db
	docker compose exec db psql -U $$POSTGRES_USER -d $$POSTGRES_DB

migrate: ## apply latest migrations
	docker compose exec backend alembic upgrade head

makemigration: ## autogenerate a revision; pass N='message'
	docker compose exec backend alembic revision --autogenerate -m "$(N)"

seed: ## load demo data
	docker compose exec backend python -m app.seed

we-shell: ## shell into web
	docker compose exec web sh

we-install: ## install frontend dependencies (including react-router-dom)
	docker compose exec web npm install
	docker compose exec web npm install react-router-dom

we-install-full: ## install all recommended frontend packages
	docker compose exec web npm install
	docker compose exec web npm install react-router-dom @tanstack/react-query axios zustand

we-dev: ## run frontend dev server (if not already running)
	docker compose exec web npm run dev

fmt: ## placeholder for formatters
	@echo "Add black/ruff/eslint here"

help:
	@grep -E '^[a-zA-Z_-]+:.*?##' Makefile | awk 'BEGIN {FS = ":.*?## "}; {printf "\033[36m%-15s\033[0m %s\n", $$1, $$2}"
