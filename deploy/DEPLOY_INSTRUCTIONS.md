# Deployment Instructions

## Full Deployment Script

To deploy all changes to the server, use the full deployment script:

```bash
sudo bash /var/www/acoustic.uz/deploy/full-deploy-acoustic.sh
```

Or if you're already in the project directory:

```bash
cd /var/www/acoustic.uz
sudo bash deploy/full-deploy-acoustic.sh
```

## What the script does:

1. ✅ Pulls latest code from Git
2. ✅ Runs database migrations
3. ✅ Generates Prisma Client
4. ✅ Installs dependencies
5. ✅ Builds shared package
6. ✅ Builds backend
7. ✅ Restarts backend PM2 process
8. ✅ Builds frontend
9. ✅ Restarts frontend PM2 process
10. ✅ Builds admin panel
11. ✅ Deploys admin panel to Nginx
12. ✅ Reloads Nginx

## Individual Deployment Scripts

If you need to deploy only specific parts:

### Backend only:
```bash
sudo bash /var/www/acoustic.uz/deploy/rebuild-backend-acoustic.sh
```

### Frontend only:
```bash
sudo bash /var/www/acoustic.uz/deploy/rebuild-frontend-acoustic.sh
```

### Admin Panel only:
```bash
sudo bash /var/www/acoustic.uz/deploy/rebuild-admin-panel.sh
```

## Manual Steps (if needed)

### 1. Pull code:
```bash
cd /var/www/acoustic.uz
sudo -u acoustic git pull origin main
```

### 2. Run migrations:
```bash
cd /var/www/acoustic.uz
sudo -u acoustic npx prisma migrate deploy
sudo -u acoustic npx prisma generate
```

### 3. Install dependencies:
```bash
cd /var/www/acoustic.uz
sudo -u acoustic pnpm install
```

### 4. Build shared package:
```bash
cd /var/www/acoustic.uz
sudo -u acoustic pnpm --filter @acoustic/shared build
```

### 5. Build backend:
```bash
cd /var/www/acoustic.uz/apps/backend
sudo -u acoustic pnpm exec tsc
pm2 restart acoustic-backend
```

### 6. Build frontend:
```bash
cd /var/www/acoustic.uz/apps/frontend
sudo -u acoustic rm -rf .next
sudo -u acoustic pnpm build
pm2 restart acoustic-frontend
```

### 7. Build admin panel:
```bash
cd /var/www/acoustic.uz/apps/admin
sudo -u acoustic rm -rf dist
export VITE_API_URL="https://a.acoustic.uz/api"
export VITE_FRONTEND_URL="https://acoustic.uz"
sudo -u acoustic pnpm build
sudo cp -r dist /var/www/acoustic.uz/apps/admin/
sudo chown -R www-data:www-data /var/www/acoustic.uz/apps/admin/dist
sudo systemctl reload nginx
```

## Troubleshooting

### If Git pull fails:
```bash
sudo chown -R acoustic:acoustic /var/www/acoustic.uz
sudo -u acoustic git config --global --add safe.directory /var/www/acoustic.uz
```

### If migrations fail:
```bash
cd /var/www/acoustic.uz
sudo -u acoustic npx prisma migrate status
sudo -u acoustic npx prisma migrate deploy
```

### If build fails:
Check logs:
```bash
# Backend
pm2 logs acoustic-backend --lines 100

# Frontend
pm2 logs acoustic-frontend --lines 100

# Nginx
sudo tail -50 /var/log/nginx/error.log
```

### If PM2 processes are not running:
```bash
pm2 status
pm2 restart all
# Or start individually:
pm2 start acoustic-backend
pm2 start acoustic-frontend
```

## Environment Variables

Make sure these are set in `/var/www/acoustic.uz/.env`:

```bash
DATABASE_URL="postgresql://..."
NEXT_PUBLIC_API_URL="https://a.acoustic.uz/api"
NEXT_PUBLIC_SITE_URL="https://acoustic.uz"
VITE_API_URL="https://a.acoustic.uz/api"
VITE_FRONTEND_URL="https://acoustic.uz"
```

