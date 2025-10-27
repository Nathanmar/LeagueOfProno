FROM node:20-alpine

WORKDIR /app

# Install pnpm
RUN npm install -g pnpm

# Copy workspace files
COPY pnpm-workspace.yaml pnpm-lock.yaml ./

# Copy packages
COPY packages/prono-front ./packages/prono-front
COPY packages/prono-api ./packages/prono-api

# Install dependencies
RUN pnpm install --frozen-lockfile

# Build frontend
WORKDIR /app/packages/prono-front
RUN pnpm run build

# Expose port
EXPOSE 5173

# Start dev server
CMD ["pnpm", "run", "dev"]
