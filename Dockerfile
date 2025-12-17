# Stage 1: Build Frontend
FROM node:20-slim AS frontend-builder

WORKDIR /frontend

# Copy frontend dependency files
COPY frontend/package.json frontend/package-lock.json ./

# Install dependencies
RUN npm ci

# Copy frontend source code
COPY frontend/ .

# Build the frontend
RUN npm run build

# Stage 2: Backend Runtime
FROM python:3.12-slim

# Install uv
COPY --from=ghcr.io/astral-sh/uv:latest /uv /bin/uv

WORKDIR /app

# Copy backend dependency files
COPY backend/pyproject.toml backend/uv.lock ./

# Install backend dependencies
RUN uv sync --frozen --no-dev

# Copy backend source code
COPY backend/ .

# Copy built frontend assets from Stage 1
COPY --from=frontend-builder /frontend/dist /app/static

# Run the application
CMD ["uv", "run", "uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
