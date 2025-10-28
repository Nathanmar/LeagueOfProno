#!/bin/bash

# Build script for prono-api-public
echo "Building prono-api-public..."

# Install dependencies if needed
if [ ! -d "node_modules" ]; then
  echo "Installing dependencies..."
  pnpm install
fi

# Build the project
echo "Compiling TypeScript..."
pnpm run build

# Generate Prisma Client
echo "Generating Prisma Client..."
pnpm exec prisma generate

echo "Build complete!"
echo "To start the server, run: pnpm start"
