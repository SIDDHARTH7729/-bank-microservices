FROM node:22-alpine AS builder

WORKDIR /workspace

COPY packages ./packages
RUN npm install -g tsc

# Build shared packages
WORKDIR /workspace/packages/constants
RUN npm install && npm run build

WORKDIR /workspace/packages/logger
RUN npm install && npm run build

WORKDIR /workspace/packages/redis-client
RUN npm install && npm run build

WORKDIR /workspace/packages/kafka-client
RUN npm install && npm run build

# Prepare api-gateway
WORKDIR /workspace
COPY services/api-gateway/package*.json ./services/api-gateway/

WORKDIR /workspace/services/api-gateway
RUN npm install

COPY services/api-gateway/src ./src
COPY services/api-gateway/tsconfig.json ./
RUN npm run build

# Final stage
FROM node:22-alpine

WORKDIR /workspace/services/api-gateway

COPY --from=builder /workspace/packages /workspace/packages
COPY --from=builder /workspace/services/api-gateway/dist ./dist
COPY --from=builder /workspace/services/api-gateway/package*.json ./

ENV NODE_ENV=production
RUN npm ci

EXPOSE 3000
CMD ["node", "dist/app.js"]
