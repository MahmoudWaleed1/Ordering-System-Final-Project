from db.db_connection import get_db

def get_books_model(limit, offset, search, category, min_price, max_price):
    db = get_db()
    cursor = db.cursor(dictionary=True)

    query = "SELECT * FROM books WHERE 1=1"
    params = []

    if search:
        query += " AND title LIKE %s"
        params.append(f"%{search}%")

    if category:
        query += " AND category = %s"
        params.append(category)

    if min_price:
        query += " AND price >= %s"
        params.append(min_price)

    if max_price:
        query += " AND price <= %s"
        params.append(max_price)

    query += " LIMIT %s OFFSET %s"
    params.extend([limit, offset])

    cursor.execute(query, params)

    return cursor.fetchall()

def get_book_by_id(book_id):
    db = get_db()
    cursor = db.cursor(dictionary=True)
    cursor.execute("SELECT * FROM books WHERE id=%s", (book_id,))
    return cursor.fetchone()