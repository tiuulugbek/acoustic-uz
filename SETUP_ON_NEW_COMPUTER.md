# Setting Up on a New Computer

This guide will help you set up the Acoustic.uz project on a new computer after cloning from GitHub.

## Prerequisites

Before you begin, make sure you have installed:

- **Node.js** >= 18.0.0 ([Download](https://nodejs.org/))
- **pnpm** >= 8.0.0 ([Installation Guide](https://pnpm.io/installation))
- **PostgreSQL** >= 14 OR **Docker** (for database)
- **Git** (for cloning the repository)

## Step-by-Step Setup

### 1. Clone the Repository

```bash
git clone https://github.com/tiuulugbek/acoustic-uz.git
cd acoustic-uz
```

### 2. Install Dependencies

```bash
pnpm install
```

This will install all dependencies for the monorepo (frontend, admin, backend, and shared packages).

### 3. Set Up Environment Variables

```bash
# Copy the example environment file
cp .env.example .env
```

Then edit the `.env` file with your configuration. At minimum, you need to set:

- `DATABASE_URL` - Your PostgreSQL connection string
- `JWT_ACCESS_SECRET` - A secure random string (generate one)
- `JWT_REFRESH_SECRET` - A different secure random string (generate one)

**Generate JWT Secrets:**
```bash
# Generate a secure random string (run twice for two different secrets)
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### 4. Set Up Database

You have two options:

#### Option A: Using Docker (Recommended)

```bash
# Start PostgreSQL with Docker
docker-compose up -d postgres

# Your DATABASE_URL in .env should be:
# DATABASE_URL=postgresql://acoustic:acoustic123@localhost:5432/acoustic
```

#### Option B: Using Local PostgreSQL

1. Install PostgreSQL on your system
2. Create the database:
   ```bash
   createdb acoustic
   ```
3. Update `DATABASE_URL` in `.env` with your PostgreSQL credentials:
   ```
   DATABASE_URL=postgresql://YOUR_USERNAME:YOUR_PASSWORD@localhost:5432/acoustic
   ```

### 5. Generate Prisma Client

```bash
cd apps/backend
pnpm db:generate
```

Or from the root:
```bash
pnpm --filter @acoustic/backend db:generate
```

### 6. Run Database Migrations

```bash
cd apps/backend
pnpm db:migrate
```

Or from the root:
```bash
pnpm --filter @acoustic/backend db:migrate
```

### 7. Seed the Database

This will create the default admin user and initial data:

```bash
cd apps/backend
pnpm db:seed
```

Or from the root:
```bash
pnpm --filter @acoustic/backend db:seed
```

**Default Admin Credentials:**
- Email: `admin@acoustic.uz`
- Password: `Admin#12345`
- **Note:** You'll be required to change the password on first login

### 8. Start Development Servers

From the root directory:

```bash
pnpm dev
```

This will start:
- **Frontend**: http://localhost:3000
- **Admin Panel**: http://localhost:3002
- **Backend API**: http://localhost:3001
- **API Documentation**: http://localhost:3001/api/docs

## Quick Setup Script

If you prefer a one-command setup (after installing dependencies and setting up `.env`):

```bash
# From root directory
pnpm run dev:stack
```

This will:
1. Start PostgreSQL with Docker
2. Run migrations
3. Build the backend
4. Start the backend server

## Troubleshooting

### Port Already in Use

If you get port conflicts:

- **Frontend (3000)**: Change port in `apps/frontend/package.json`
- **Admin (3002)**: Change port in `apps/admin/vite.config.ts`
- **Backend (3001)**: Change `PORT` in `.env`

### Database Connection Issues

1. Make sure PostgreSQL is running:
   ```bash
   # Check Docker
   docker ps | grep postgres
   
   # Or check local PostgreSQL
   pg_isready
   ```

2. Verify your `DATABASE_URL` in `.env` is correct

3. Make sure the database exists:
   ```bash
   createdb acoustic  # If using local PostgreSQL
   ```

### Prisma Client Not Found

```bash
cd apps/backend
pnpm db:generate
```

### Module Resolution Errors

```bash
# Clean and reinstall
rm -rf node_modules apps/*/node_modules packages/*/node_modules
pnpm install
```

## What's Included in the Repository

✅ All source code  
✅ Prisma schema and migrations  
✅ Package configurations  
✅ Docker Compose configuration  
✅ Documentation files  

❌ **NOT included** (and shouldn't be):
- `node_modules/` (install with `pnpm install`)
- `.env` files (create from `.env.example`)
- `uploads/` folder (created automatically)
- Build artifacts (`dist/`, `.next/`, etc.)

## Next Steps

Once everything is running:

1. Visit http://localhost:3000 to see the frontend
2. Visit http://localhost:3002 to access the admin panel
3. Login with the default credentials
4. Start developing!

## Need Help?

- Check the main [README.md](./README.md)
- See [ENV_SETUP.md](./ENV_SETUP.md) for detailed environment variable documentation
- See [SETUP_INSTRUCTIONS.md](./SETUP_INSTRUCTIONS.md) for more setup details

