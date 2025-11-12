# 🚀 Start Here - Quick Setup

## ✅ Great News!

You already have:
- ✅ PostgreSQL 14 running locally
- ✅ Database `acoustic` already exists
- ✅ `.env` file is ready
- ✅ All dependencies installed

**You DON'T need Docker!** Your local PostgreSQL is ready to use.

## 📝 Next Steps (5 minutes)

### Step 1: Verify Database Connection

Your database is already set up! The `acoustic` database exists and is accessible.

### Step 2: Update .env File (if needed)

Check your `.env` file and make sure `DATABASE_URL` is set correctly:

```env
# Option 1: If you have an 'acoustic' user
DATABASE_URL=postgresql://acoustic@localhost:5432/acoustic

# Option 2: Using your Mac username (tiuulugbek)
DATABASE_URL=postgresql://tiuulugbek@localhost:5432/acoustic

# Option 3: Using default PostgreSQL user
DATABASE_URL=postgresql://localhost:5432/acoustic
```

**Check which one works:**
```bash
# Try option 1 (acoustic user)
psql -d acoustic -U acoustic -c "SELECT 1;" && echo "✅ Use: postgresql://acoustic@localhost:5432/acoustic"

# Try option 2 (your username)
psql -d acoustic -c "SELECT 1;" && echo "✅ Use: postgresql://tiuulugbek@localhost:5432/acoustic"
```

### Step 3: Generate Prisma Client

```bash
pnpm --filter @acoustic/backend db:generate
```

### Step 4: Run Migrations

```bash
pnpm --filter @acoustic/backend db:migrate
```

### Step 5: Seed Database (creates admin user)

```bash
pnpm --filter @acoustic/backend db:seed
```

### Step 6: Start Development Servers

```bash
pnpm dev
```

This will start:
- **Frontend**: http://localhost:3000
- **Admin Panel**: http://localhost:3002
- **Backend API**: http://localhost:3001
- **API Docs**: http://localhost:3001/api/docs

## 🎉 You're Ready!

After running `pnpm dev`, visit:
- Frontend: http://localhost:3000
- Admin Panel: http://localhost:3002
- Login with:
  - Email: `admin@acoustic.uz`
  - Password: `Admin#12345`

## 🐛 Troubleshooting

### "Cannot connect to database"

1. Check PostgreSQL is running:
   ```bash
   pg_isready
   ```

2. Check database exists:
   ```bash
   psql -l | grep acoustic
   ```

3. Try connecting:
   ```bash
   psql -d acoustic -c "SELECT 1;"
   ```

### "Prisma client not found"

```bash
pnpm --filter @acoustic/backend db:generate
```

### "Migration failed"

Make sure your `DATABASE_URL` in `.env` is correct and the database is accessible.

## 📚 More Help

- See [QUICK_START.md](./QUICK_START.md) for detailed setup guide
- See [DOCKER_SETUP.md](./DOCKER_SETUP.md) if you want to use Docker instead
- See [ENV_SETUP.md](./ENV_SETUP.md) for environment variable details

