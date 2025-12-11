"""
SQLAlchemy ORM models for the database.
These are separate from Pydantic models (in models.py) which are used for API validation.
"""
from datetime import datetime, timezone
from sqlalchemy import Column, String, Integer, DateTime, Boolean, ForeignKey
from sqlalchemy.orm import relationship
from .database import Base
import uuid

class UserModel(Base):
    """User account model"""
    __tablename__ = "users"
    
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    username = Column(String, nullable=False)
    email = Column(String, unique=True, nullable=False, index=True)
    hashed_password = Column(String, nullable=False)
    high_score = Column(Integer, default=0)
    games_played = Column(Integer, default=0)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    
    # Relationship to scores
    scores = relationship("ScoreModel", back_populates="user", cascade="all, delete-orphan")

class ScoreModel(Base):
    """Game score model for leaderboard"""
    __tablename__ = "scores"
    
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String, ForeignKey("users.id"), nullable=False, index=True)
    username = Column(String, nullable=False)  # Denormalized for faster leaderboard queries
    score = Column(Integer, nullable=False)
    mode = Column(String, nullable=False, index=True)  # "pass-through" or "walls"
    date = Column(DateTime, default=lambda: datetime.now(timezone.utc), index=True)
    
    # Relationship to user
    user = relationship("UserModel", back_populates="scores")

class ActivePlayerModel(Base):
    """Active player model for live game tracking"""
    __tablename__ = "active_players"
    
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    username = Column(String, nullable=False)
    current_score = Column(Integer, default=0)
    mode = Column(String, nullable=False)  # "pass-through" or "walls"
    is_live = Column(Boolean, default=True)
    started_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
