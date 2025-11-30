#!/bin/bash

# Fix permissions and clean build artifacts

set -e

PROJECT_DIR="/var/www/news.acoustic.uz"
ADMIN_DIR="/var/www/admins.acoustic.uz"

echo "🔧 Fixing permissions and cleaning build artifacts..."

# Get current user
CURRENT_USER=$(whoami)

# Clean .next directories (they will be regenerated)
echo "Cleaning .next directories..."
find "$PROJECT_DIR/apps/frontend" -name ".next" -type d -exec rm -rf {} + 2>/dev/null || true
find "$PROJECT_DIR/apps/admin" -name ".next" -type d -exec rm -rf {} + 2>/dev/null || true
find "$PROJECT_DIR/apps/backend" -name "dist" -type d -exec rm -rf {} + 2>/dev/null || true

# Set ownership
echo "Setting ownership to $CURRENT_USER..."
sudo chown -R $CURRENT_USER:$CURRENT_USER "$PROJECT_DIR" || true
sudo chown -R $CURRENT_USER:$CURRENT_USER "$ADMIN_DIR" || true

# Set permissions
echo "Setting permissions..."
sudo chmod -R 755 "$PROJECT_DIR" || true
sudo chmod -R 755 "$ADMIN_DIR" || true

# Ensure uploads directory exists and has correct permissions
sudo mkdir -p "$PROJECT_DIR/uploads" || true
sudo chmod -R 755 "$PROJECT_DIR/uploads" || true
sudo chown -R $CURRENT_USER:$CURRENT_USER "$PROJECT_DIR/uploads" || true

echo "✅ Permissions fixed!"

