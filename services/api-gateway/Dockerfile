FROM node:22-alpine As builder

# working direct
WORKDIR /workspace

COPY packages ./packages

RUN npm install tsc -g

# build all four packages

WORKDIR /workspace/packages/constants
RUN npm install && npm run build

WORKDIR /workspace/packages/logger
RUN npm install && npm run build

WORKDIR /workspace/packages/redis-client
RUN npm install && npm run build

WORKDIR /workspace/packages/kafka-client
RUN npm install && npm run build

WORKDIR /workspace

COPY services/api-gateway/package*.json ./services/api-gateway/

WORKDIR /workspace/services/api-gateway
RUN npm install 