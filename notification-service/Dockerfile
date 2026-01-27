FROM node:18-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN for i in 1 2 3; do npm ci --legacy-peer-deps && break || sleep 5; done || npm install --legacy-peer-deps

COPY . .
RUN npm run build

FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN for i in 1 2 3; do npm ci --only=production --legacy-peer-deps && break || sleep 5; done || npm install --only=production --legacy-peer-deps

COPY --from=builder /app/dist ./dist

EXPOSE 3004

CMD ["node", "dist/main"]
