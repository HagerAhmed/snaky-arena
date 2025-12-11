def test_get_active_players(client):
    response = client.get("/api/v1/live/players")
    assert response.status_code == 200
    assert isinstance(response.json(), list)

def test_watch_player(client):
    response = client.post("/api/v1/live/watch/some-player-id")
    assert response.status_code == 200
    # Should return False for non-existent player
    assert response.json()["success"] is False
