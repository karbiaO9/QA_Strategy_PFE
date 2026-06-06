# ─────────────────────────────────────────────
# Stage 1 — Dependencies
# ─────────────────────────────────────────────
FROM node:20-alpine AS deps
WORKDIR /app

# Install only production-necessary OS deps
RUN apk add --no-cache libc6-compat

COPY package.json ./
RUN yarn install --frozen-lockfile

# ─────────────────────────────────────────────
# Stage 2 — Builder
# APP_NAME must be passed at build time:
#   --build-arg APP_NAME=admin   → yarn admin:build
#   --build-arg APP_NAME=physio  → yarn physio:build
# ─────────────────────────────────────────────
FROM node:20-alpine AS builder
WORKDIR /app

ARG APP_NAME
ENV NEXT_TELEMETRY_DISABLED=1

# Copy deps from previous stage
COPY --from=deps /app/node_modules ./node_modules
COPY . .

RUN yarn ${APP_NAME}:build

# ─────────────────────────────────────────────
# Stage 3 — Runner (lean production image)
# ─────────────────────────────────────────────
FROM node:20-alpine AS runner
WORKDIR /app

ARG APP_NAME
ARG NEXT_PUBLIC_API_URL_ADMIN
ARG NEXTAUTH_URL_ADMIN
ARG NEXTAUTH_SECRET_ADMIN
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV APP_NAME=${APP_NAME}
ENV NEXT_PUBLIC_API_URL_ADMIN=https://identity.physio.agregatech.com
ENV NEXTAUTH_URL_ADMIN=http://localhost:3000
ENV NEXTAUTH_SECRET_ADMIN=IctrPZRvpUs2LGBVFo5aGQ2kT9DR8iOv1vivYZfRWQIsxsE6J032gu7LEs=

RUN addgroup --system --gid 1001 nodejs \
 && adduser  --system --uid 1001 nextjs

# Copy built standalone output (preserves monorepo structure: apps/admin/server.js, apps/admin/.next/*, etc.)
COPY --from=builder --chown=nextjs:nodejs /app/apps/${APP_NAME}/.next/standalone ./

# Copy static assets separately (needed for CSS/images)
COPY --from=builder --chown=nextjs:nodejs /app/apps/${APP_NAME}/public ./apps/${APP_NAME}/public
COPY --from=builder --chown=nextjs:nodejs /app/apps/${APP_NAME}/.next/static ./apps/${APP_NAME}/.next/static

USER nextjs

EXPOSE 3000
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

CMD ["sh", "-c", "node apps/${APP_NAME}/server.js"]



