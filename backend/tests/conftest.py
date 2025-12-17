import pytest
import os
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

# Set testing flag BEFORE importing app
os.environ["TESTING"] = "1"


from app.main import app
from app.database import Base, get_db

# Import models to register them with Base BEFORE creating tables
from app.db_models import UserModel, ScoreModel, ActivePlayerModel

# Create test database engine (in-memory SQLite with special pooling)
# StaticPool ensures the same connection is reused across requests
TEST_DATABASE_URL = os.getenv("TEST_DATABASE_URL", "sqlite:///:memory:")

connect_args = {}
pool_class = None

if "sqlite" in TEST_DATABASE_URL:
    connect_args = {"check_same_thread": False}
    pool_class = StaticPool

engine_args = {
    "connect_args": connect_args,
}
if pool_class:
    engine_args["poolclass"] = pool_class

engine = create_engine(
    TEST_DATABASE_URL, 
    **engine_args
)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Create tables once when module loads
Base.metadata.create_all(bind=engine)

@pytest.fixture(scope="function")
def db_session():
    """Create a fresh session for each test and clean data"""
    connection = engine.connect()
    transaction = connection.begin()
    session = TestingSessionLocal(bind=connection)
    
    yield session
    
    session.close()
    transaction.rollback()
    connection.close()

@pytest.fixture(scope="function")
def client(db_session):
    """Get test client with overridden database dependency"""
    def override_get_db():
        try:
            yield db_session
        finally:
            pass
    
    app.dependency_overrides[get_db] = override_get_db
    yield TestClient(app)
    app.dependency_overrides.clear()

@pytest.fixture
def test_user_token(client):
    # Signup a test user
    user_data = {
        "username": "TestUser",
        "email": "test@example.com",
        "password": "testpassword"
    }
    response = client.post("/api/v1/auth/signup", json=user_data)
    # If already exists (re-run tests), try login
    if response.status_code == 400:
        login_data = {
            "email": "test@example.com",
            "password": "testpassword"
        }
        response = client.post("/api/v1/auth/login", json=login_data)
        
    return response.json()["token"]
