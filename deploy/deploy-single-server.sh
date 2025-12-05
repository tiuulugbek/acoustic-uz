#!/bin/bash
# Deploy to a single server by name

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
CONFIG_FILE="$SCRIPT_DIR/servers.conf"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

if [ -z "$1" ]; then
    echo -e "${RED}❌ Usage: $0 <server_name>${NC}"
    echo ""
    echo "Available servers:"
    grep -v "^#" "$CONFIG_FILE" | grep -v "^$" | while IFS='|' read -r name host dir frontend backend admin; do
        echo "  - $name ($host)"
    done
    exit 1
fi

SERVER_NAME="$1"

# Find server config
SERVER_CONFIG=$(grep -v "^#" "$CONFIG_FILE" | grep -v "^$" | grep "^$SERVER_NAME|" || echo "")

if [ -z "$SERVER_CONFIG" ]; then
    echo -e "${RED}❌ Server '$SERVER_NAME' not found in $CONFIG_FILE${NC}"
    exit 1
fi

# Use deploy-all-servers.sh function
source "$SCRIPT_DIR/deploy-all-servers.sh"
deploy_to_server "$SERVER_CONFIG"

