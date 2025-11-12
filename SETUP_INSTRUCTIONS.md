# Setup Instructions

## Initial Setup

1. **Install dependencies:**
   ```bash
   pnpm install
   ```

2. **Set up environment variables:**
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

3. **Set up database:**
   ```bash
   # Generate Prisma client
   cd apps/backend
   pnpm db:generate

   # Run migrations
   pnpm db:migrate

   # Seed database
   pnpm db:seed
   ```

4. **Start development servers:**
   ```bash
   # From root directory
   pnpm dev
   ```

   This will start:
   - Frontend: http://localhost:3000
   - Admin: http://localhost:3002
   - Backend: http://localhost:3001
   - API Docs: http://localhost:3001/api/docs

## Default Credentials

- **Email**: admin@acoustic.uz
- **Password**: Admin#12345

**Note**: First login will require password change.

## Development Workflow

### Backend Development

```bash
cd apps/backend
pnpm dev
```

### Frontend Development

```bash
cd apps/frontend
pnpm dev
```

### Admin Development

```bash
cd apps/admin
pnpm dev
```

## Database Management

### Generate Prisma Client
```bash
cd apps/backend
pnpm db:generate
```

### Create Migration
```bash
cd apps/backend
pnpm db:migrate
```

### Reset Database
```bash
cd apps/backend
pnpm db:migrate reset
pnpm db:seed
```

### Open Prisma Studio
```bash
cd apps/backend
pnpm db:studio
```

## Troubleshooting

### Prisma Issues

If you encounter Prisma client issues:

1. Delete `node_modules/.prisma` folder
2. Run `pnpm db:generate` again
3. Restart your development server

### Port Conflicts

If ports are already in use:

- Frontend: Change port in `apps/frontend/package.json`
- Admin: Change port in `apps/admin/vite.config.ts`
- Backend: Change `PORT` in `.env`

### Module Resolution Issues

If you see module resolution errors:

1. Clear node_modules: `rm -rf node_modules apps/*/node_modules packages/*/node_modules`
2. Reinstall: `pnpm install`
3. Rebuild: `pnpm build`

## Building for Production

```bash
# Build all apps
pnpm build

# Build specific app
pnpm --filter @acoustic/frontend build
pnpm --filter @acoustic/admin build
pnpm --filter @acoustic/backend build
```

## Docker Development

```bash
# Start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop all services
docker-compose down

# Rebuild and restart
docker-compose up -d --build
```

