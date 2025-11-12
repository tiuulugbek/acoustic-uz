# Deployment Guide

## Prerequisites

- Docker and Docker Compose
- PostgreSQL (if not using Docker)
- Node.js >= 18.0.0
- pnpm >= 8.0.0

## Quick Start with Docker

1. **Clone and setup environment:**
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

2. **Start services:**
   ```bash
   docker-compose up -d
   ```

3. **Run migrations and seed:**
   ```bash
   docker-compose exec backend pnpm db:generate
   docker-compose exec backend pnpm db:migrate
   docker-compose exec backend pnpm db:seed
   ```

4. **Access applications:**
   - Frontend: http://localhost:3000
   - Admin: http://localhost:3002
   - Backend API: http://localhost:3001
   - API Docs: http://localhost:3001/api/docs

## Manual Deployment

### Backend

```bash
cd apps/backend
pnpm install
pnpm db:generate
pnpm db:migrate
pnpm db:seed
pnpm build
pnpm start:prod
```

### Frontend

```bash
cd apps/frontend
pnpm install
pnpm build
pnpm start
```

### Admin

```bash
cd apps/admin
pnpm install
pnpm build
# Serve with nginx or any static file server
```

## Environment Variables

See `.env.example` for all required environment variables.

### Important Variables

- `DATABASE_URL`: PostgreSQL connection string
- `JWT_ACCESS_SECRET`: Secret for access tokens
- `JWT_REFRESH_SECRET`: Secret for refresh tokens
- `TELEGRAM_BOT_TOKEN`: Telegram bot token (optional)
- `TELEGRAM_CHAT_ID`: Telegram chat ID (optional)
- `STORAGE_DRIVER`: `local` or `s3`
- `S3_*`: S3 configuration (if using S3)

## Database Backup

```bash
./scripts/backup.sh
```

Backups are stored in `./backups/` and automatically cleaned up after 7 days.

## Production Checklist

- [ ] Update all environment variables
- [ ] Set secure JWT secrets
- [ ] Configure CORS origins
- [ ] Set up SSL/TLS certificates
- [ ] Configure Telegram bot (if using)
- [ ] Set up file storage (S3 recommended for production)
- [ ] Configure Redis (optional, for caching)
- [ ] Set up monitoring and logging
- [ ] Configure backups
- [ ] Test all functionality
- [ ] Update default admin password

## Nginx Configuration

For production, configure nginx as a reverse proxy:

- Frontend: `acoustic.uz`
- Admin: `admin.acoustic.uz`
- API: `api.acoustic.uz`

See `infra/nginx/` for example configurations.

## Troubleshooting

### Database Connection Issues

- Check `DATABASE_URL` format
- Ensure PostgreSQL is running
- Check firewall rules

### Build Issues

- Clear node_modules and reinstall: `pnpm install --force`
- Check Node.js version: `node --version`
- Check pnpm version: `pnpm --version`

### Docker Issues

- Check logs: `docker-compose logs [service]`
- Rebuild images: `docker-compose build --no-cache`
- Reset volumes: `docker-compose down -v`

