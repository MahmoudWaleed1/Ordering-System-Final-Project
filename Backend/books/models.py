from db.db_connection import get_db

def get_books_page():
    db = get_db()
    cursor = db.cursor(dictionary=True)

    query = """
    SELECT DISTINCT B.ISBN_number, B.title, B.publication_year, B.quantity_stock, B.category, B.selling_price, B.book_image, P.name
    FROM book AS B JOIN publisher AS P ON (B.publisher_id = P.publisher_id)
    """

    cursor.execute(query)

    books = cursor.fetchall()
    for book in books:
        cursor.execute("SELECT author_name FROM author WHERE ISBN_number = %s", (book['ISBN_number'],))
        authors = cursor.fetchall()
        book["authors"] = [a["author_name"] for a in authors]
    return books

def book_search(isbn, title, category, author, publisher):
    db = get_db()
    cursor = db.cursor(dictionary=True)

    query = """
    SELECT DISTINCT B.ISBN_number, B.title, B.publication_year, B.quantity_stock, B.category, B.selling_price, B.book_image, P.name
    FROM book AS B JOIN author AS A ON (B.ISBN_number = A.ISBN_number) JOIN publisher AS P ON (B.publisher_id = P.publisher_id) WHERE 1=1
    """
    params = []
    
    if isbn:
        query += " AND ISBN_number = %s"
        params.append(isbn)
    if title:
        query += " AND title LIKE %s"
        params.append(f"%{title}%")
    if category:
        query += " AND category = %s"
        params.append(category)
    if author:
        query += " AND author_name LIKE %s"
        params.append(f"%{author}%")
    if publisher:
        query += " AND name LIKE %s"
        params.append(f"%{publisher}%")

    cursor.execute(query, params)
    books= cursor.fetchall()

    for book in books:
        cursor.execute("SELECT author_name FROM author WHERE ISBN_number = %s", (book['ISBN_number'],))
        authors = cursor.fetchall()
        book["authors"] = [a["author_name"] for a in authors]
    return books
   
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
        cursor.execute("INSERT INTO order_item (order_id, ISBN_number, quantity, unit_price) VALUES (%s, %s, %s)", (order_id, isbn, quantity, unit_price['selling_price']))

    cursor.execute("UPDATE customer_order SET cost = (SELECT SUM(quantity * unit_price) FROM order_item WHERE order_id = %s) WHERE order_id = %s", (order_id, order_id))
    db.commit()
    return order_id