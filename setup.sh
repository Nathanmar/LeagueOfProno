#!/bin/bash

# Setup script pour LeagueOfProno SSR + Real-time

set -e

echo "🚀 LeagueOfProno - SSR & Real-time Setup"
echo "========================================"
echo ""

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if pnpm is installed
if ! command -v pnpm &> /dev/null; then
    echo "${YELLOW}⚠️  pnpm not found. Installing...${NC}"
    npm install -g pnpm
fi

# Install dependencies
echo "${BLUE}📦 Installing dependencies...${NC}"
pnpm install

# Create .env.local for frontend
echo "${BLUE}🔧 Setting up environment variables...${NC}"

FRONT_ENV="packages/prono-front/.env.local"
if [ ! -f "$FRONT_ENV" ]; then
    cat > "$FRONT_ENV" << EOF
# API Configuration
VITE_API_URL=http://localhost:3001/api
VITE_WS_URL=ws://localhost:3001/ws

# Server Configuration
VITE_PORT=5173
VITE_HOST=localhost
EOF
    echo "${GREEN}✅ Created $FRONT_ENV${NC}"
else
    echo "${YELLOW}⚠️  $FRONT_ENV already exists, skipping${NC}"
fi

# Build frontend
echo "${BLUE}🔨 Building frontend...${NC}"
cd packages/prono-front
pnpm run build
cd ../..

# Build API
echo "${BLUE}🔨 Building API...${NC}"
cd packages/prono-api
pnpm run build
cd ../..

echo ""
echo "${GREEN}✅ Setup complete!${NC}"
echo ""
echo "${BLUE}Next steps:${NC}"
echo ""
echo "1. Start the API server:"
echo "   ${YELLOW}cd packages/prono-api && pnpm run dev${NC}"
echo ""
echo "2. Start the frontend dev server:"
echo "   ${YELLOW}cd packages/prono-front && pnpm run dev${NC}"
echo ""
echo "3. Or run preview:"
echo "   ${YELLOW}cd packages/prono-front && pnpm run preview${NC}"
echo ""
echo "API will be available at: ${YELLOW}http://localhost:3001${NC}"
echo "Frontend will be available at: ${YELLOW}http://localhost:5173${NC}"
echo ""
