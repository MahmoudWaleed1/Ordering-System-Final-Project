from db.db_connection import get_db

def get_user_by_username(username):
    db = get_db()
    cursor = db.cursor(dictionary=True)
    cursor.execute(
        "SELECT username, password_hash, role FROM user WHERE username=%s",
        (username,)
    )
    return cursor.fetchone()

def create_user(username, password_hash, role="Customer", shipping_address=None,
                phone_number=None, email=None, first_name=None, last_name=None):
    db = get_db()
    cursor = db.cursor()
    cursor.execute("""
            INSERT INTO user
            (username, role, shipping_address, phone_number, email, password_hash, first_name, last_name)
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
        """, (username, role, shipping_address, phone_number, email, password_hash, first_name, last_name))
    db.commit()
    return cursor.lastrowid

def get_user_by_username(username):
    db = get_db()
    cursor = db.cursor(dictionary=True)
    cursor.execute(
        "SELECT * FROM user WHERE username=%s",
        (username,)
    )
    return cursor.fetchone()

def update_user_by_username(username, update_data):
    if not update_data:
        return False

    db = get_db()
    cursor = db.cursor()

    set_clause = ", ".join([f"{key}=%s" for key in update_data.keys()])
    values = list(update_data.values())
    values.append(username)

    query = f"UPDATE user SET {set_clause} WHERE username=%s"
    
    cursor.execute(query, values)
    db.commit()
    
    return cursor.rowcount > 0

def create_customer_order(username, credit_card, books):
    db = get_db()
    cursor = db.cursor()

    cursor.execute("INSERT INTO customer_order (credit_card_number, username) VALUES (%s, %s)", (credit_card, username))
    order_id = cursor.lastrowid
    for book in books:
        isbn = book.get("ISBN_number")
        quantity = book.get("quantity")
        cursor.execute("SELECT selling_price FROM book WHERE ISBN_number = %s", (isbn,))
        unit_price = cursor.fetchone()
        cursor.execute("INSERT INTO book_order (order_id, ISBN_number, quantity, unit_price) VALUES (%s, %s, %s)", (order_id, isbn, quantity, unit_price['selling_price']))

    cursor.execute("UPDATE customer_order SET cost = (SELECT SUM(quantity * unit_price) FROM book_order WHERE order_id = %s) WHERE order_id = %s", (order_id, order_id))
    db.commit()
    return order_id


