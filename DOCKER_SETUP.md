# Docker Setup Guide

## Starting Docker on Mac

The error "Cannot connect to the Docker daemon" means Docker Desktop is not running on your Mac.

### Solution 1: Start Docker Desktop

1. **Open Docker Desktop** application on your Mac
   - Look for Docker Desktop in Applications
   - Or search for "Docker" in Spotlight (Cmd + Space)

2. **Wait for Docker to start**
   - Docker Desktop takes a few seconds to start
   - Look for the Docker whale icon in your menu bar
   - Make sure it shows "Docker Desktop is running"

3. **Verify Docker is running**
   ```bash
   docker ps
   ```
   If this command works (even if it shows no containers), Docker is running.

4. **Now try again**
   ```bash
   docker-compose up -d postgres
   ```

### Solution 2: Install Docker Desktop (if not installed)

If you don't have Docker Desktop installed:

1. **Download Docker Desktop for Mac**
   - Visit: https://www.docker.com/products/docker-desktop/
   - Download and install Docker Desktop

2. **Start Docker Desktop** after installation

3. **Verify installation**
   ```bash
   docker --version
   docker-compose --version
   ```

## Alternative: Use Local PostgreSQL (No Docker)

If you don't want to use Docker, you can use a local PostgreSQL installation:

### Option A: Install PostgreSQL with Homebrew

```bash
# Install PostgreSQL
brew install postgresql@15

# Start PostgreSQL service
brew services start postgresql@15

# Create the database
createdb acoustic

# Create user (if needed)
createuser -s acoustic
```

### Option B: Install PostgreSQL.app

1. Download PostgreSQL.app from: https://postgresapp.com/
2. Install and start the application
3. Create a database named `acoustic`

### Update .env file

After installing PostgreSQL locally, update your `.env` file:

```env
# If using default PostgreSQL user
DATABASE_URL=postgresql://localhost:5432/acoustic

# Or if you created a specific user
DATABASE_URL=postgresql://acoustic:password@localhost:5432/acoustic
```

### Then continue with setup

```bash
# Copy .env.example if you haven't already
cp .env.example .env

# Generate Prisma client
pnpm --filter @acoustic/backend db:generate

# Run migrations
pnpm --filter @acoustic/backend db:migrate

# Seed database
pnpm --filter @acoustic/backend db:seed

# Start development servers
pnpm dev
```

## Troubleshooting Docker Issues

### Docker Desktop won't start

1. **Check system requirements**
   - macOS 10.15 or newer
   - At least 4GB RAM
   - VirtualBox must not be running (if installed)

2. **Reset Docker Desktop**
   - Open Docker Desktop
   - Go to Troubleshoot → Reset to factory defaults

3. **Check for conflicts**
   - Make sure no other virtualization software is running
   - Close VirtualBox, VMWare, or Parallels if running

### Docker commands not working

```bash
# Check if Docker is running
docker ps

# Check Docker version
docker --version

# Restart Docker Desktop
# (Quit and restart the application)
```

## Quick Start with Docker

Once Docker is running:

```bash
# 1. Start PostgreSQL
docker-compose up -d postgres

# 2. Wait for PostgreSQL to be ready (about 10-15 seconds)
sleep 15

# 3. Run migrations
pnpm --filter @acoustic/backend db:generate
pnpm --filter @acoustic/backend db:migrate

# 4. Seed database
pnpm --filter @acoustic/backend db:seed

# 5. Start all services
pnpm dev
```

## Verifying PostgreSQL is Running

### With Docker:
```bash
# Check if container is running
docker ps | grep postgres

# Check PostgreSQL logs
docker-compose logs postgres

# Test connection
docker-compose exec postgres psql -U acoustic -d acoustic -c "SELECT 1;"
```

### With Local PostgreSQL:
```bash
# Check if PostgreSQL is running
pg_isready

# Connect to database
psql -d acoustic -c "SELECT 1;"
```

## Next Steps

After PostgreSQL is running (either with Docker or locally):

1. ✅ Database is running
2. ✅ Generate Prisma client: `pnpm --filter @acoustic/backend db:generate`
3. ✅ Run migrations: `pnpm --filter @acoustic/backend db:migrate`
4. ✅ Seed database: `pnpm --filter @acoustic/backend db:seed`
5. ✅ Start development: `pnpm dev`

