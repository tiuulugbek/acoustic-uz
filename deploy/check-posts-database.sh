#!/bin/bash
# Script to check posts in database

set -e

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${BLUE}=======================================${NC}"
echo -e "${BLUE}  Checking Posts in Database          ${NC}"
echo -e "${BLUE}=======================================${NC}"

# Load database credentials from .env
if [ -f "/var/www/acoustic.uz/.env" ]; then
    source /var/www/acoustic.uz/.env
elif [ -f "/var/www/acoustic.uz/apps/backend/.env" ]; then
    source /var/www/acoustic.uz/apps/backend/.env
else
    echo -e "${RED}❌ .env file not found${NC}"
    exit 1
fi

if [ -z "$DATABASE_URL" ]; then
    echo -e "${RED}❌ DATABASE_URL not found in .env${NC}"
    exit 1
fi

# Extract database connection details from DATABASE_URL
# Format: postgresql://user:password@host:port/database?query_params
if [[ $DATABASE_URL == postgresql://* ]]; then
    # Remove postgresql:// prefix
    DB_URL=${DATABASE_URL#postgresql://}
    # Extract user and password
    DB_USER_PASS=${DB_URL%%@*}
    DB_USER=${DB_USER_PASS%%:*}
    DB_PASS=${DB_USER_PASS#*:}
    # Extract host, port and database
    DB_HOST_PORT_DB=${DB_URL#*@}
    DB_HOST=${DB_HOST_PORT_DB%%:*}
    DB_PORT_DB=${DB_HOST_PORT_DB#*:}
    DB_PORT=${DB_PORT_DB%%/*}
    DB_NAME=${DB_PORT_DB#*/}
    # Remove query parameters if any
    DB_NAME=${DB_NAME%%\?*}
    
    # Create clean DATABASE_URL without query parameters for psql
    CLEAN_DATABASE_URL="postgresql://${DB_USER}:${DB_PASS}@${DB_HOST}:${DB_PORT}/${DB_NAME}"
else
    echo -e "${RED}❌ Invalid DATABASE_URL format${NC}"
    exit 1
fi

echo ""
echo -e "${BLUE}1️⃣ Database Connection Info:${NC}"
echo "  Host: $DB_HOST"
echo "  Port: $DB_PORT"
echo "  Database: $DB_NAME"
echo "  User: $DB_USER"

# Test connection first
echo ""
echo -e "${BLUE}2️⃣ Testing Database Connection:${NC}"
if PGPASSWORD="$DB_PASS" psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -c "SELECT 1;" > /dev/null 2>&1; then
    echo -e "${GREEN}  ✅ Connection successful${NC}"
    USE_DATABASE_URL=false
else
    echo -e "${YELLOW}  ⚠️  Direct connection failed. Trying clean DATABASE_URL...${NC}"
    # Try using clean DATABASE_URL (without query parameters)
    if psql "$CLEAN_DATABASE_URL" -c "SELECT 1;" > /dev/null 2>&1; then
        echo -e "${GREEN}  ✅ Connection successful using clean DATABASE_URL${NC}"
        USE_DATABASE_URL=true
        USE_CLEAN_URL=true
    else
        echo -e "${RED}  ❌ Connection failed. Please check DATABASE_URL in .env${NC}"
        echo -e "${YELLOW}  Trying to connect as postgres user...${NC}"
        # Last resort: try as postgres user
        if sudo -u postgres psql -d "$DB_NAME" -c "SELECT 1;" > /dev/null 2>&1; then
            echo -e "${GREEN}  ✅ Connection successful as postgres user${NC}"
            USE_POSTGRES_USER=true
        else
            echo -e "${RED}  ❌ All connection methods failed${NC}"
            exit 1
        fi
    fi
fi

echo ""
echo -e "${BLUE}3️⃣ Total Posts Count:${NC}"
if [ "$USE_DATABASE_URL" = true ]; then
    TOTAL_POSTS=$(psql "$DATABASE_URL" -t -c "SELECT COUNT(*) FROM \"Post\";" 2>/dev/null | xargs)
else
    TOTAL_POSTS=$(PGPASSWORD="$DB_PASS" psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -t -c "SELECT COUNT(*) FROM \"Post\";" 2>/dev/null | xargs)
fi
echo "  Total posts: $TOTAL_POSTS"

# Function to run psql command
run_psql() {
    local query="$1"
    if [ "$USE_POSTGRES_USER" = true ]; then
        sudo -u postgres psql -d "$DB_NAME" -c "$query" 2>/dev/null
    elif [ "$USE_CLEAN_URL" = true ]; then
        psql "$CLEAN_DATABASE_URL" -c "$query" 2>/dev/null
    elif [ "$USE_DATABASE_URL" = true ]; then
        psql "$DATABASE_URL" -c "$query" 2>/dev/null
    else
        PGPASSWORD="$DB_PASS" psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -c "$query" 2>/dev/null
    fi
}

echo ""
echo -e "${BLUE}4️⃣ Posts by Status:${NC}"
run_psql "SELECT status, COUNT(*) as count FROM \"Post\" GROUP BY status ORDER BY count DESC;"

echo ""
echo -e "${BLUE}5️⃣ Posts by Type:${NC}"
run_psql "SELECT \"postType\", COUNT(*) as count FROM \"Post\" GROUP BY \"postType\" ORDER BY count DESC;"

echo ""
echo -e "${BLUE}6️⃣ Posts with Categories:${NC}"
run_psql "SELECT COUNT(*) as posts_with_category FROM \"Post\" WHERE \"categoryId\" IS NOT NULL;"
run_psql "SELECT COUNT(*) as posts_without_category FROM \"Post\" WHERE \"categoryId\" IS NULL;"

echo ""
echo -e "${BLUE}7️⃣ Posts by Category (Top 10):${NC}"
run_psql "
SELECT 
    pc.\"name_uz\" as category_name,
    pc.\"section\" as section,
    COUNT(p.id) as post_count
FROM \"Post\" p
LEFT JOIN \"PostCategory\" pc ON p.\"categoryId\" = pc.id
WHERE p.status = 'published'
GROUP BY pc.id, pc.\"name_uz\", pc.\"section\"
ORDER BY post_count DESC
LIMIT 10;
"

echo ""
echo -e "${BLUE}8️⃣ Recent Published Posts (Last 10):${NC}"
run_psql "
SELECT 
    p.id,
    p.\"title_uz\",
    p.\"postType\",
    p.status,
    p.\"categoryId\",
    pc.\"name_uz\" as category_name,
    pc.\"section\" as section,
    p.\"publishAt\"
FROM \"Post\" p
LEFT JOIN \"PostCategory\" pc ON p.\"categoryId\" = pc.id
WHERE p.status = 'published'
ORDER BY p.\"publishAt\" DESC
LIMIT 10;
"

echo ""
echo -e "${BLUE}9️⃣ Posts for 'patients' section:${NC}"
run_psql "
SELECT 
    p.id,
    p.\"title_uz\",
    p.\"postType\",
    p.status,
    pc.\"name_uz\" as category_name,
    pc.\"section\" as section
FROM \"Post\" p
LEFT JOIN \"PostCategory\" pc ON p.\"categoryId\" = pc.id
WHERE p.status = 'published' 
  AND (pc.\"section\" = 'patients' OR p.\"categoryId\" IS NULL)
ORDER BY p.\"publishAt\" DESC;
"

echo ""
echo -e "${BLUE}🔟 Posts for 'children' section:${NC}"
run_psql "
SELECT 
    p.id,
    p.\"title_uz\",
    p.\"postType\",
    p.status,
    pc.\"name_uz\" as category_name,
    pc.\"section\" as section
FROM \"Post\" p
LEFT JOIN \"PostCategory\" pc ON p.\"categoryId\" = pc.id
WHERE p.status = 'published' 
  AND (pc.\"section\" = 'children' OR p.\"categoryId\" IS NULL)
ORDER BY p.\"publishAt\" DESC;
"

echo ""
echo -e "${BLUE}1️⃣1️⃣ Post Categories:${NC}"
run_psql "
SELECT 
    id,
    \"name_uz\",
    \"name_ru\",
    \"section\",
    status,
    COUNT(p.id) as post_count
FROM \"PostCategory\" pc
LEFT JOIN \"Post\" p ON p.\"categoryId\" = pc.id AND p.status = 'published'
GROUP BY pc.id, pc.\"name_uz\", pc.\"name_ru\", pc.\"section\", pc.status
ORDER BY pc.\"section\", pc.\"name_uz\";
"

echo ""
echo -e "${GREEN}=======================================${NC}"
echo -e "${GREEN}✅ Database Check Complete!          ${NC}"
echo -e "${GREEN}=======================================${NC}"

