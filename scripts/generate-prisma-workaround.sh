#!/bin/bash
# Prisma Generation Workaround for pnpm workspaces
# This script temporarily works around Prisma's pnpm detection

set -e

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
BACKEND_DIR="$PROJECT_ROOT/apps/backend"
SCHEMA_PATH="$PROJECT_ROOT/prisma/schema.prisma"

cd "$BACKEND_DIR" || exit 1

echo "🔄 Generating Prisma Client (workaround for pnpm workspace)..."

# Method 1: Try to trick Prisma by temporarily renaming pnpm files
if [ -f "$PROJECT_ROOT/pnpm-workspace.yaml" ]; then
  echo "Temporarily disabling pnpm workspace detection..."
  mv "$PROJECT_ROOT/pnpm-workspace.yaml" "$PROJECT_ROOT/pnpm-workspace.yaml.bak" 2>/dev/null || true
fi

# Try to use Prisma - first try npx, then pnpm exec, then global
if command -v npx &> /dev/null; then
  echo "Using npx prisma..."
  if npx prisma@5.22.0 generate --schema="$SCHEMA_PATH" 2>&1 | grep -q "Error"; then
    echo "Generation failed, restoring workspace file..."
    [ -f "$PROJECT_ROOT/pnpm-workspace.yaml.bak" ] && mv "$PROJECT_ROOT/pnpm-workspace.yaml.bak" "$PROJECT_ROOT/pnpm-workspace.yaml"
    exit 1
  fi
  echo "✅ Success!"
elif command -v pnpm &> /dev/null; then
  echo "Using pnpm exec prisma..."
  if pnpm exec prisma generate --schema="$SCHEMA_PATH" 2>&1 | grep -q "Error"; then
    echo "Generation failed, restoring workspace file..."
    [ -f "$PROJECT_ROOT/pnpm-workspace.yaml.bak" ] && mv "$PROJECT_ROOT/pnpm-workspace.yaml.bak" "$PROJECT_ROOT/pnpm-workspace.yaml"
    exit 1
  fi
  echo "✅ Success!"
elif command -v prisma &> /dev/null; then
  echo "Using global Prisma..."
  if prisma generate --schema="$SCHEMA_PATH" 2>&1 | grep -q "Error"; then
    echo "Generation failed, restoring workspace file..."
    [ -f "$PROJECT_ROOT/pnpm-workspace.yaml.bak" ] && mv "$PROJECT_ROOT/pnpm-workspace.yaml.bak" "$PROJECT_ROOT/pnpm-workspace.yaml"
    exit 1
  fi
  echo "✅ Success!"
else
  echo "❌ Prisma not found. Trying npx..."
  if npx prisma@5.22.0 generate --schema="$SCHEMA_PATH"; then
    echo "✅ Success with npx!"
  else
    echo "❌ Prisma generation failed. Please install: npm install -g prisma@5.22.0"
    [ -f "$PROJECT_ROOT/pnpm-workspace.yaml.bak" ] && mv "$PROJECT_ROOT/pnpm-workspace.yaml.bak" "$PROJECT_ROOT/pnpm-workspace.yaml"
    exit 1
  fi
fi

# Restore workspace file
if [ -f "$PROJECT_ROOT/pnpm-workspace.yaml.bak" ]; then
  mv "$PROJECT_ROOT/pnpm-workspace.yaml.bak" "$PROJECT_ROOT/pnpm-workspace.yaml"
  echo "Restored pnpm-workspace.yaml"
fi

# Verify generation
if [ -d "node_modules/.prisma/client" ] || [ -d "node_modules/@prisma/client/generated" ]; then
  echo "✅ Prisma Client generated successfully!"
  echo "📍 Location: node_modules/.prisma/client or node_modules/@prisma/client"
else
  echo "⚠️  Warning: Prisma Client files not found in expected locations"
  echo "   But generation may have succeeded. Check node_modules/@prisma/client"
fi

