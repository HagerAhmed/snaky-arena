from datetime import datetime, timezone
import uuid
from typing import List, Optional, Dict
from .models import User, UserCreate, LeaderboardEntry, ActivePlayer
from passlib.context import CryptContext

pwd_context = CryptContext(schemes=["pbkdf2_sha256"], deprecated="auto")

class MockDB:
    def __init__(self):
        self.users: Dict[str, dict] = {} # id -> user_dict
        self.users_by_email: Dict[str, str] = {} # email -> id
        self.scores: List[dict] = []
        self.active_players: Dict[str, dict] = {} # id -> player_dict
        
        # Add some dummy data
        self._add_dummy_data()

    def _add_dummy_data(self):
        import random
        from datetime import timedelta
        
        # Helper to create user
        def create_fake_user(username, email, high_score=0):
            uid = str(uuid.uuid4())
            hashed = pwd_context.hash("password123")
            self.users[uid] = {
                "id": uid,
                "username": username,
                "email": email,
                "hashed_password": hashed,
                "highScore": high_score,
                "gamesPlayed": random.randint(10, 200),
                "createdAt": datetime.now(timezone.utc) - timedelta(days=random.randint(1, 30))
            }
            self.users_by_email[email] = uid
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
            
        # 2. Add Leaderboard Scores
        modes = ["pass-through", "walls"]
        for uid in user_ids:
            user = self.users[uid]
            # Add 3-5 scores per user
            for _ in range(random.randint(3, 5)):
                score_val = random.randint(100, user["highScore"] + 100)
                # Ensure we respect the high score logic mostly, but random for history
                mode = random.choice(modes)
                
                entry = {
                    "id": str(uuid.uuid4()),
                    "user_id": uid,
                    "username": user["username"],
                    "score": score_val,
                    "mode": mode,
                    "date": datetime.now(timezone.utc) - timedelta(minutes=random.randint(5, 5000))
                }
                self.scores.append(entry)

        # 3. Add Active Players
        active_names = ["SpeedyS", "GlitchGamer", "NoodleBoi"]
        for name in active_names:
            pid = str(uuid.uuid4())
            self.active_players[pid] = {
                "id": pid,
                "username": name,
                "currentScore": random.randint(10, 500),
                "mode": random.choice(modes),
                "isLive": True,
                "startedAt": datetime.now(timezone.utc) - timedelta(minutes=random.randint(1, 20))
            }

    def create_user(self, user: UserCreate) -> Optional[User]:
        if user.email in self.users_by_email:
            return None
        
        user_id = str(uuid.uuid4())
        hashed_pw = pwd_context.hash(user.password)
        
        new_user = {
            "id": user_id,
            "username": user.username,
            "email": user.email,
            "hashed_password": hashed_pw,
            "highScore": 0,
            "gamesPlayed": 0,
            "createdAt": datetime.now(timezone.utc)
        }
        
        self.users[user_id] = new_user
        self.users_by_email[user.email] = user_id
        
        return User(**{k: v for k, v in new_user.items() if k != "hashed_password"})

    def get_user_by_email(self, email: str) -> Optional[dict]:
        user_id = self.users_by_email.get(email)
        if user_id:
            return self.users[user_id]
        return None

    def get_user_by_id(self, user_id: str) -> Optional[User]:
        user_data = self.users.get(user_id)
        if user_data:
            return User(**{k: v for k, v in user_data.items() if k != "hashed_password"})
        return None

    def verify_password(self, plain_password, hashed_password):
        return pwd_context.verify(plain_password, hashed_password)

    def add_score(self, user_id: str, score: int, mode: str) -> dict:
        user = self.users.get(user_id)
        if not user:
            raise ValueError("User not found")
            
        # Update user stats
        user["gamesPlayed"] += 1
        is_high_score = False
        if score > user["highScore"]:
            user["highScore"] = score
            is_high_score = True
            
        entry = {
            "id": str(uuid.uuid4()),
            "user_id": user_id,
            "username": user["username"],
            "score": score,
            "mode": mode,
            "date": datetime.now(timezone.utc)
        }
        self.scores.append(entry)
        
        # Calculate rank
        sorted_scores = sorted(
            [s for s in self.scores if s["mode"] == mode],
            key=lambda x: x["score"],
            reverse=True
        )
        
        rank = -1
        for i, s in enumerate(sorted_scores):
            if s["id"] == entry["id"]:
                rank = i + 1
                break
                
        return {"rank": rank, "isHighScore": is_high_score}

    def get_leaderboard(self, mode: Optional[str] = None, limit: int = 10) -> List[LeaderboardEntry]:
        filtered_scores = self.scores
        if mode:
            filtered_scores = [s for s in self.scores if s["mode"] == mode]
            
        sorted_scores = sorted(filtered_scores, key=lambda x: x["score"], reverse=True)
        top_scores = sorted_scores[:limit]
        
        result = []
        for i, s in enumerate(top_scores):
            result.append(LeaderboardEntry(
                id=s["id"],
                username=s["username"],
                score=s["score"],
                mode=s["mode"],
                date=s["date"],
                rank=i + 1
            ))
        return result

    def get_active_players(self) -> List[ActivePlayer]:
        return [ActivePlayer(**p) for p in self.active_players.values()]

    # Dummy methods for live functionality
    def watch_player(self, player_id: str) -> bool:
        # In a real app this would probably check if player is live
        return True

db = MockDB()
