from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .routers import auth, leaderboard, live

app = FastAPI(
    title="Snaky Arena API",
    description="Backend API for the Snaky Arena multiplayer snake game.",
    version="1.0.0",
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
