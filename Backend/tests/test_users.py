import pytest
from app import create_app
from config import TestConfig
from db.db_connection import get_db

@pytest.fixture
def client():
    app = create_app(TestConfig)
    app.config['TESTING'] = True
    with app.test_client() as client:
        yield client

@pytest.fixture(autouse=True)
def clean_db():
    from app import create_app
    from config import TestConfig
    from db.db_connection import get_db

    app = create_app(TestConfig)

    with app.app_context():  # <<< ensures g is available
        db = get_db()
        cursor = db.cursor()
        cursor.execute("SET FOREIGN_KEY_CHECKS=0;")
        cursor.execute("TRUNCATE TABLE users")
        cursor.execute("SET FOREIGN_KEY_CHECKS=1;")
        db.commit()

def test_register_and_login(client):
    # --- Positive tests ---
    # Register
    rv = client.post("/api/users/register", json={
        "username": "alice",
        "password": "1234"
    })
    assert rv.status_code == 201
    user_id = rv.get_json()["user_id"]

    # Login
    rv = client.post("/api/users/login", json={
        "username": "alice",
        "password": "1234"
    })
    assert rv.status_code == 200
    data = rv.get_json()
    assert "access_token" in data

    token = data["access_token"]

    # /me with valid token
    rv = client.get("/api/users/me", headers={
        "Authorization": f"Bearer {token}"
    })
    assert rv.status_code == 200
    profile = rv.get_json()
    assert profile["username"] == "alice"

    # --- Negative tests ---
    # Register with existing username
    rv = client.post("/api/users/register", json={
        "username": "alice",
        "password": "1234"
    })
    assert rv.status_code == 409

    # Login with wrong password
    rv = client.post("/api/users/login", json={
        "username": "alice",
        "password": "wrongpass"
    })
    assert rv.status_code == 401

    # Login with nonexistent username
    rv = client.post("/api/users/login", json={
        "username": "bob",
        "password": "1234"
    })
    assert rv.status_code == 401

    # /me without token
    rv = client.get("/api/users/me")
    assert rv.status_code == 401

    # /me with invalid token
    rv = client.get("/api/users/me", headers={
        "Authorization": "Bearer invalidtoken123"
    })
    assert rv.status_code == 422
