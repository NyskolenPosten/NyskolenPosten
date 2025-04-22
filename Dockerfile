# syntax=docker/dockerfile:1

ARG NODE_VERSION=22.13.1
FROM node:${NODE_VERSION}-slim AS base
WORKDIR /app

# Install build dependencies
RUN apt-get update && apt-get install -y \
    python3 \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

# Install dependencies (with cache and bind mounts for deterministic builds)
COPY --link package.json package-lock.json ./
RUN --mount=type=cache,target=/root/.npm \
    --mount=type=bind,source=package.json,target=package.json \
    --mount=type=bind,source=package-lock.json,target=package-lock.json \
    npm ci

# Copy the rest of the application
COPY --link . .

# Build the React frontend
RUN --mount=type=cache,target=/root/.npm \
    npm run build

# Remove dev dependencies and prune node_modules for production
RUN npm prune --production

# --- Production image ---
FROM node:${NODE_VERSION}-slim AS final
WORKDIR /app

# Create non-root user
RUN addgroup --system appgroup && adduser --system --ingroup appgroup appuser

# Copy only necessary files from build stage
COPY --from=base /app/package.json ./
COPY --from=base /app/package-lock.json ./
COPY --from=base /app/node_modules ./node_modules
COPY --from=base /app/build ./build
COPY --from=base /app/public ./public
COPY --from=base /app/server.js ./server.js
COPY --from=base /app/cache.js ./cache.js
COPY --from=base /app/prisma ./prisma
COPY --from=base /app/services ./services
COPY --from=base /app/server ./server

# If you need any other backend files, add them here

ENV NODE_ENV=production
ENV NODE_OPTIONS="--max-old-space-size=4096"

USER appuser

EXPOSE 3001 3002

CMD ["node", "server.js"]

# .env and other secret files should NOT be copied into the image. Pass secrets at runtime.
