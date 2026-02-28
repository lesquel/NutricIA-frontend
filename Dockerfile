# ──────────────────────────────────────────────
# NutricIA Frontend — Dockerfile
# ──────────────────────────────────────────────
FROM node:22-slim AS base

WORKDIR /app

# Install system deps for Expo
RUN apt-get update && \
    apt-get install -y --no-install-recommends \
        git \
        curl && \
    rm -rf /var/lib/apt/lists/*

# Copy dependency files first for layer caching
COPY package.json package-lock.json* ./

# Install dependencies
RUN npm install

# Copy application code
COPY . .

# Expose Expo dev server port
EXPOSE 8081

# Start Expo dev server
CMD ["npx", "expo", "start", "--lan"]
