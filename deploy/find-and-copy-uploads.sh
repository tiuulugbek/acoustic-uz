#!/bin/bash
# Find and copy uploads from old server or admin panel

set -e

PROJECT_DIR="/var/www/acoustic.uz"
BACKEND_UPLOADS="$PROJECT_DIR/apps/backend/uploads"

echo "🔍 Searching for uploads files..."
echo ""

# 1. Check database for media URLs
echo "📋 Step 1: Checking database for media files..."
cd "$PROJECT_DIR"

# Use psql to query media table
MEDIA_COUNT=$(psql -U acousticwebdb -d acousticwebdb -t -c "SELECT COUNT(*) FROM \"Media\";" 2>/dev/null | xargs || echo "0")

if [ "$MEDIA_COUNT" -gt "0" ]; then
    echo "   ✅ Found $MEDIA_COUNT media records in database"
    
    # Get first few URLs
    echo ""
    echo "   📋 Sample URLs from database:"
    psql -U acousticwebdb -d acousticwebdb -t -c "SELECT url FROM \"Media\" LIMIT 5;" 2>/dev/null | while read url; do
        if [ -n "$url" ]; then
            echo "     - $url"
        fi
    done
else
    echo "   ⚠️  No media records found in database"
fi

# 2. Check old server locations
echo ""
echo "📋 Step 2: Checking old server locations..."

OLD_SERVER="152.53.229.176"
OLD_LOCATIONS=(
    "/var/www/news.acoustic.uz/apps/backend/uploads"
    "/var/www/news.acoustic.uz/uploads"
)

for location in "${OLD_LOCATIONS[@]}"; do
    echo "   Checking: $OLD_SERVER:$location"
    
    # Try to list files via SSH
    FILE_COUNT=$(ssh root@$OLD_SERVER "find $location -type f 2>/dev/null | wc -l" 2>/dev/null || echo "0")
    
    if [ "$FILE_COUNT" -gt "0" ]; then
        echo "     ✅ Found $FILE_COUNT files"
        echo ""
        echo "   💡 To copy files from old server, run:"
        echo "      rsync -av root@$OLD_SERVER:$location/ $BACKEND_UPLOADS/"
        echo ""
        read -p "   Copy files now? (y/n) " -n 1 -r
        echo
        if [[ $REPLY =~ ^[Yy]$ ]]; then
            echo "   📋 Copying files..."
            mkdir -p "$BACKEND_UPLOADS"
            rsync -av --progress root@$OLD_SERVER:$location/ $BACKEND_UPLOADS/ || {
                echo "   ❌ rsync failed"
                exit 1
            }
            chmod -R 755 "$BACKEND_UPLOADS"
            echo "   ✅ Files copied!"
        fi
        break
    else
        echo "     ❌ No files found"
    fi
done

# 3. Check if backend uploads has files now
echo ""
echo "📋 Step 3: Checking backend uploads directory..."
if [ -d "$BACKEND_UPLOADS" ]; then
    FILE_COUNT=$(find "$BACKEND_UPLOADS" -type f | wc -l)
    if [ "$FILE_COUNT" -gt "0" ]; then
        echo "   ✅ Backend uploads has $FILE_COUNT files"
        
        # Show first few files
        echo ""
        echo "   📋 Sample files:"
        find "$BACKEND_UPLOADS" -type f | head -5 | while read file; do
            filename=$(basename "$file")
            size=$(ls -lh "$file" | awk '{print $5}')
            echo "     - $filename ($size)"
        done
    else
        echo "   ⚠️  Backend uploads directory is empty"
        echo "   💡 Files need to be uploaded via admin panel or copied from old server"
    fi
else
    echo "   ⚠️  Backend uploads directory doesn't exist"
    mkdir -p "$BACKEND_UPLOADS"
    chmod -R 755 "$BACKEND_UPLOADS"
    echo "   ✅ Created directory"
fi

# 4. Summary
echo ""
echo "✅ Summary:"
echo "   Database records: $MEDIA_COUNT"
echo "   Backend uploads files: $(find "$BACKEND_UPLOADS" -type f 2>/dev/null | wc -l)"
echo ""
echo "💡 Next steps:"
echo "   1. If files are on old server, copy them using rsync"
echo "   2. If files need to be uploaded, use admin panel"
echo "   3. Restart backend: pm2 restart acoustic-backend"
echo "   4. Test: curl -I http://localhost:3001/uploads/<filename>"

