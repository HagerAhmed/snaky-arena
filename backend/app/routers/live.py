from fastapi import APIRouter
from typing import List
from ..models import ActivePlayer, WatchResponse
from ..db import db

router = APIRouter(
    prefix="/live",
    tags=["Live"],
)

@router.get("/players", response_model=List[ActivePlayer])
async def get_active_players():
    return db.get_active_players()

@router.post("/watch/{playerId}", response_model=WatchResponse)
async def watch_player(playerId: str):
    success = db.watch_player(playerId)
    return {"success": success}
