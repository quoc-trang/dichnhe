# syntax=docker/dockerfile:1.4
# Multi-stage build — image cuối cùng chỉ chứa runtime, không có dev tools

# ====== STAGE 1: deps ======
# Cài node_modules riêng một stage để Docker cache lớp này khi package.json không đổi
FROM node:20-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json* ./
RUN npm ci

# ====== STAGE 2: builder ======
# Build Next.js app
FROM node:20-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
# Disable telemetry (Next.js gửi anonymous usage data — không cần khi deploy)
ENV NEXT_TELEMETRY_DISABLED=1
RUN npm run build

# ====== STAGE 3: runner ======
# Image cuối — chỉ runtime + standalone output
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Tạo user không phải root cho an toàn
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copy standalone output (server + deps tối thiểu) + public + static
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
# Nếu có thư mục public thì uncomment dòng dưới:
# COPY --from=builder --chown=nextjs:nodejs /app/public ./public

USER nextjs

# Cloud Run inject env PORT — Next.js phải nghe đúng cổng đó
ENV PORT=8080
ENV HOSTNAME="0.0.0.0"
EXPOSE 8080

CMD ["node", "server.js"]
