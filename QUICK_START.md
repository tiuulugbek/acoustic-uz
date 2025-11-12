# Quick Start Guide

## Current Status

✅ `.env.example` file exists  
✅ `.env` file created from template  
❌ Docker Desktop is not running (or not installed)

## Option 1: Start Docker Desktop (Recommended)

### Step 1: Start Docker Desktop

1. **Open Docker Desktop application** on your Mac
   - Look in Applications folder
   - Or press `Cmd + Space` and search for "Docker"

2. **Wait for Docker to start** (takes 10-30 seconds)
   - Look for the Docker whale icon in the menu bar
   - When it shows "Docker Desktop is running", you're ready

3. **Verify Docker is running:**
   ```bash
   docker ps
   ```
   This should work without errors.

### Step 2: Start PostgreSQL with Docker

```bash
# Start PostgreSQL container
docker-compose up -d postgres

# Wait 10-15 seconds for PostgreSQL to start
sleep 15

# Verify it's running
docker ps | grep postgres
```

### Step 3: Set Up Database

```bash
# Generate Prisma client
pnpm --filter @acoustic/backend db:generate

# Run migrations
pnpm --filter @acoustic/backend db:migrate

# Seed database (creates admin user)
pnpm --filter @acoustic/backend db:seed
```

### Step 4: Start Development Servers

```bash
# Start all services (frontend, admin, backend)
pnpm dev
```

This will start:
- **Frontend**: http://localhost:3000
- **Admin Panel**: http://localhost:3002
- **Backend API**: http://localhost:3001
- **API Docs**: http://localhost:3001/api/docs

## Option 2: Use Local PostgreSQL (No Docker)

### Step 1: Install PostgreSQL

**Using Homebrew:**
```bash
# Install PostgreSQL
brew install postgresql@15

# Start PostgreSQL service
brew services start postgresql@15

# Create database
createdb acoustic
```

**Or download PostgreSQL.app:**
- Visit: https://postgresapp.com/
- Download and install
- Start the application
- Create a database named `acoustic`

### Step 2: Update .env File

Edit `.env` and update the `DATABASE_URL`:

```env
# If using default PostgreSQL user
DATABASE_URL=postgresql://localhost:5432/acoustic

# Or if you created a specific user
DATABASE_URL=postgresql://YOUR_USERNAME:YOUR_PASSWORD@localhost:5432/acoustic
```

### Step 3: Set Up Database

```bash
# Generate Prisma client
pnpm --filter @acoustic/backend db:generate

# Run migrations
pnpm --filter @acoustic/backend db:migrate

# Seed database (creates admin user)
pnpm --filter @acoustic/backend db:seed
```

### Step 4: Start Development Servers

```bash
pnpm dev
```

## Default Admin Credentials

After seeding the database:
- **Email**: `admin@acoustic.uz`
- **Password**: `Admin#12345`
- **Note**: You'll be required to change the password on first login

## Troubleshooting

### Docker Issues

**"Cannot connect to the Docker daemon"**
- Make sure Docker Desktop is running
- Check the menu bar for Docker whale icon
- Restart Docker Desktop if needed

**"Docker not found"**
- Install Docker Desktop: https://www.docker.com/products/docker-desktop/

### PostgreSQL Issues

**"Connection refused"**
- Make sure PostgreSQL is running
- For Docker: `docker ps | grep postgres`
- For local: `pg_isready`

**"Database does not exist"**
- Create the database: `createdb acoustic`
- Or use Docker which creates it automatically

### Environment Variables

**".env file not found"**
- The file has been created for you
- Make sure you're in the project root directory: `/Users/tiuulugbek/acoustic-uz`

**"Invalid DATABASE_URL"**
- Check your `.env` file
- Make sure the format is: `postgresql://USER:PASSWORD@HOST:PORT/DATABASE`
- For Docker: `postgresql://acoustic:acoustic123@localhost:5432/acoustic`

## Next Steps

1. ✅ Choose Option 1 (Docker) or Option 2 (Local PostgreSQL)
2. ✅ Set up the database
3. ✅ Run migrations and seed
4. ✅ Start development servers
5. ✅ Visit http://localhost:3000 to see the frontend
6. ✅ Visit http://localhost:3002 to access the admin panel

## Need More Help?

- See [DOCKER_SETUP.md](./DOCKER_SETUP.md) for detailed Docker setup
- See [SETUP_ON_NEW_COMPUTER.md](./SETUP_ON_NEW_COMPUTER.md) for complete setup guide
- See [ENV_SETUP.md](./ENV_SETUP.md) for environment variable details

