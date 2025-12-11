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
    return {"message": "Welcome to Snaky Arena API"}
