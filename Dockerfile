# ── Build stage ──────────────────────────────────────────────
FROM node:20-alpine AS build
WORKDIR /app

COPY frontend/package.json frontend/package-lock.json ./frontend/
RUN npm ci --prefix frontend --no-audit --no-fund

COPY backend/package.json backend/package-lock.json ./backend/
RUN npm ci --prefix backend --no-audit --no-fund --omit=dev || npm ci --prefix backend --no-audit --no-fund

COPY . .
RUN npm run build --prefix frontend

# ── Runtime stage ────────────────────────────────────────────
FROM node:20-alpine
WORKDIR /app
ENV NODE_ENV=production

COPY --from=build /app/backend/node_modules ./backend/node_modules
COPY --from=build /app/backend/src ./backend/src
COPY --from=build /app/backend/package.json ./backend/
COPY --from=build /app/frontend/dist ./frontend/dist

EXPOSE 5001
WORKDIR /app/backend
CMD ["node", "src/server.js"]
