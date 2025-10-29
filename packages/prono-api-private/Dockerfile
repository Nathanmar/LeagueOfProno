# Build stage
FROM node:20-alpine AS builder

WORKDIR /app

# Install pnpm
RUN npm install -g pnpm

# Copy workspace files
COPY pnpm-workspace.yaml pnpm-lock.yaml ./

# Copy prono-api-private package
COPY packages/prono-api-private ./packages/prono-api-private

# Install dependencies
RUN pnpm install --frozen-lockfile

# Build the API
WORKDIR /app/packages/prono-api-private
RUN pnpm run build

# Production stage
FROM node:20-alpine

WORKDIR /app

# Install pnpm and create app user
RUN npm install -g pnpm && addgroup -g 1001 -S nodejs && adduser -S nodejs -u 1001

# Copy only necessary files from builder
COPY --from=builder /app/packages/prono-api-private/dist ./dist
COPY --from=builder /app/packages/prono-api-private/package.json ./
COPY --from=builder /app/packages/prono-api-private/prisma ./prisma
COPY --from=builder /app/pnpm-lock.yaml ./

# Install only production dependencies
RUN pnpm install --frozen-lockfile --prod

# Change ownership
RUN chown -R nodejs:nodejs /app

USER nodejs

# Expose port
EXPOSE 3001

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD node -e "require('http').get('http://localhost:3001/health', (r) => {if (r.statusCode !== 200) throw new Error(r.statusCode)})"

# Start the application
CMD ["node", "dist/index.js"]
