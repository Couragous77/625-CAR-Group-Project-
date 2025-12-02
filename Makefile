ENV ?= .env
PROD_ENV ?= .env.prod

# ============================================
# Development Commands
# ============================================

up: ## build & run all (development)
	docker compose --env-file $(ENV) up --build

down: ## stop all containers
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

test: ## run backend tests
	docker compose exec backend pytest -v

# ============================================
# Production Commands
# ============================================

prod-up: ## build & run production containers
	docker compose -f docker-compose.prod.yml --env-file $(PROD_ENV) up -d --build

prod-down: ## stop production containers
	docker compose -f docker-compose.prod.yml down

prod-logs: ## tail production logs
	docker compose -f docker-compose.prod.yml logs -f

prod-migrate: ## run migrations in production
	docker compose -f docker-compose.prod.yml exec backend alembic upgrade head

prod-health: ## check health of all production services
	@echo "=== Backend Health ==="
	@curl -s http://localhost:8000/health/ready | python3 -m json.tool || echo "Backend unhealthy"
	@echo "\n=== Frontend Health ==="
	@curl -s http://localhost:80/health || echo "Frontend unhealthy"
	@echo "\n=== Container Status ==="
	@docker compose -f docker-compose.prod.yml ps

prod-backup: ## backup production database
	@mkdir -p backups
	docker compose -f docker-compose.prod.yml exec db pg_dump -U $$POSTGRES_USER $$POSTGRES_DB > backups/backup_$$(date +%Y%m%d_%H%M%S).sql
	@echo "Backup saved to backups/"

prod-shell: ## shell into production backend
	docker compose -f docker-compose.prod.yml exec backend bash

prod-db: ## psql into production database
	docker compose -f docker-compose.prod.yml exec db psql -U $$POSTGRES_USER -d $$POSTGRES_DB

# ============================================
# Build & Deployment Scripts Commands
# ============================================

build-images: ## build production Docker images
	./scripts/build-images.sh

push-images: ## push images to registry (requires REGISTRY env var)
	./scripts/push-images.sh

smoke-test: ## run container smoke tests
	./scripts/smoke-test.sh

verify-env: ## verify environment variables (usage: make verify-env ENV=prod)
	./scripts/verify-env.sh $(if $(filter prod,$(ENV)),prod,$(if $(filter stage,$(ENV)),stage,dev))

verify-dev: ## verify development environment
	./scripts/verify-env.sh dev

verify-prod: ## verify production environment
	./scripts/verify-env.sh prod

# ============================================
# Help
# ============================================

help:
	@grep -E '^[a-zA-Z_-]+:.*?##' Makefile | awk 'BEGIN {FS = ":.*?## "}; {printf "\033[36m%-15s\033[0m %s\n", $$1, $$2}'
