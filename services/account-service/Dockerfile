# Builder image
FROM node:22-alpine AS builder

WORKDIR /workspace

COPY packages ./packages
RUN npm install -g tsc

WORKDIR /workspace/packages/constants
RUN npm install && npm run build

WORKDIR /workspace/packages/logger
RUN npm install && npm run build

WORKDIR /workspace/packages/kafka-client
RUN npm install && npm run build

WORKDIR /workspace/packages/redis-client
RUN npm install && npm run build

# Setup account-service
WORKDIR /workspace
COPY services/account-service ./services/account-service

WORKDIR /workspace/services/account-service
RUN npm install && npm run build

# Final image
FROM node:22-alpine

WORKDIR /workspace/services/account-service

COPY --from=builder /workspace/packages /workspace/packages
COPY --from=builder /workspace/services/account-service/dist ./dist
COPY --from=builder /workspace/services/account-service/package*.json ./
COPY --from=builder /workspace/services/account-service/tsconfig.json ./

# You can use either:
RUN npm ci || npm install --omit=dev

EXPOSE 3002

CMD ["node", "dist/app.js"]
