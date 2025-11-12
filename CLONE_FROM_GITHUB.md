# 📥 Clone from GitHub - Complete Guide

## 🚀 Quick Clone (On Another Computer)

Once your code is pushed to GitHub, you can clone it on any computer:

### Step 1: Clone the Repository

```bash
# Clone using HTTPS (easiest)
git clone https://github.com/tiuulugbek/acoustic-uz.git

# Or clone using SSH (if you have SSH keys set up)
git clone git@github.com:tiuulugbek/acoustic-uz.git

# Navigate to the project
cd acoustic-uz
```

### Step 2: Install Dependencies

```bash
# Install all dependencies for the monorepo
pnpm install
```

This will install dependencies for:
- Frontend (Next.js)
- Admin (Vite + React)
- Backend (NestJS)
- Shared packages

### Step 3: Set Up Environment Variables

```bash
# Copy the example environment file
cp .env.example .env

# Edit .env with your configuration
# At minimum, update:
# - DATABASE_URL (your PostgreSQL connection)
# - JWT_ACCESS_SECRET (generate a random string)
# - JWT_REFRESH_SECRET (generate a different random string)
```

**Generate JWT Secrets:**
```bash
# Generate a secure random string (run twice for two different secrets)
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### Step 4: Set Up Database

You have two options:

#### Option A: Using Docker (Recommended)

```bash
# Start PostgreSQL with Docker
docker-compose up -d postgres

# Wait 10-15 seconds for PostgreSQL to start
sleep 15

# Your DATABASE_URL in .env should be:
# DATABASE_URL=postgresql://acoustic:acoustic123@localhost:5432/acoustic
```

#### Option B: Using Local PostgreSQL

```bash
# Install PostgreSQL (if not installed)
# macOS:
brew install postgresql@15
brew services start postgresql@15

# Create database
createdb acoustic

# Update DATABASE_URL in .env:
# DATABASE_URL=postgresql://localhost:5432/acoustic
```

### Step 5: Generate Prisma Client

```bash
# Generate Prisma client
pnpm --filter @acoustic/backend db:generate
```

### Step 6: Run Database Migrations

```bash
# Run migrations to set up database schema
pnpm --filter @acoustic/backend db:migrate
```

### Step 7: Seed Database

```bash
# Seed database with initial data (creates admin user)
pnpm --filter @acoustic/backend db:seed
```

**Default Admin Credentials:**
- Email: `admin@acoustic.uz`
- Password: `Admin#12345`
- **Note**: You'll be required to change the password on first login

### Step 8: Start Development Servers

```bash
# Start all services (frontend, admin, backend)
pnpm dev
```

This will start:
- **Frontend**: http://localhost:3000
- **Admin Panel**: http://localhost:3002
- **Backend API**: http://localhost:3001
- **API Docs**: http://localhost:3001/api/docs

## 📋 Complete Setup Commands

```bash
# 1. Clone repository
git clone https://github.com/tiuulugbek/acoustic-uz.git
cd acoustic-uz

# 2. Install dependencies
pnpm install

# 3. Set up environment
cp .env.example .env
# Edit .env with your configuration

# 4. Set up database (choose one):
# Option A: Docker
docker-compose up -d postgres
sleep 15

# Option B: Local PostgreSQL
# brew install postgresql@15
# brew services start postgresql@15
# createdb acoustic

# 5. Generate Prisma client
pnpm --filter @acoustic/backend db:generate

# 6. Run migrations
pnpm --filter @acoustic/backend db:migrate

# 7. Seed database
pnpm --filter @acoustic/backend db:seed

# 8. Start development servers
pnpm dev
```

## 🔄 Updating Your Local Copy

When you want to get the latest changes:

```bash
# Pull latest changes from GitHub
git pull

# Install new dependencies (if package.json changed)
pnpm install

# Run new migrations (if database schema changed)
pnpm --filter @acoustic/backend db:migrate

# Restart development servers
pnpm dev
```

## 🐛 Troubleshooting

### "Repository not found"

- Make sure the repository exists on GitHub
- Check URL: https://github.com/tiuulugbek/acoustic-uz
- Verify you have access to the repository

### "Cannot connect to database"

1. **Check PostgreSQL is running:**
   ```bash
   # With Docker
   docker ps | grep postgres
   
   # With local PostgreSQL
   pg_isready
   ```

2. **Check database exists:**
   ```bash
   psql -l | grep acoustic
   ```

3. **Verify DATABASE_URL in .env:**
   ```bash
   grep DATABASE_URL .env
   ```

### "Prisma client not found"

```bash
pnpm --filter @acoustic/backend db:generate
```

### "Migration failed"

```bash
# Check database connection
psql "postgresql://acoustic:acoustic123@localhost:5432/acoustic" -c "SELECT 1;"

# If connection works, try resetting migrations
pnpm --filter @acoustic/backend db:migrate reset
pnpm --filter @acoustic/backend db:migrate
pnpm --filter @acoustic/backend db:seed
```

### "Port already in use"

If ports 3000, 3001, or 3002 are already in use:

- **Frontend (3000)**: Change port in `apps/frontend/package.json`
- **Admin (3002)**: Change port in `apps/admin/vite.config.ts`
- **Backend (3001)**: Change `PORT` in `.env`

### "Module not found"

```bash
# Clean and reinstall
rm -rf node_modules apps/*/node_modules packages/*/node_modules
pnpm install
```

## 📚 What's Included When You Clone

✅ **Included:**
- All source code
- Prisma schema and migrations
- Package configurations
- Documentation files
- `.env.example` template
- Docker Compose configuration

❌ **NOT Included (correctly):**
- `.env` files (create from `.env.example`)
- `node_modules/` (install with `pnpm install`)
- `uploads/` folder (created automatically)
- Build artifacts (created when building)

## 🎯 After Cloning Checklist

- [ ] Clone repository
- [ ] Install dependencies: `pnpm install`
- [ ] Copy `.env.example` to `.env`
- [ ] Update `.env` with your configuration
- [ ] Set up database (Docker or local PostgreSQL)
- [ ] Generate Prisma client: `pnpm --filter @acoustic/backend db:generate`
- [ ] Run migrations: `pnpm --filter @acoustic/backend db:migrate`
- [ ] Seed database: `pnpm --filter @acoustic/backend db:seed`
- [ ] Start development: `pnpm dev`
- [ ] Visit http://localhost:3000 (frontend)
- [ ] Visit http://localhost:3002 (admin panel)
- [ ] Login with admin credentials

## 🆘 Need More Help?

- See [RUN_ME_NOW.md](./RUN_ME_NOW.md) for quick setup
- See [START_HERE.md](./START_HERE.md) for detailed setup guide
- See [DOCKER_SETUP.md](./DOCKER_SETUP.md) for Docker setup
- See [ENV_SETUP.md](./ENV_SETUP.md) for environment variables
- See [SETUP_ON_NEW_COMPUTER.md](./SETUP_ON_NEW_COMPUTER.md) for complete setup

## 🎉 Success!

Once everything is set up, you can:
- ✅ Develop locally
- ✅ Test changes
- ✅ Push updates to GitHub
- ✅ Deploy to production

Happy coding! 🚀

