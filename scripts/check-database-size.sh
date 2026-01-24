#!/bin/bash

# Database hajmini tekshirish skripti

DATABASE_URL="postgresql://acoustic_user:Acoustic%23%234114@localhost:5432/acousticwebdb"

echo "=== Database hajmi tekshiruvi ==="
echo ""

# Database umumiy hajmi
echo "📊 Database umumiy hajmi:"
psql "$DATABASE_URL" -c "SELECT pg_database.datname, pg_size_pretty(pg_database_size(pg_database.datname)) AS size, pg_database_size(pg_database.datname) AS size_bytes FROM pg_database WHERE datname = 'acousticwebdb';" 2>/dev/null

echo ""
echo "📋 Eng katta jadvallar (top 10):"
psql "$DATABASE_URL" -c "
SELECT 
    tablename,
    pg_size_pretty(pg_total_relation_size('public.'||tablename)) AS size,
    pg_total_relation_size('public.'||tablename) AS size_bytes
FROM pg_tables 
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size('public.'||tablename) DESC
LIMIT 10;
" 2>/dev/null

echo ""
echo "📦 Backup fayllari:"
ls -lh /root/acoustic.uz/backups/acousticwebdb_*.sql.gz 2>/dev/null | tail -5 | awk '{print $9, $5}'

echo ""
echo "📊 So'nggi backup tafsilotlari:"
latest_backup=$(ls -t /root/acoustic.uz/backups/acousticwebdb_*.sql.gz 2>/dev/null | head -1)
if [ -n "$latest_backup" ]; then
    echo "Fayl: $latest_backup"
    echo "Siqilgan hajm: $(du -h "$latest_backup" | cut -f1)"
    echo "Siqilmagan hajm (taxminiy):"
    gunzip -l "$latest_backup" 2>/dev/null | tail -1
fi

echo ""
echo "📈 Statistikalar:"
psql "$DATABASE_URL" -c "
SELECT 
    'Jadvallar soni' as info,
    COUNT(*)::text as value
FROM pg_tables 
WHERE schemaname = 'public'
UNION ALL
SELECT 
    'Indexlar soni',
    COUNT(*)::text
FROM pg_indexes
WHERE schemaname = 'public'
UNION ALL
SELECT 
    'Database hajmi',
    pg_size_pretty(pg_database_size('acousticwebdb'))
UNION ALL
SELECT 
    'Database hajmi (bayt)',
    pg_database_size('acousticwebdb')::text;
" 2>/dev/null
