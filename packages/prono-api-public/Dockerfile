# Build stage
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files
COPY package.json pnpm-lock.yaml ./

# Install dependencies
RUN npm install -g pnpm && pnpm install --frozen-lockfile

# Copy source code
COPY . .

# Build the project
RUN pnpm run build

# Runtime stage
FROM node:20-alpine

WORKDIR /app

# Copy package files from builder
COPY --from=builder /app/package.json /app/pnpm-lock.yaml ./

# Install production dependencies only
RUN npm install -g pnpm && pnpm install --frozen-lockfile --prod

# Copy built application
COPY --from=builder /app/dist ./dist

# Copy Prisma schema
COPY --from=builder /app/prisma ./prisma

# Expose port
EXPOSE 3000

# Start the application
CMD ["node", "dist/index.js"]
