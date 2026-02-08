# ============================================
# STAGE 1 — BUILDER
# ============================================
FROM node:20-alpine AS builder

WORKDIR /app

# Copy dependency manifests (layer cache)
COPY package.json package-lock.json ./

# Install ALL dependencies (dev + prod)
RUN npm ci

# Copy Prisma schema + config and generate client
COPY prisma ./prisma
COPY prisma.config.ts ./
RUN npx prisma generate

# Copy source code and build
COPY tsconfig.json ./
COPY src ./src
RUN npm run build

# ============================================
# STAGE 2 — PRODUCTION RUNNER
# ============================================
FROM node:20-alpine AS runner

WORKDIR /app

# Copy dependency manifests
COPY package.json package-lock.json ./

# Install production dependencies only (includes prisma CLI for migrations)
RUN npm ci --omit=dev

# Copy compiled output, prisma schema + config from builder
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/prisma.config.ts ./

# Copy startup script
COPY scripts/start.sh ./start.sh

# Environment
ENV NODE_ENV=production

# Create non-root user
RUN addgroup -S appgroup && \
    adduser -S appuser -G appgroup && \
    chown -R appuser:appgroup /app && \
    chmod +x start.sh

# Use non-root user
USER appuser

# Expose API port
EXPOSE 5000

# Start container
CMD ["./start.sh"]
