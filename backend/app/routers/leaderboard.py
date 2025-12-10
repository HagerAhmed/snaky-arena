from fastapi import APIRouter, Depends, HTTPException, Query
from typing import List, Optional, Literal
from ..models import LeaderboardEntry, ScoreSubmit, ScoreResponse, User
from ..db import db
from ..dependencies import get_current_user

router = APIRouter(
    prefix="/leaderboard",
    tags=["Leaderboard"],
)

@router.get("", response_model=List[LeaderboardEntry])
async def get_leaderboard(
    mode: Optional[Literal["pass-through", "walls"]] = None,
    limit: int = 10
):
    return db.get_leaderboard(mode=mode, limit=limit)

@router.post("/submit", response_model=ScoreResponse)
async def submit_score(
    score_data: ScoreSubmit,
    current_user: User = Depends(get_current_user)
):
    result = db.add_score(current_user.id, score_data.score, score_data.mode)
    return result
