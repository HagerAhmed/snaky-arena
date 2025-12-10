def test_get_active_players(client):
    response = client.get("/live/players")
    assert response.status_code == 200
    assert isinstance(response.json(), list)

def test_watch_player(client):
    response = client.post("/live/watch/some-player-id")
    assert response.status_code == 200
    assert response.json()["success"] is True
