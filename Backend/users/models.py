from db.db_connection import get_db

def get_user_by_username(username):
    db = get_db()
    cursor = db.cursor(dictionary=True)
    cursor.execute(
        "SELECT id, username, password, role FROM users WHERE username=%s",
        (username,)
    )
    return cursor.fetchone()

def create_user(username, password, role="user"):
    db = get_db()
    cursor = db.cursor()
    cursor.execute(
        "INSERT INTO users (username, password, role) VALUES (%s, %s, %s)",
        (username, password, role)
    )
    db.commit()
    return cursor.lastrowid

def get_user_by_id(user_id):
    db = get_db()
    cursor = db.cursor(dictionary=True)
    cursor.execute(
        "SELECT id, username, role FROM users WHERE id = %s",
        (user_id,)
    )
    return cursor.fetchone()
