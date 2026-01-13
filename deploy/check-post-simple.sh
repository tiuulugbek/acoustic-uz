#!/bin/bash

set -e

PROJECT_DIR="/var/www/acoustic.uz"

cd "$PROJECT_DIR"
if [ -f .env ]; then
    set -a
    source .env
    set +a
else
    echo "❌ Error: .env file not found"
    exit 1
fi

if [ -z "$DATABASE_URL" ]; then
    echo "❌ Error: DATABASE_URL not set"
    exit 1
fi

# Show DATABASE_URL (first 50 chars for security)
echo "DATABASE_URL: ${DATABASE_URL:0:50}..."
echo ""

# Remove query parameters from DATABASE_URL
CLEAN_DB_URL="${DATABASE_URL%%\?*}"

# Try using psql with the clean URL
echo "Checking post: inson-eshitish-organi-qanday-tuzilgan"
echo ""

# Use python or node to parse and query if psql fails
if command -v node &> /dev/null; then
    node << NODE_SCRIPT
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkPost() {
  try {
    const post = await prisma.post.findUnique({
      where: { slug: 'inson-eshitish-organi-qanday-tuzilgan' },
      include: { category: true }
    });
    
    if (post) {
      console.log('Post found:');
      console.log('  ID:', post.id);
      console.log('  Title:', post.title_uz);
      console.log('  PostType:', post.postType);
      console.log('  Status:', post.status);
      console.log('  CategoryId:', post.categoryId || 'NULL');
      console.log('  Category Name:', post.category?.name_uz || 'NULL');
      console.log('  Category Section:', post.category?.section || 'NULL');
    } else {
      console.log('Post not found');
    }
    
    const patientsCategories = await prisma.postCategory.findMany({
      where: { section: 'patients' }
    });
    
    console.log('\nPatients section categories:');
    patientsCategories.forEach(cat => {
      console.log('  -', cat.name_uz, '(id:', cat.id + ', slug:', cat.slug + ')');
    });
    
    const childrenCategories = await prisma.postCategory.findMany({
      where: { section: 'children' }
    });
    
    console.log('\nChildren section categories:');
    childrenCategories.forEach(cat => {
      console.log('  -', cat.name_uz, '(id:', cat.id + ', slug:', cat.slug + ')');
    });
    
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await prisma.\$disconnect();
  }
}

checkPost();
NODE_SCRIPT
else
    echo "Node.js not found. Trying psql with clean URL..."
    psql "$CLEAN_DB_URL" << SQL
SELECT 
    p.id,
    p."title_uz",
    p."postType",
    p.status,
    p."categoryId",
    pc."name_uz" as category_name,
    pc.section as category_section,
    p."publishAt"
FROM "Post" p
LEFT JOIN "PostCategory" pc ON p."categoryId" = pc.id
WHERE p.slug = 'inson-eshitish-organi-qanday-tuzilgan';
SQL
fi
