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

def get_user_orders(username, status=None, start_date=None, end_date=None):
    db = get_db()
    cursor = db.cursor(dictionary=True)
    
    # Build query with optional filters
    query = """
        SELECT co.order_id, co.order_date, co.cost AS total_cost
        FROM customer_order co
        WHERE co.username = %s
    """
    params = [username]
    
    # Note: status filter would require adding a status column to customer_order table
    # For now, we'll skip it as it's not in the schema
    
    if start_date:
        query += " AND DATE(co.order_date) >= %s"
        params.append(start_date)
    
    if end_date:
        query += " AND DATE(co.order_date) <= %s"
        params.append(end_date)
    
    query += " ORDER BY co.order_date DESC"
    
    cursor.execute(query, params)
    orders = cursor.fetchall()
    
    # Then get books for each order
    for order in orders:
        cursor.execute("""
            SELECT bo.ISBN_number, b.title, bo.item_quantity, bo.unit_price
            FROM book_order bo
            JOIN book b ON bo.ISBN_number = b.ISBN_number
            WHERE bo.order_id = %s
        """, (order['order_id'],))
        books = cursor.fetchall()
        order['books'] = books
    
    return orders


