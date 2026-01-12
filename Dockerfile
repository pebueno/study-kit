# Stage 1: Build Frontend
FROM node:20-alpine AS frontend-builder
WORKDIR /app/frontend
COPY frontend/package*.json ./
RUN npm install
COPY frontend/ ./
RUN npm run build

# Stage 2: Setup Backend & Serve
FROM python:3.10-slim
WORKDIR /app

# Install uv for fast Python package management
RUN pip install uv

# Copy backend requirements
COPY backend/pyproject.toml backend/uv.lock ./

# Install dependencies into system python (no venv needed for docker)
RUN uv export --format requirements-txt > requirements.txt && \
    pip install -r requirements.txt

# Copy backend code
COPY backend/ ./backend

# Copy built frontend assets to backend static directory
# We'll put them in 'backend/static'
COPY --from=frontend-builder /app/frontend/dist ./backend/static

# Expose port
EXPOSE 8000

# Run the application
CMD ["uvicorn", "backend.app.main:app", "--host", "0.0.0.0", "--port", "8000"]
