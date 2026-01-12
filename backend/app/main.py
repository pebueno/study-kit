from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from contextlib import asynccontextmanager
from app.api.endpoints import router as api_router
from app.utils.nlp import init_nlp
import os

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Load NLP models
    init_nlp()
    yield

app = FastAPI(title="StudyKit API", version="1.0.0", lifespan=lifespan)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # For development
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(api_router, prefix="/api")

@app.get("/health")
def health_check():
    return {"status": "ok"}

# Serve static files if directory exists (Production/Docker)
static_dir = os.path.join(os.path.dirname(os.path.dirname(__file__)), "static")
if os.path.exists(static_dir):
    app.mount("/assets", StaticFiles(directory=os.path.join(static_dir, "assets")), name="assets")
    
    # Catch-all for SPA
    @app.get("/{full_path:path}")
    async def serve_spa(full_path: str):
        # Allow API requests to pass through (though they should be caught by route above)
        if full_path.startswith("api/"):
            return {"status": "404", "message": "API endpoint not found"}
            
        file_path = os.path.join(static_dir, full_path)
        if os.path.exists(file_path) and os.path.isfile(file_path):
             return FileResponse(file_path)
             
        # Fallback to index.html
        return FileResponse(os.path.join(static_dir, "index.html"))
