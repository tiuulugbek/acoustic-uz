# GitHub Setup Guide

## Setting Up Your Repository on GitHub

This guide will help you:
1. Initialize git repository
2. Push your code to GitHub
3. Clone it on another computer

## Step 1: Initialize Git Repository

```bash
# Initialize git repository
git init

# Add all files (respecting .gitignore)
git add .

# Create initial commit
git commit -m "Initial commit: Acoustic.uz full stack application"
```

## Step 2: Add GitHub Remote

```bash
# Add your GitHub repository as remote
git remote add origin https://github.com/tiuulugbek/acoustic-uz.git

# Verify remote is added
git remote -v
```

## Step 3: Push to GitHub

```bash
# Create main branch (if not already on main)
git branch -M main

# Push to GitHub
git push -u origin main
```

**If you get authentication errors:**
- You may need to use a Personal Access Token instead of password
- Or set up SSH keys for GitHub

## Step 4: Clone on Another Computer

Once pushed to GitHub, you can clone it on any computer:

```bash
# Clone the repository
git clone https://github.com/tiuulugbek/acoustic-uz.git

# Navigate to the project
cd acoustic-uz

# Install dependencies
pnpm install

# Set up environment variables
cp .env.example .env
# Edit .env with your configuration

# Set up database (see RUN_ME_NOW.md)
pnpm --filter @acoustic/backend db:generate
pnpm --filter @acoustic/backend db:migrate
pnpm --filter @acoustic/backend db:seed

# Start development servers
pnpm dev
```

## What Gets Pushed to GitHub

✅ **Included:**
- All source code
- Prisma schema and migrations
- Package configurations
- Documentation files
- `.env.example` template
- `.gitignore` file

❌ **NOT Included (and shouldn't be):**
- `.env` files (sensitive data)
- `node_modules/` (dependencies)
- `uploads/` folder (user-uploaded files)
- Build artifacts (`.next/`, `dist/`, etc.)
- Log files

## GitHub Authentication

### Option 1: Personal Access Token (Recommended)

1. Go to GitHub → Settings → Developer settings → Personal access tokens → Tokens (classic)
2. Generate new token with `repo` scope
3. Use token as password when pushing

### Option 2: SSH Keys

1. Generate SSH key:
   ```bash
   ssh-keygen -t ed25519 -C "your_email@example.com"
   ```

2. Add SSH key to GitHub:
   - Copy public key: `cat ~/.ssh/id_ed25519.pub`
   - Go to GitHub → Settings → SSH and GPG keys → New SSH key
   - Paste public key

3. Use SSH URL instead:
   ```bash
   git remote set-url origin git@github.com:tiuulugbek/acoustic-uz.git
   ```

## Troubleshooting

### "Repository not found"

- Make sure the repository exists on GitHub
- Check repository name: `tiuulugbek/acoustic-uz`
- Verify you have access to the repository

### "Authentication failed"

- Use Personal Access Token instead of password
- Or set up SSH keys
- Make sure your GitHub account has access

### "Permission denied"

- Check repository permissions
- Make sure you're pushing to the correct repository
- Verify your GitHub account has write access

## Next Steps After Cloning

1. ✅ Clone repository
2. ✅ Install dependencies: `pnpm install`
3. ✅ Copy `.env.example` to `.env`
4. ✅ Set up database (PostgreSQL)
5. ✅ Run migrations: `pnpm --filter @acoustic/backend db:migrate`
6. ✅ Seed database: `pnpm --filter @acoustic/backend db:seed`
7. ✅ Start development: `pnpm dev`

## Keeping Repository Updated

### Push Changes

```bash
# Add changes
git add .

# Commit changes
git commit -m "Your commit message"

# Push to GitHub
git push
```

### Pull Changes (on another computer)

```bash
# Pull latest changes
git pull

# Install new dependencies (if package.json changed)
pnpm install

# Run migrations (if schema changed)
pnpm --filter @acoustic/backend db:migrate
```

## Important Notes

1. **Never commit `.env` files** - They contain sensitive data
2. **Never commit `node_modules/`** - They're too large and can be reinstalled
3. **Never commit `uploads/` folder** - Contains user-uploaded files
4. **Always commit migrations** - Database schema changes should be in git
5. **Use meaningful commit messages** - Help others understand changes

## Need Help?

- See [RUN_ME_NOW.md](./RUN_ME_NOW.md) for setup after cloning
- See [START_HERE.md](./START_HERE.md) for quick setup guide
- See [SETUP_ON_NEW_COMPUTER.md](./SETUP_ON_NEW_COMPUTER.md) for detailed setup

