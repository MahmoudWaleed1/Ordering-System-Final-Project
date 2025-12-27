from db.db_connection import get_db

def get_books_page(limit, offset):
    db = get_db()
    cursor = db.cursor(dictionary=True)

    query = """
    SELECT DISTINCT B.ISBN_number, B.title, B.publication_year, B.quantity_stock, B.category, B.selling_price, B.book_image, P.name
    FROM book AS B JOIN publisher AS P ON (B.publisher_id = P.publisher_id) WHERE 1=1
    """
    params = []

    query += " LIMIT %s OFFSET %s"
    params.extend([limit, offset])

    cursor.execute(query, params)

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
   