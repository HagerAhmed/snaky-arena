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
app.include_router(auth.router)
app.include_router(leaderboard.router)
app.include_router(live.router)

@app.get("/")
async def root():
    return {"message": "Welcome to Snaky Arena API"}
