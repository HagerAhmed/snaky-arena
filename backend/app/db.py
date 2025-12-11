"""
Database operations layer using SQLAlchemy.
Replaces the mock database with real database queries.
"""
from datetime import datetime, timezone
import uuid
from typing import List, Optional, Dict
from sqlalchemy.orm import Session
from sqlalchemy import desc
from .models import User, UserCreate, LeaderboardEntry, ActivePlayer
from .db_models import UserModel, ScoreModel, ActivePlayerModel
from passlib.context import CryptContext

pwd_context = CryptContext(schemes=["pbkdf2_sha256"], deprecated="auto")

class Database:
    """Database operations using SQLAlchemy"""
    
    def __init__(self, session: Session):
        self.session = session
    
    def create_user(self, user: UserCreate) -> Optional[User]:
        """Create a new user"""
        # Check if user already exists
        existing = self.session.query(UserModel).filter(UserModel.email == user.email).first()
        if existing:
            return None
        
        # Create new user
        hashed_pw = pwd_context.hash(user.password)
        db_user = UserModel(
            id=str(uuid.uuid4()),
            username=user.username,
            email=user.email,
            hashed_password=hashed_pw,
            high_score=0,
            games_played=0,
            created_at=datetime.now(timezone.utc)
        )
        
        self.session.add(db_user)
        self.session.commit()
        self.session.refresh(db_user)
        
        return User(
            id=db_user.id,
            username=db_user.username,
            email=db_user.email,
            highScore=db_user.high_score,
            gamesPlayed=db_user.games_played,
            createdAt=db_user.created_at
        )
    
    def get_user_by_email(self, email: str) -> Optional[dict]:
        """Get user by email (returns dict with hashed_password for auth)"""
        db_user = self.session.query(UserModel).filter(UserModel.email == email).first()
        if not db_user:
            return None
        
        return {
            "id": db_user.id,
            "username": db_user.username,
            "email": db_user.email,
            "hashed_password": db_user.hashed_password,
            "highScore": db_user.high_score,
            "gamesPlayed": db_user.games_played,
            "createdAt": db_user.created_at
        }
    
    def get_user_by_id(self, user_id: str) -> Optional[User]:
        """Get user by ID"""
        db_user = self.session.query(UserModel).filter(UserModel.id == user_id).first()
        if not db_user:
            return None
        
        return User(
            id=db_user.id,
            username=db_user.username,
            email=db_user.email,
            highScore=db_user.high_score,
            gamesPlayed=db_user.games_played,
            createdAt=db_user.created_at
        )
    
    def verify_password(self, plain_password: str, hashed_password: str) -> bool:
        """Verify password against hash"""
        return pwd_context.verify(plain_password, hashed_password)
    
    def add_score(self, user_id: str, score: int, mode: str) -> dict:
        """Add a score for a user and return rank and high score info"""
        # Get user
        db_user = self.session.query(UserModel).filter(UserModel.id == user_id).first()
        if not db_user:
            raise ValueError("User not found")
        
        # Update user stats
        db_user.games_played += 1
        is_high_score = False
        if score > db_user.high_score:
            db_user.high_score = score
            is_high_score = True
        
        # Create score entry
        db_score = ScoreModel(
            id=str(uuid.uuid4()),
            user_id=user_id,
            username=db_user.username,
            score=score,
            mode=mode,
            date=datetime.now(timezone.utc)
        )
        
        self.session.add(db_score)
        self.session.commit()
        
        # Calculate rank - count how many higher scores exist
        higher_scores_count = self.session.query(ScoreModel).filter(
            ScoreModel.mode == mode,
            ScoreModel.score > score
        ).count()
        
        rank = higher_scores_count + 1
        
        return {"rank": rank, "isHighScore": is_high_score}
    
    def get_leaderboard(self, mode: Optional[str] = None, limit: int = 10) -> List[LeaderboardEntry]:
        """Get leaderboard entries"""
        query = self.session.query(ScoreModel)
        
        if mode:
            query = query.filter(ScoreModel.mode == mode)
        
        # Order by score descending, then by date ascending (earlier is better for ties)
        scores = query.order_by(desc(ScoreModel.score), ScoreModel.date).limit(limit).all()
        
        result = []
        for i, db_score in enumerate(scores):
            result.append(LeaderboardEntry(
                id=db_score.id,
                username=db_score.username,
                score=db_score.score,
                mode=db_score.mode,
                date=db_score.date,
                rank=i + 1
            ))
        
        return result
    
    def get_active_players(self) -> List[ActivePlayer]:
        """Get active players"""
        active = self.session.query(ActivePlayerModel).filter(
            ActivePlayerModel.is_live == True
        ).all()
        
        return [ActivePlayer(
            id=p.id,
            username=p.username,
            currentScore=p.current_score,
            mode=p.mode,
            isLive=p.is_live,
            startedAt=p.started_at
        ) for p in active]
    
    def watch_player(self, player_id: str) -> bool:
        """Check if player exists and is live"""
        player = self.session.query(ActivePlayerModel).filter(
            ActivePlayerModel.id == player_id,
            ActivePlayerModel.is_live == True
        ).first()
        return player is not None


def seed_dummy_data(session: Session):
    """Seed the database with dummy data for development"""
    import random
    from datetime import timedelta
    
    # Check if data already exists
    existing_users = session.query(UserModel).count()
    if existing_users > 0:
        return  # Already seeded
    
    # Helper to create user
    def create_fake_user(username, email, high_score=0):
        uid = str(uuid.uuid4())
        hashed = pwd_context.hash("password123")
        user = UserModel(
            id=uid,
            username=username,
            email=email,
            hashed_password=hashed,
            high_score=high_score,
            games_played=random.randint(10, 200),
            created_at=datetime.now(timezone.utc) - timedelta(days=random.randint(1, 30))
        )
        session.add(user)
        return uid
    
    # 1. Create Users
    users_data = [
        ("SnakeMaster", "snake@game.com", 2450),
        ("Pythonista", "py@game.com", 1800),
        ("Viper_X", "viper@game.com", 3200),
        ("Slippery", "slip@game.com", 950),
        ("Anaconda", "ana@game.com", 5000),
    ]
    
    user_ids = []
    for u, e, s in users_data:
        user_ids.append(create_fake_user(u, e, s))
    
    session.commit()
    
    # 2. Add Leaderboard Scores
    modes = ["pass-through", "walls"]
    for uid in user_ids:
        user = session.query(UserModel).filter(UserModel.id == uid).first()
        # Add 3-5 scores per user
        for _ in range(random.randint(3, 5)):
            score_val = random.randint(100, user.high_score + 100)
            mode = random.choice(modes)
            
            score = ScoreModel(
                id=str(uuid.uuid4()),
                user_id=uid,
                username=user.username,
                score=score_val,
                mode=mode,
                date=datetime.now(timezone.utc) - timedelta(minutes=random.randint(5, 5000))
            )
            session.add(score)
    
    # 3. Add Active Players
    active_names = ["SpeedyS", "GlitchGamer", "NoodleBoi"]
    for name in active_names:
        pid = str(uuid.uuid4())
        player = ActivePlayerModel(
            id=pid,
            username=name,
            current_score=random.randint(10, 500),
            mode=random.choice(modes),
            is_live=True,
            started_at=datetime.now(timezone.utc) - timedelta(minutes=random.randint(1, 20))
        )
        session.add(player)
    
    session.commit()


# For backward compatibility, create a global db instance getter
def get_db_instance(session: Session) -> Database:
    """Get a Database instance for a given session"""
    return Database(session)
