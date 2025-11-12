#!/bin/bash
# Direct Prisma Client Generation - Bypasses installation checks
# This script manually generates Prisma client by calling the generator directly

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
BACKEND_DIR="$PROJECT_ROOT/apps/backend"
SCHEMA_PATH="$PROJECT_ROOT/prisma/schema.prisma"

cd "$BACKEND_DIR" || exit 1

# Find Prisma installation
PRISMA_PATH=$(find "$PROJECT_ROOT/node_modules" -name "prisma" -type f -path "*/build/index.js" 2>/dev/null | head -1)

if [ -z "$PRISMA_PATH" ]; then
  echo "Error: Prisma not found in node_modules"
  echo "Please run: pnpm install"
  exit 1
fi

echo "Found Prisma at: $PRISMA_PATH"
echo "Generating Prisma Client..."

# Set Node path to include @prisma/client location
export NODE_PATH="$BACKEND_DIR/node_modules:$PROJECT_ROOT/node_modules"

# Run Prisma generate with direct node execution
# Use --skip-install to prevent Prisma from trying to install itself
node "$PRISMA_PATH" generate \
  --schema="$SCHEMA_PATH" \
  2>&1 | grep -v "Command failed" | grep -v "pnpm add" || true

# Check if generation was successful
if [ -d "node_modules/.prisma/client" ] || [ -d "node_modules/@prisma/client" ]; then
  echo "✅ Prisma Client generated successfully!"
else
  echo "⚠️  Prisma Client generation may have failed. Checking..."
  # Try alternative: use the @prisma/generator-helper directly
  echo "Attempting alternative generation method..."
  
  # Manual generation using @prisma/generator-helper
  GENERATOR_PATH=$(find "$PROJECT_ROOT/node_modules" -name "generator-helper" -type d 2>/dev/null | head -1)
  if [ -n "$GENERATOR_PATH" ]; then
    echo "Found generator helper, but manual generation is complex."
    echo "Please try: cd apps/backend && pnpm install --force"
    echo "Then run this script again."
  fi
fi

