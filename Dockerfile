# ── Stage 1: Build frontend ──────────────────────────────────
FROM node:20-alpine AS frontend-builder
WORKDIR /frontend
COPY frontend/package*.json ./
RUN npm ci
COPY frontend/ ./
RUN npm run build

# ── Stage 2: Build backend ────────────────────────────────────
FROM node:20-alpine AS backend-builder
WORKDIR /app
COPY backend/package*.json ./
RUN npm ci
COPY backend/ ./
RUN npm run build

# ── Stage 3: Runtime ──────────────────────────────────────────
FROM node:20-alpine
WORKDIR /app

COPY backend/package*.json ./
RUN npm ci --omit=dev

# Backend compiled output
COPY --from=backend-builder /app/dist ./dist

# Frontend static files served by NestJS ServeStaticModule
COPY --from=frontend-builder /frontend/dist ./public

# Sequelize migration files
COPY backend/src/migrations ./src/migrations
COPY backend/src/config     ./src/config
COPY backend/.sequelizerc   ./

COPY backend/docker-entrypoint.sh ./
RUN chmod +x docker-entrypoint.sh

# Single volume: /app/storage/{data,logs,config}
VOLUME ["/app/storage"]

EXPOSE 3000

ENTRYPOINT ["./docker-entrypoint.sh"]
