from __future__ import annotations

from datetime import date

from fastapi.testclient import TestClient

from app.main import app

client = TestClient(app)


def test_health_endpoint() -> None:
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json() == {"status": "ok"}


def test_list_time_entries_returns_seed_data() -> None:
    response = client.get("/api/time-entries")
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)
    assert len(data) >= 3


def test_create_time_entry() -> None:
    payload = {
        "date": date(2026, 4, 16).isoformat(),
        "personName": "Dana White",
        "teamName": "Engineering",
        "activityDescription": "Write unit tests",
        "durationHours": 2.5,
        "notes": "Coverage for time entry endpoints",
    }
    response = client.post("/api/time-entries", json=payload)
    assert response.status_code == 201
    body = response.json()
    assert body["id"]
    assert body["personName"] == payload["personName"]


def test_filter_time_entries_by_team() -> None:
    response = client.get("/api/time-entries", params={"team": "Engineering"})
    assert response.status_code == 200
    data = response.json()
    assert all(entry["teamName"] == "Engineering" for entry in data)


def test_update_time_entry() -> None:
    list_response = client.get("/api/time-entries")
    entry_id = list_response.json()[0]["id"]

    update_payload = {"activityDescription": "Updated description"}
    response = client.put(f"/api/time-entries/{entry_id}", json=update_payload)
    assert response.status_code == 200
    body = response.json()
    assert body["activityDescription"] == "Updated description"


def test_delete_time_entry() -> None:
    create_payload = {
        "date": date(2026, 4, 16).isoformat(),
        "personName": "Eve Adams",
        "teamName": "Support",
        "activityDescription": "Handle support tickets",
        "durationHours": 1.5,
        "notes": "Morning shift",
    }
    create_response = client.post("/api/time-entries", json=create_payload)
    entry_id = create_response.json()["id"]

    delete_response = client.delete(f"/api/time-entries/{entry_id}")
    assert delete_response.status_code == 204

    get_response = client.get(f"/api/time-entries/{entry_id}")
    assert get_response.status_code == 404


def test_create_time_entry_validation_error() -> None:
    payload = {
        "date": date(2026, 4, 16).isoformat(),
        "personName": " ",
        "teamName": "Engineering",
        "activityDescription": "",
        "durationHours": -1,
    }
    response = client.post("/api/time-entries", json=payload)
    assert response.status_code == 422
