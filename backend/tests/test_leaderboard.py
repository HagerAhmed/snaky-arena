def test_get_leaderboard(client):
    response = client.get("/leaderboard")
    assert response.status_code == 200
    assert isinstance(response.json(), list)

def test_submit_score(client, test_user_token):
    headers = {"Authorization": f"Bearer {test_user_token}"}
    score_data = {
        "score": 100,
        "mode": "walls",
        "duration": 60
    }
    response = client.post("/leaderboard/submit", json=score_data, headers=headers)
    assert response.status_code == 200
    data = response.json()
    assert "rank" in data
    assert "isHighScore" in data
