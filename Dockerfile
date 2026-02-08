# ============================================
# STAGE 1 — BUILDER
# ============================================
FROM node:20-alpine AS builder

WORKDIR /app

# 1. Copy dependency manifests (layer cache)
COPY package.json package-lock.json ./

# 2. Install ALL dependencies (dev + prod)
RUN npm ci

# 3. Copy Prisma schema + config and generate client
COPY prisma ./prisma
COPY prisma.config.ts ./
RUN npx prisma generate

# 4. Copy source code and build
COPY tsconfig.json ./
COPY src ./src
RUN npm run build

# ============================================
# STAGE 2 — PRODUCTION RUNNER
# ============================================
FROM node:20-alpine AS runner

WORKDIR /app

# 1. Copy dependency manifests
COPY package.json package-lock.json ./

# 2. Install production dependencies ONLY
RUN npm ci --omit=dev

# 3. Copy compiled output and prisma schema from builder
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/prisma ./prisma

# 4. Set environment
ENV NODE_ENV=production

# 5. Create non-root user
RUN addgroup -S appgroup && \
    adduser -S appuser -G appgroup

# 6. Switch to non-root user
USER appuser

# 7. Expose port
EXPOSE 5000

# 8. Start app
CMD ["node", "dist/server.js"]
