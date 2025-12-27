# Docker Setup Guide

This guide explains how to run the Book Order Processing System using Docker and Docker Compose.

## Prerequisites

- Docker Desktop (or Docker Engine + Docker Compose)
- Git (to clone the repository)

## Quick Start

1. **Clone the repository** (if you haven't already):
   ```bash
   git clone <your-repo-url>
   cd db_cursor
   ```

2. **Create environment file** (optional):
   ```bash
   cp .env.example .env
   # Edit .env with your desired configuration
   ```

3. **Build and start all services**:
   ```bash
   docker-compose up --build
   ```

   This will:
   - Build the MySQL database container
   - Build the Flask backend container
   - Build the Next.js frontend container
   - Start all services in the correct order
   - Initialize the database with schema and sample data

4. **Access the application**:
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:5000
   - Database: localhost:3306

## Available Commands

### Start services in detached mode:
```bash
docker-compose up -d
```

### View logs:
```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f backend
docker-compose logs -f frontend
docker-compose logs -f db
```

### Stop services:
```bash
docker-compose down
```

### Stop and remove volumes (⚠️ deletes database data):
```bash
docker-compose down -v
```

### Rebuild specific service:
```bash
docker-compose build backend
docker-compose up -d backend
```

### Execute commands in containers:
```bash
# Backend shell
docker-compose exec backend bash

# Frontend shell
docker-compose exec frontend sh

# Database MySQL client
docker-compose exec db mysql -u root -p
```

## Development Mode

For development with hot-reload:

```bash
docker-compose -f docker-compose.yml -f docker-compose.dev.yml up
```

This mounts your local code directories, enabling live code changes without rebuilding.

## Environment Variables

Create a `.env` file in the root directory with the following variables:

```env
# Database
DB_ROOT_PASSWORD=rootpassword
DB_USER=bookuser
DB_PASSWORD=bookpassword
DB_NAME=Book_Order_Processing_System
DB_PORT=3306

# Backend
BACKEND_PORT=5000
SECRET_KEY=your-secret-key-here
JWT_SECRET_KEY=your-jwt-secret-here

# Frontend
FRONTEND_PORT=3000
NEXT_PUBLIC_API_BASE_URL=http://localhost:5000
AUTH_SECRET=your-auth-secret-here
NEXTAUTH_SECRET=your-nextauth-secret-here
```

**⚠️ Important**: Change all secret keys before deploying to production!

## Database Management

### Initialize database (first time):
The database is automatically initialized with schema and sample data on first start.

### Reset database:
```bash
docker-compose down -v
docker-compose up -d db
# Wait for DB to be ready, then restart other services
docker-compose up -d
```

### Backup database:
```bash
docker-compose exec db mysqldump -u root -p Book_Order_Processing_System > backup.sql
```

### Restore database:
```bash
docker-compose exec -T db mysql -u root -p Book_Order_Processing_System < backup.sql
```

## Troubleshooting

### Port already in use:
If ports 3000, 5000, or 3306 are already in use, change them in `.env`:
```env
FRONTEND_PORT=3001
BACKEND_PORT=5001
DB_PORT=3307
```

### Database connection errors:
1. Ensure the database container is healthy: `docker-compose ps`
2. Check database logs: `docker-compose logs db`
3. Verify environment variables match in backend service

### Frontend can't connect to backend:
- Ensure `NEXT_PUBLIC_API_BASE_URL` points to the correct backend URL
- In Docker, use service name: `http://backend:5000`
- For browser access, use: `http://localhost:5000`

### Build fails:
- Clear Docker cache: `docker system prune -a`
- Rebuild without cache: `docker-compose build --no-cache`

## Production Deployment

For production:

1. **Update environment variables** with strong secrets
2. **Use production database** (consider managed MySQL service)
3. **Enable SSL/TLS** (use reverse proxy like Nginx)
4. **Set proper resource limits** in docker-compose.yml
5. **Use Docker secrets** for sensitive data
6. **Enable health checks** (already configured)
7. **Set restart policies** (already configured)

Example production overrides:
```bash
docker-compose -f docker-compose.yml -f docker-compose.prod.yml up -d
```

## Architecture

```
┌─────────────┐
│  Frontend   │ (Next.js on port 3000)
│  (Next.js)  │
└──────┬──────┘
       │ HTTP
       │
┌──────▼──────┐
│   Backend   │ (Flask on port 5000)
│   (Flask)   │
└──────┬──────┘
       │ MySQL
       │
┌──────▼──────┐
│  Database   │ (MySQL on port 3306)
│   (MySQL)   │
└─────────────┘
```

All services communicate through a Docker bridge network (`book_order_network`).

## Support

For issues or questions, please check:
- Docker logs: `docker-compose logs`
- Container status: `docker-compose ps`
- Service health: Check healthcheck endpoints

