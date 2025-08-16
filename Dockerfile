# --- Stage 1: Build frontend ---
FROM node:22.17.1-alpine AS frontend-build

WORKDIR /app/frontend
COPY src/frontend/package*.json ./
RUN npm install
COPY src/frontend/ .
RUN npm run build


# --- Stage 2: Backend ---
FROM node:22.17.1-alpine AS backend

WORKDIR /app/backend
COPY src/backend/package*.json ./
RUN npm install --production
COPY src/backend/ .

# Copy built frontend into backend's public folder
COPY --from=frontend-build /app/frontend/dist ./public

EXPOSE 3000
CMD ["npm", "start"]
