# ---------- STAGE 1: Builder ----------
FROM node:22-alpine AS builder

# Set working directory
WORKDIR /workspace

# Copy all packages (shared workspaces)
COPY packages ./packages

# Globally install TypeScript compiler
RUN npm install -g tsc

# Build each shared package
WORKDIR /workspace/packages/constants
RUN npm install && npm run build

WORKDIR /workspace/packages/logger
RUN npm install && npm run build

WORKDIR /workspace/packages/kafka-client
RUN npm install && npm run build

WORKDIR /workspace/packages/redis-client
RUN npm install && npm run build

# Back to root
WORKDIR /workspace

# Copy API Gateway package files
COPY services/api-gateway/package*.json ./services/api-gateway/

# Install dependencies
WORKDIR /workspace/services/api-gateway
RUN npm install

# Copy source code and tsconfig
COPY services/api-gateway/tsconfig.json ./
COPY services/api-gateway/src ./src

# Build the TypeScript code to dist/
RUN npm run build

# ---------- STAGE 2: Production ----------
FROM node:22-alpine

WORKDIR /workspace

# Copy built packages and dist folder
COPY --from=builder /workspace/packages ./packages
COPY --from=builder /workspace/services/api-gateway/dist ./services/api-gateway/dist
COPY --from=builder /workspace/services/api-gateway/package*.json ./services/api-gateway/

# Set working dir to service
WORKDIR /workspace/services/api-gateway

# Use clean install for production
ENV NODE_ENV=production
RUN npm ci --omit=dev

# Expose port
EXPOSE 3000

# Run app
CMD ["node", "dist/app.js"]
