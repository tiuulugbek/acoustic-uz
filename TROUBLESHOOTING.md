# Troubleshooting: Admin Panel ↔ Frontend Connection

## How to Verify the System is Working

### 1. Quick Status Check
Run the diagnostic script:
```bash
./scripts/test-connection.sh
```

This will show:
- ✅ Backend API status
- ✅ Number of services in database
- ✅ Which services are running
- ✅ API endpoints status

### 2. Test API Directly
Open `test-api.html` in your browser:
- Tests the API connection
- Shows all services in real-time
- Auto-refreshes every 5 seconds
- Shows if data is being updated

### 3. Check Browser Console

#### Frontend (localhost:3000)
1. Open browser DevTools (F12)
2. Go to Console tab
3. Look for these logs:
   - `[HomePage] 🔄 Fetching homepage services from API...`
   - `[HomePage] ✅ Received services: X [array]`
   - `[HomePage] Service data: [array]`

If you see errors, check:
- Network tab → Filter by "homepage/services"
- Check if request returns 200 status
- Check response data

#### Admin Panel (localhost:3002)
1. Open browser DevTools (F12)
2. Go to Network tab
3. Make a change in Homepage → Bosh sahifa xizmatlari
4. Verify:
   - PATCH/POST request goes to `/homepage/services/:id`
   - Response is 200 OK
   - Success message appears

### 4. Manual API Test
```bash
# Get current services
curl http://localhost:3001/api/homepage/services | jq

# Should show 4 services with titles like:
# - "Eshitish qobiliyatini tekshirish"
# - "Quloq apparatlarini tanlash"
# - "Quloq apparatlari xizmat ko'rsatish"
# - "TEST" (or whatever you changed)
```

## How It Works

### Data Flow
```
Admin Panel → Backend API → Database
                      ↓
Frontend ← Backend API ← Database
```

1. **Admin Panel** makes changes via `/homepage/services/admin` (requires auth)
2. **Backend** saves to `HomepageService` table in database
3. **Frontend** fetches from `/homepage/services` (public, no auth)
4. **Frontend** auto-refreshes every 5 seconds to catch changes

### Query Keys
- **Admin Panel**: `['homepage-services-admin']` (invalidates after updates)
- **Frontend**: `['homepage-services', displayLocale]` (refetches every 5s)

Note: Since admin and frontend are separate apps, they don't share React Query cache. That's why frontend has aggressive refetching enabled.

## Common Issues

### Issue: Changes not appearing on frontend

**Check 1: Is backend saving?**
```bash
# After making a change in admin, check database
curl http://localhost:3001/api/homepage/services | jq '.[] | .title_uz'
```

**Check 2: Is frontend fetching?**
- Open browser console
- Look for `[HomePage] 🔄 Fetching...` logs
- Check Network tab for `/homepage/services` requests

**Check 3: Is cache stale?**
- Hard refresh frontend (Cmd+Shift+R / Ctrl+Shift+R)
- Wait 5 seconds (auto-refresh interval)
- Check if console shows new fetch

**Solution:**
- Frontend now auto-refreshes every 5 seconds
- If still not working, check browser console for errors
- Verify `NEXT_PUBLIC_API_URL` is set correctly

### Issue: 404 or CORS errors

**Check:**
- Backend is running on port 3001
- Frontend is running on port 3000
- No firewall blocking connections

**Solution:**
```bash
# Restart backend
cd apps/backend && pnpm dev

# Restart frontend
cd apps/frontend && pnpm dev
```

### Issue: Services showing as empty in admin panel

**Check:**
- Database migration ran successfully
- Run migration script if needed:
```bash
pnpm --filter @acoustic/backend db:migrate-services
```

## Configuration

### Frontend Auto-Refresh
Located in `apps/frontend/src/app/page.tsx`:
```typescript
refetchInterval: 5000, // Refetches every 5 seconds
staleTime: 0,          // Always considers data stale
refetchOnMount: true,  // Refetch when component mounts
refetchOnWindowFocus: true, // Refetch when window regains focus
```

You can adjust `refetchInterval` to change refresh frequency:
- `5000` = 5 seconds (current)
- `10000` = 10 seconds
- `0` = disabled (only refetch on mount/focus)

### API Endpoints
- **Public**: `GET /api/homepage/services` (returns published services)
- **Admin**: `GET /api/homepage/services/admin` (requires auth, returns all)
- **Create**: `POST /api/homepage/services` (requires auth)
- **Update**: `PATCH /api/homepage/services/:id` (requires auth)
- **Delete**: `DELETE /api/homepage/services/:id` (requires auth)

## Testing Workflow

1. **Open Admin Panel** (localhost:3002)
2. **Go to**: Homepage → Bosh sahifa xizmatlari
3. **Edit** a service (change title)
4. **Save** and wait for success message
5. **Open Frontend** (localhost:3000) in another tab
6. **Check console** for fetch logs
7. **Wait 5 seconds** (or refresh page)
8. **Verify** changes appear on homepage

## Debug Commands

```bash
# Check services in database
curl http://localhost:3001/api/homepage/services | jq

# Check specific service
curl http://localhost:3001/api/homepage/services | jq '.[0]'

# Count services
curl http://localhost:3001/api/homepage/services | jq 'length'

# Check backend logs
# (in backend terminal, you should see API requests)
```

