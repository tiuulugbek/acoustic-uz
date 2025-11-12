#!/bin/bash
# Generate Prisma Client
# This script generates Prisma client in the backend app

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
BACKEND_DIR="$PROJECT_ROOT/apps/backend"

cd "$BACKEND_DIR" || exit 1

# Set environment variable to skip Prisma's auto-install check
export PRISMA_GENERATE_SKIP_AUTOINSTALL=1
export PRISMA_SKIP_POSTINSTALL_GENERATE=1

# Try global prisma first, then local, then npx
if command -v prisma &> /dev/null; then
  echo "Using global Prisma installation..."
  prisma generate --schema=../../prisma/schema.prisma --skip-generate
  # Manually run generate
  PRISMA_CLI_QUERY_ENGINE_LIBRARY="$PROJECT_ROOT/node_modules/.pnpm/@prisma+engines@*/node_modules/@prisma/engines/libquery_engine-*" \
  prisma generate --schema=../../prisma/schema.prisma
elif [ -f "$PROJECT_ROOT/node_modules/.pnpm/prisma@5.22.0/node_modules/prisma/build/index.js" ]; then
  echo "Using local Prisma installation (direct node execution)..."
  # Direct execution bypassing Prisma's install check
  node "$PROJECT_ROOT/node_modules/.pnpm/prisma@5.22.0/node_modules/prisma/build/index.js" generate --schema=../../prisma/schema.prisma
else
  echo "Using npx to run Prisma..."
  npx --yes prisma@5.22.0 generate --schema=../../prisma/schema.prisma
fi

