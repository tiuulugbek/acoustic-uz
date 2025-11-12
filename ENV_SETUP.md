# Environment Setup Guide

## Quick Start

1. **Copy the example environment file:**
   ```bash
   cp .env.example .env
   ```

2. **Update DATABASE_URL:**
   
   The `.env` file has been created with default values. You need to update the `DATABASE_URL` based on your PostgreSQL setup:

   **Option A: Using Docker (Recommended for development)**
   ```bash
   # Start PostgreSQL with Docker
   docker-compose up -d postgres
   
   # Use this DATABASE_URL in .env:
   DATABASE_URL=postgresql://acoustic:acoustic123@localhost:5432/acoustic
   ```

   **Option B: Using Local PostgreSQL**
   ```bash
   # Update .env with your PostgreSQL credentials:
   DATABASE_URL=postgresql://USERNAME:PASSWORD@localhost:5432/acoustic
   
   # Create the database:
   createdb acoustic
   ```

   **Option C: Using Docker Compose (Full Stack)**
   ```bash
   # Start all services including PostgreSQL
   docker-compose up -d
   
   # Use this DATABASE_URL in .env:
   DATABASE_URL=postgresql://acoustic:acoustic123@localhost:5432/acoustic
   ```

3. **Generate Prisma Client:**
   ```bash
   cd apps/backend
   pnpm db:generate
   ```

4. **Run Migrations:**
   ```bash
   cd apps/backend
   pnpm db:migrate
   ```

5. **Seed the Database:**
   ```bash
   cd apps/backend
   pnpm db:seed
   ```

## Environment Variables

### Required Variables

- `DATABASE_URL` - PostgreSQL connection string
- `JWT_ACCESS_SECRET` - Secret for JWT access tokens (generate a random string)
- `JWT_REFRESH_SECRET` - Secret for JWT refresh tokens (generate a different random string)

### Optional Variables

- `TELEGRAM_BOT_TOKEN` - Telegram bot token for form notifications
- `TELEGRAM_CHAT_ID` - Telegram chat ID for notifications
- `STORAGE_DRIVER` - `local` or `s3` for file storage
- `S3_*` - S3 configuration if using S3 storage

### Generating Secrets

You can generate secure random secrets using:

```bash
# Generate JWT secrets
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Run this twice to get two different secrets for `JWT_ACCESS_SECRET` and `JWT_REFRESH_SECRET`.

## Local Development Setup

For local development, the `.env` file is configured with:

- `NODE_ENV=development`
- `DATABASE_URL` - Update with your PostgreSQL connection
- `NEXT_PUBLIC_SITE_URL=http://localhost:3000`
- `NEXT_PUBLIC_API_URL=http://localhost:3001/api`
- `VITE_API_URL=http://localhost:3001/api`
- `CORS_ORIGIN=http://localhost:3000,http://localhost:3002`

## Production Setup

For production, update:

- `NODE_ENV=production`
- `DATABASE_URL` - Your production PostgreSQL connection
- `NEXT_PUBLIC_SITE_URL=https://acoustic.uz`
- `NEXT_PUBLIC_API_URL=https://api.acoustic.uz`
- `VITE_API_URL=https://api.acoustic.uz`
- `CORS_ORIGIN=https://acoustic.uz,https://admin.acoustic.uz`
- Generate strong, random secrets for JWT tokens
- Configure S3 or other storage if needed
- Set up Telegram bot if using form notifications

## Troubleshooting

### DATABASE_URL not found error

Make sure:
1. `.env` file exists in the project root
2. `DATABASE_URL` is set in `.env`
3. The database connection string is correct

### Connection refused

Make sure PostgreSQL is running:
```bash
# Check if PostgreSQL is running
pg_isready

# Or check Docker containers
docker ps | grep postgres
```

### Invalid connection string

The format should be:
```
postgresql://USERNAME:PASSWORD@HOST:PORT/DATABASE_NAME
```

Example:
```
postgresql://postgres:postgres@localhost:5432/acoustic
```

