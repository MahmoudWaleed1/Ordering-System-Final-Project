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

def test_update_profile(client):
    # --- Setup: Register & Login User A (Alice) ---
    client.post("/api/users/register", json={
        "username": "alice",
        "password": "password123",
        "email": "alice@example.com",
        "first_name": "Alice",
        "last_name": "Smith",
        "role": "Customer",
        "shipping_address": "Old Address",
        "phone_number": "1111111111"
    })

    login_resp = client.post("/api/users/login", json={
        "username": "alice",
        "password": "password123"
    })
    token = login_resp.get_json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    # --- Positive Test: Update Address & Phone ---
    rv = client.put("/api/users/profile", headers=headers, json={
        "shipping_address": "New Address 123",
        "phone_number": "9999999999"
    })
    assert rv.status_code == HTTP_200_OK
    assert rv.get_json()["msg"] == "Profile updated successfully"

    # Verify update with /me
    me_resp = client.get("/api/users/me", headers=headers)
    profile = me_resp.get_json()
    assert profile["shipping_address"] == "New Address 123"
    assert profile["phone_number"] == "9999999999"
    assert profile["email"] == "alice@example.com"  # Should remain unchanged

    # --- Negative Test: Duplicate Email ---
    # 1. Register User B (Bob)
    client.post("/api/users/register", json={
        "username": "bob",
        "password": "password123",
        "email": "bob@example.com",
        "first_name": "Bob",
        "last_name": "Jones"
    })

    # 2. Try to update Alice's email to Bob's email
    rv = client.put("/api/users/profile", headers=headers, json={
        "email": "bob@example.com"
    })
    assert rv.status_code == HTTP_409_CONFLICT
    assert "taken" in rv.get_json()["msg"]

    # --- Negative Test: Update Password ---
    # Update password
    rv = client.put("/api/users/profile", headers=headers, json={
        "password": "newpassword456"
    })
    assert rv.status_code == HTTP_200_OK

    # Verify login with old password fails
    rv = client.post("/api/users/login", json={
        "username": "alice",
        "password": "password123"
    })
    assert rv.status_code == HTTP_401_UNAUTHORIZED

    # Verify login with new password succeeds
    rv = client.post("/api/users/login", json={
        "username": "alice",
        "password": "newpassword456"
    })
    assert rv.status_code == HTTP_200_OK

    # --- Negative Test: No Token ---
    rv = client.put("/api/users/profile", json={"shipping_address": "Hacker St"})
    assert rv.status_code == HTTP_401_UNAUTHORIZED
