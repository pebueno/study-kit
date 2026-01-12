# Stage 1: Build Frontend
FROM node:20-alpine AS frontend-builder
WORKDIR /app/frontend
COPY frontend/package*.json ./
RUN npm ci && npm cache clean --force
COPY frontend/ ./
RUN npm run build

# Stage 2: Setup Backend & Serve
FROM python:3.10-slim
WORKDIR /app

# Install system dependencies and cleanup in one layer
RUN apt-get update && \
    apt-get install -y --no-install-recommends \
    gcc \
    g++ \
    && rm -rf /var/lib/apt/lists/*

# Install uv for fast Python package management
RUN pip install --no-cache-dir uv

# Copy backend requirements
COPY backend/pyproject.toml backend/uv.lock ./

# Install PyTorch CPU-only version and other dependencies
RUN uv export --no-hashes --format requirements-txt > requirements.txt && \
    # Filter out torch from requirements and install all dependencies with CPU-only torch
    grep -v "^torch" requirements.txt | grep -v "^triton" > requirements_filtered.txt && \
    pip install --no-cache-dir --extra-index-url https://download.pytorch.org/whl/cpu \
        "torch>=2.6.0" \
        -r requirements_filtered.txt && \
    # Remove any nvidia/cuda packages that may have been installed
    pip uninstall -y nvidia-* 2>/dev/null || true && \
    # Download only essential NLTK data
    python -c "import nltk; nltk.download('punkt', quiet=True); nltk.download('stopwords', quiet=True); nltk.download('wordnet', quiet=True); nltk.download('punkt_tab', quiet=True)" && \
    # Download TextBlob corpora
    python -m textblob.download_corpora && \
    # Clean up pip cache and temporary files
    pip cache purge && \
    rm -rf /root/.cache/pip /root/.cache/huggingface requirements.txt requirements_filtered.txt && \
    # Remove nvidia/cuda directories if they exist
    rm -rf /usr/local/lib/python3.10/site-packages/nvidia* && \
    # Remove build dependencies
    apt-get purge -y --auto-remove gcc g++ && \
    rm -rf /var/lib/apt/lists/*

# Copy backend code
COPY backend/ ./backend

# Copy built frontend assets to backend static directory
COPY --from=frontend-builder /app/frontend/dist ./backend/static

# Expose port
EXPOSE 8000

# Run the application
WORKDIR /app/backend
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
