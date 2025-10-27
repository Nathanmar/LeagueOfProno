FROM node:20-alpine

WORKDIR /app

# Install pnpm
RUN npm install -g pnpm

# Copy workspace files
COPY pnpm-workspace.yaml pnpm-lock.yaml ./

# Copy packages
COPY packages/prono-api ./packages/prono-api

# Install dependencies
RUN pnpm install --frozen-lockfile

# Build API
WORKDIR /app/packages/prono-api
RUN pnpm run build

# Expose port
EXPOSE 3001

# Start API server
CMD ["node", "dist/index.js"]
