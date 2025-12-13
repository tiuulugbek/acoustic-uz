# Analytics Deployment Manual Testing Guide

## 1. Database Verification

### Check if migration was applied:

```bash
# Connect to PostgreSQL
psql $DATABASE_URL

# Check if columns exist
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name='Setting' 
AND column_name IN ('googleAnalyticsId', 'yandexMetrikaId');

# Expected output:
# column_name        | data_type
# -------------------+----------
# googleAnalyticsId  | text
# yandexMetrikaId    | text
```

## 2. Backend API Verification

### Test settings endpoint:

```bash
# Get settings (should include analytics IDs)
curl -X GET https://a.acoustic.uz/api/settings | jq '.googleAnalyticsId, .yandexMetrikaId'

# Update analytics settings
curl -X PATCH https://a.acoustic.uz/api/settings \
  -H "Content-Type: application/json" \
  -H "Cookie: your_session_cookie" \
  -d '{
    "googleAnalyticsId": "G-TEST123",
    "yandexMetrikaId": "12345678"
  }'
```

## 3. Admin Panel Verification

### Steps:

1. **Login to admin panel**
   - URL: `https://admin.acoustic.uz`
   - Login with your credentials

2. **Navigate to Settings**
   - Click "Sozlamalar" in the sidebar
   - You should see tabs: "Umumiy sozlamalar", "Rasmlar", "Telegram sozlamalari", **"Analytics va statistikalar"**, "Sidebar boshqaruvi"

3. **Test Analytics Tab**
   - Click "Analytics va statistikalar" tab
   - You should see:
     - "Analytics yoqilgan" switch
     - "Google Analytics ID" input field
     - "Yandex Metrika ID" input field
     - "Saqlash" button

4. **Enable Analytics**
   - Toggle "Analytics yoqilgan" switch to ON
   - Enter Google Analytics ID (e.g., `G-XXXXXXXXXX`)
   - Enter Yandex Metrika ID (e.g., `12345678`)
   - Click "Saqlash"
   - Should see success message: "Analytics sozlamalari muvaffaqiyatli saqlandi!"

## 4. Frontend Verification

### Browser Console Testing:

1. **Open browser console** (F12)

2. **Check analytics initialization:**
   - Visit `https://acoustic.uz`
   - Look for logs:
     ```
     [Analytics] Google Analytics 4 initialized: G-XXXXXXXXXX
     [Analytics] Yandex Metrika initialized: 12345678
     [Analytics] Page view tracked: /
     ```

3. **Test product view tracking:**
   - Visit a product page: `https://acoustic.uz/products/[slug]`
   - Look for log:
     ```
     [Analytics] Event tracked: view_item { category: 'ecommerce', ... }
     ```

4. **Test branch view tracking:**
   - Visit a branch page: `https://acoustic.uz/branches/[slug]`
   - Look for log:
     ```
     [Analytics] Event tracked: view_branch { category: 'location', ... }
     ```

5. **Test phone click tracking:**
   - Visit a branch page
   - Click on a phone number
   - Look for log:
     ```
     [Analytics] Event tracked: phone_click { category: 'contact', ... }
     ```

## 5. Analytics Platforms Verification

### Google Analytics 4:

1. **Go to Google Analytics**
   - URL: `https://analytics.google.com`
   - Select your property

2. **Check Real-time reports:**
   - Go to Reports > Real-time
   - Visit your website
   - You should see yourself as an active user

3. **Check Events:**
   - Go to Reports > Engagement > Events
   - You should see events like:
     - `page_view`
     - `view_item` (product views)
     - `view_branch` (branch views)
     - `phone_click` (phone clicks)

### Yandex Metrika:

1. **Go to Yandex Metrika**
   - URL: `https://metrika.yandex.ru`
   - Select your counter

2. **Check Real-time visitors:**
   - Go to Real-time > Visitors
   - Visit your website
   - You should see yourself as an active visitor

3. **Check Goals:**
   - Go to Reports > Goals
   - You should see goals like:
     - `view_item`
     - `view_branch`
     - `phone_click`

## 6. Common Issues and Solutions

### Issue: Analytics not initializing

**Symptoms:**
- No `[Analytics]` logs in console
- Analytics platforms show no data

**Solutions:**
1. Check if analytics is enabled in admin panel
2. Check if analytics IDs are set correctly
3. Check browser console for errors
4. Verify HTTPS (analytics requires HTTPS except localhost)
5. Check if ad blockers are disabled

### Issue: Events not tracking

**Symptoms:**
- Page views work but custom events don't

**Solutions:**
1. Check browser console for errors
2. Verify event names are correct
3. Check if analytics is enabled
4. Wait a few minutes (events may take time to appear)

### Issue: Admin panel Analytics tab not visible

**Symptoms:**
- Settings page doesn't show Analytics tab

**Solutions:**
1. Clear browser cache
2. Hard refresh (Ctrl+Shift+R or Cmd+Shift+R)
3. Check if frontend was rebuilt correctly
4. Check browser console for errors

## 7. Quick Verification Checklist

- [ ] Database migration applied successfully
- [ ] Backend API includes analytics ID fields
- [ ] Admin panel shows Analytics tab
- [ ] Analytics can be enabled/disabled
- [ ] Analytics IDs can be saved
- [ ] Frontend shows `[Analytics]` logs in console
- [ ] Page views are tracked
- [ ] Product views are tracked
- [ ] Branch views are tracked
- [ ] Phone clicks are tracked
- [ ] Google Analytics shows real-time data
- [ ] Yandex Metrika shows real-time data

