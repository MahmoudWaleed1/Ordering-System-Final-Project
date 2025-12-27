.PHONY: help build up down restart logs clean

help: ## Show this help message
	@echo 'Usage: make [target]'
	@echo ''
	@echo 'Available targets:'
	@awk 'BEGIN {FS = ":.*?## "} /^[a-zA-Z_-]+:.*?## / {printf "  %-15s %s\n", $$1, $$2}' $(MAKEFILE_LIST)

build: ## Build all Docker images
	docker-compose build

up: ## Start all services
	docker-compose up -d

up-build: ## Build and start all services
	docker-compose up --build -d

down: ## Stop all services
	docker-compose down

restart: ## Restart all services
	docker-compose restart

logs: ## Show logs from all services
	docker-compose logs -f

logs-backend: ## Show backend logs
	docker-compose logs -f backend

logs-frontend: ## Show frontend logs
	docker-compose logs -f frontend

logs-db: ## Show database logs
	docker-compose logs -f db

ps: ## Show running containers
	docker-compose ps

shell-backend: ## Open shell in backend container
	docker-compose exec backend bash

shell-frontend: ## Open shell in frontend container
	docker-compose exec frontend sh

db-shell: ## Open MySQL shell
	docker-compose exec db mysql -u root -p

clean: ## Stop and remove containers, networks, and volumes
	docker-compose down -v

clean-all: clean ## Remove all containers, networks, volumes, and images
	docker-compose down -v --rmi all

dev: ## Start in development mode with hot reload
	docker-compose -f docker-compose.yml -f docker-compose.dev.yml up

rebuild: ## Rebuild all images without cache
	docker-compose build --no-cache

