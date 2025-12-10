from datetime import datetime
from typing import Optional, List, Literal
from uuid import UUID
from pydantic import BaseModel, EmailStr, Field

class User(BaseModel):
    id: str = Field(..., description="UUID as string")
    username: str
    email: EmailStr
    highScore: int = 0
    gamesPlayed: int = 0
    createdAt: datetime

class UserCreate(BaseModel):
    username: str
    email: EmailStr
    password: str

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class AuthResponse(BaseModel):
    user: User
    token: str

class LeaderboardEntry(BaseModel):
    id: str
    username: str
    score: int
    mode: Literal["pass-through", "walls"]
    date: datetime
    rank: int

class ScoreSubmit(BaseModel):
    score: int
    mode: Literal["pass-through", "walls"]
    duration: int

class ScoreResponse(BaseModel):
    rank: Optional[int]
    isHighScore: bool

class ActivePlayer(BaseModel):
    id: str
    username: str
    currentScore: int
    mode: Literal["pass-through", "walls"]
    isLive: bool
    startedAt: datetime

class WatchResponse(BaseModel):
    success: bool

class Error(BaseModel):
    error: str
