from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from .routers import auth, leaderboard, live
from .database import init_db, SessionLocal
from .db import seed_dummy_data
import os

@asynccontextmanager
async def lifespan(app: FastAPI):
    """Initialize database on startup"""
    #Skip database initialization in test mode
    if not os.getenv("TESTING"):
        # Create tables
        init_db()
        
        # Seed dummy data in development mode (when not using production DATABASE_URL)
        db_url = os.getenv("DATABASE_URL", "sqlite:///./snaky_arena.db")
        if "sqlite" in db_url:
            session = SessionLocal()
            try:
                seed_dummy_data(session)
            finally:
                session.close()
    
    yield
    # Cleanup on shutdown (if needed)

app = FastAPI(
    title="Snaky Arena API",
    description="Backend API for the Snaky Arena multiplayer snake game.",
    version="1.0.0",
    lifespan=lifespan
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, specify exact origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
# Include routers with API prefix
from fastapi import APIRouter
api_router = APIRouter(prefix="/api/v1")
api_router.include_router(auth.router)
api_router.include_router(leaderboard.router)
api_router.include_router(live.router)

app.include_router(api_router)

@app.get("/")
async def root():
    if os.path.exists("static/index.html"):
        return FileResponse("static/index.html")
    return {"message": "Welcome to Snaky Arena API"}

# Mount the static directory
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse

# Verify if static directory exists (it will in Docker)
if os.path.exists("static"):
    app.mount("/static", StaticFiles(directory="static"), name="static")

    # Catch-all route for SPA (React Router)
    @app.get("/{full_path:path}")
    async def serve_spa(full_path: str):
        # Allow API requests to pass through (if not matched by api_router)
        if full_path.startswith("api"):
            from fastapi import HTTPException
            raise HTTPException(status_code=404, detail="Not Found")

        # Explicitly serve docs if hidden by catch-all
        if full_path == "docs":
            from fastapi.openapi.docs import get_swagger_ui_html
            return get_swagger_ui_html(openapi_url="/openapi.json", title="Snaky Arena API")

        if full_path == "openapi.json":
            from fastapi.responses import JSONResponse
            return JSONResponse(app.openapi())
        
        # Check if file exists in static folder (e.g. assets/index.css)
        file_path = os.path.join("static", full_path)
        if os.path.exists(file_path):
            return FileResponse(file_path)
            
        # Fallback to index.html
        return FileResponse("static/index.html")
