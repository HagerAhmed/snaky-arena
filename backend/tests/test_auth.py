def test_signup(client):
    response = client.post(
        "/api/v1/auth/signup",
        json={"username": "NewUser", "email": "new@example.com", "password": "password"}
    )
    assert response.status_code == 201
    data = response.json()
    assert "user" in data
    assert "token" in data
    assert data["user"]["email"] == "new@example.com"

def test_login(client):
    # Ensure user exists (might depend on order, but safe to assume mock db persists in process if not restarted)
    # Better to create fresh user
    client.post(
        "/api/v1/auth/signup",
        json={"username": "LoginUser", "email": "login@example.com", "password": "password"}
    )
    
    response = client.post(
        "/api/v1/auth/login",
        json={"email": "login@example.com", "password": "password"}
    )
    assert response.status_code == 200
    data = response.json()
    assert "token" in data

def test_login_invalid(client):
    response = client.post(
        "/api/v1/auth/login",
        json={"email": "wrong@example.com", "password": "wrong"}
    )
    assert response.status_code == 401

def test_me(client, test_user_token):
    headers = {"Authorization": f"Bearer {test_user_token}"}
    response = client.get("/api/v1/auth/me", headers=headers)
    assert response.status_code == 200
    data = response.json()
    assert data["user"]["email"] == "test@example.com"

def test_me_unauthorized(client):
    response = client.get("/api/v1/auth/me")
    assert response.status_code == 401
