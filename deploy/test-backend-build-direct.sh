#!/bin/bash
# Test backend build directly

set -e

cd /var/www/acoustic.uz/apps/backend

echo "🔍 Testing backend build directly..."
echo ""

# Clean first
echo "🧹 Cleaning dist..."
rm -rf dist

# Try build with explicit output
echo "🔨 Building..."
echo "Command: pnpm exec nest build"
echo "---"

# Capture both stdout and stderr
pnpm exec nest build 2>&1 | tee /tmp/nest-build-output.log

BUILD_EXIT=$?

echo "---"
echo "Exit code: $BUILD_EXIT"

if [ $BUILD_EXIT -ne 0 ]; then
    echo "❌ Build failed!"
    echo ""
    echo "Full output:"
    cat /tmp/nest-build-output.log
else
    echo "✅ Build completed"
    echo ""
    echo "Checking dist:"
    ls -la dist/ 2>/dev/null || echo "dist directory not found"
fi

