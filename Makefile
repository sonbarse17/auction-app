.PHONY: build up down logs restart clean migrate test

# Build all services
build:
	docker-compose build

# Start all services
up:
	docker-compose up -d

# Start with logs
up-logs:
	docker-compose up

# Stop all services
down:
	docker-compose down

# Stop and remove volumes
down-volumes:
	docker-compose down -v

# View logs
logs:
	docker-compose logs -f

# View backend logs
logs-backend:
	docker-compose logs -f backend

# View frontend logs
logs-frontend:
	docker-compose logs -f frontend

# Restart backend
restart-backend:
	docker-compose restart backend

# Restart frontend
restart-frontend:
	docker-compose restart frontend

# Clean everything
clean:
	docker-compose down -v
	docker system prune -f

# Run migrations
migrate:
	docker exec -i auction_postgres psql -U postgres -d auctiondb < backend/migrations/init.sql

# Access PostgreSQL shell
psql:
	docker exec -it auction_postgres psql -U postgres -d auctiondb

# Access backend shell
shell-backend:
	docker exec -it auction_backend bash

# Test backend health
test-health:
	curl http://localhost:8000/health

# Test Redis
test-redis:
	docker exec -it auction_redis redis-cli ping

# Test PostgreSQL
test-postgres:
	docker exec -it auction_postgres pg_isready -U postgres

# Full rebuild
rebuild:
	docker-compose down -v
	docker-compose build --no-cache
	docker-compose up -d
