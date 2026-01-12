# StudyKit Backend

This directory contains the FastAPI backend for StudyKit.

## Requirements

- Python 3.10+
- `uv` (Fast dependency manager)

## Local Development

1.  **Install dependencies**:
    ```bash
    uv sync
    ```

2.  **Run the server**:
    ```bash
    uv run uvicorn app.main:app --reload
    ```
    The API will be available at `http://localhost:8000`.

3.  **Run tests**:
    ```bash
    uv run python -m pytest
    ```

## API Docs

Automated Swagger UI is available at `http://localhost:8000/docs`.

## Deployment

The backend is designed to serve the built frontend static files in production.
See the root `Dockerfile` for single-container deployment instructions.
