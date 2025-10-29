# Build stage
FROM node:20-alpine AS builder

WORKDIR /app

# Install pnpm
RUN npm install -g pnpm

# Copy workspace files
COPY pnpm-workspace.yaml pnpm-lock.yaml ./

# Copy prono-front package
COPY packages/prono-front ./packages/prono-front

# Install dependencies
RUN pnpm install --frozen-lockfile

# Build the frontend
WORKDIR /app/packages/prono-front
RUN pnpm run build

# Production stage
FROM node:20-alpine

WORKDIR /app

# Install pnpm and create app user
RUN npm install -g pnpm && addgroup -g 1001 -S nodejs && adduser -S nodejs -u 1001

# Copy only necessary files from builder
COPY --from=builder /app/packages/prono-front/build ./build
COPY --from=builder /app/packages/prono-front/package.json ./
COPY --from=builder /app/pnpm-lock.yaml ./

# Install only production dependencies
RUN pnpm install --frozen-lockfile --prod

# Change ownership
RUN chown -R nodejs:nodejs /app

USER nodejs

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD node -e "require('http').get('http://localhost:3000', (r) => {if (r.statusCode !== 200) throw new Error(r.statusCode)})"

# Start the application (React Router with SSR)
CMD ["pnpm", "start"]
