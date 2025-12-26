import pytest
from app import create_app
from config import TestConfig
from db.db_connection import get_db
from config import *

@pytest.fixture
def client():
    app = create_app(TestConfig)
    app.config['TESTING'] = True
    with app.test_client() as client:
        yield client

@pytest.fixture(autouse=True)
def clean_db():
    app = create_app(TestConfig)
    with app.app_context():
        db = get_db()
        cursor = db.cursor()
        cursor.execute("SET FOREIGN_KEY_CHECKS=0;")
        cursor.execute("TRUNCATE TABLE user")  # Updated table name
        cursor.execute("SET FOREIGN_KEY_CHECKS=1;")
        db.commit()

def test_register_and_login(client):
    # --- Positive tests ---
    # Register
    rv = client.post("/api/users/register", json={
        "username": "alice",
        "password": "1234",
        "email": "alice@example.com",
        "first_name": "Alice",
        "last_name": "Smith",
        "role": "Customer",
        "shipping_address": "123 Main St",
        "phone_number": "0123456789"
    })
    assert rv.status_code == HTTP_201_CREATED
    user_id = rv.get_json()["user_id"]

    # Login
    rv = client.post("/api/users/login", json={
        "username": "alice",
        "password": "1234"
    })
    assert rv.status_code == HTTP_200_OK
    data = rv.get_json()
    assert "access_token" in data

    token = data["access_token"]

    # /me with valid token
    rv = client.get("/api/users/me", headers={
        "Authorization": f"Bearer {token}"
    })
    assert rv.status_code == HTTP_200_OK
    profile = rv.get_json()
    assert profile["username"] == "alice"
    assert profile["email"] == "alice@example.com"

    # --- Negative tests ---
    # Register with existing username
    rv = client.post("/api/users/register", json={
        "username": "alice",
        "password": "1234",
        "email": "alice@example.com",
        "first_name": "Alice",
        "last_name": "Smith"
    })
    assert rv.status_code == HTTP_409_CONFLICT

    # Login with wrong password
    rv = client.post("/api/users/login", json={
        "username": "alice",
        "password": "wrongpass"
    })
    assert rv.status_code == HTTP_401_UNAUTHORIZED

    # Login with nonexistent username
    rv = client.post("/api/users/login", json={
        "username": "bob",
        "password": "1234"
    })
    assert rv.status_code == HTTP_401_UNAUTHORIZED

    # /me without token
    rv = client.get("/api/users/me")
    assert rv.status_code == HTTP_401_UNAUTHORIZED

    # /me with invalid token
    rv = client.get("/api/users/me", headers={
        "Authorization": "Bearer invalidtoken123"
    })
    assert rv.status_code == HTTP_422_INVALID_TOKEN
