from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_auth_flow_reproduction():
    # 1. Signup a new user
    new_user = {
        "username": "ReproUser",
        "email": "repro@game.com",
        "password": "password123"
    }
    
    response = client.post("/auth/signup", json=new_user)
    assert response.status_code == 201, f"Signup failed: {response.text}"
    data = response.json()
    assert "token" in data
    assert "user" in data
    assert data["user"]["email"] == new_user["email"]

    # 2. Login with the new user
    login_data = {
        "email": "repro@game.com",
        "password": "password123"
    }
    response = client.post("/auth/login", json=login_data)
    assert response.status_code == 200, f"Login failed: {response.text}"
    data = response.json()
    assert "token" in data
    assert "user" in data

    # 3. Duplicate Signup (Should fail)
    response = client.post("/auth/signup", json=new_user)
    assert response.status_code == 400
    data = response.json()
    # Check if the error format matches what frontend expects (data.error or data.detail)
    print(f"\nDuplicate Signup Response: {data}")
    assert "error" in data or "detail" in data

    # 4. Invalid Login
    invalid_login = {
        "email": "repro@game.com",
        "password": "wrongpassword"
    }
    response = client.post("/auth/login", json=invalid_login)
    assert response.status_code == 401
    data = response.json()
    print(f"\nInvalid Login Response: {data}")
    assert "error" in data or "detail" in data
