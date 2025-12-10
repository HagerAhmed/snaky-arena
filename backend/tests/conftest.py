import pytest
from fastapi.testclient import TestClient
from app.main import app

@pytest.fixture
def client():
    return TestClient(app)

@pytest.fixture
def test_user_token(client):
    # Signup a test user
    user_data = {
        "username": "TestUser",
        "email": "test@example.com",
        "password": "testpassword"
    }
    response = client.post("/auth/signup", json=user_data)
    # If already exists (re-run tests), try login
    if response.status_code == 400:
        login_data = {
            "email": "test@example.com",
            "password": "testpassword"
        }
        response = client.post("/auth/login", json=login_data)
        
    return response.json()["token"]
