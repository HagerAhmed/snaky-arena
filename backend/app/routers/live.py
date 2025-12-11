from fastapi import APIRouter, Depends
from typing import List
from sqlalchemy.orm import Session
from ..models import ActivePlayer, WatchResponse
from ..database import get_db
from ..db import get_db_instance

router = APIRouter(
    prefix="/live",
    tags=["Live"],
)

@router.get("/players", response_model=List[ActivePlayer])
async def get_active_players(session: Session = Depends(get_db)):
    db = get_db_instance(session)
    return db.get_active_players()

@router.post("/watch/{playerId}", response_model=WatchResponse)
async def watch_player(playerId: str, session: Session = Depends(get_db)):
    db = get_db_instance(session)
    success = db.watch_player(playerId)
    return {"success": success}
