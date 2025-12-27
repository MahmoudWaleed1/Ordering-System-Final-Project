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
        query += " AND B.ISBN_number = %s"
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
    cursor = db.cursor(dictionary=True)

    cursor.execute("INSERT INTO customer_order (credit_card_number, username) VALUES (%s, %s)", (credit_card, username))
    order_id = cursor.lastrowid
    total_cost = 0
    
    for book in books:
        isbn = book.get("ISBN_number")
        quantity = book.get("quantity")
        cursor.execute("SELECT selling_price FROM book WHERE ISBN_number = %s", (isbn,))
        price_result = cursor.fetchone()
        if not price_result:
            raise ValueError(f"Book with ISBN {isbn} not found")
        unit_price = float(price_result['selling_price'])
        cursor.execute("INSERT INTO book_order (order_id, ISBN_number, item_quantity, unit_price) VALUES (%s, %s, %s, %s)", (order_id, isbn, quantity, unit_price))
        total_cost += unit_price * quantity

    cursor.execute("UPDATE customer_order SET cost = %s WHERE order_id = %s", (total_cost, order_id))
    db.commit()
    return order_id