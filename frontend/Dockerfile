# Base stage for dependencies
FROM node:24.10.0-bookworm-slim AS deps
WORKDIR /app

# Copy package files from frontend directory
COPY package.json package-lock.json* ./
RUN npm ci

# Builder stage
FROM node:24.10.0-bookworm-slim AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Set environment variable for production build
ENV NEXT_TELEMETRY_DISABLED=1

# Build the application
RUN npm run build

# Runner stage for production
FROM node:24.10.0-bookworm-slim AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Create a non-root user
RUN groupadd --system --gid 1001 nodejs
RUN useradd --system --uid 1001 -g nodejs nextjs

# Copy necessary files from builder
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

ENTRYPOINT ["node", "server.js"]