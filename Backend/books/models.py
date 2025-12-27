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
   
def add_new_book(data):
    db = get_db()
    cursor = db.cursor()

    isbn = data.get("ISBN_number")
    title = data.get("title")
    publication_year = data.get("publication_year")
    quantity_stock = data.get("quantity_stock")
    category = data.get("category")
    selling_price = data.get("selling_price")
    book_image = data.get("book_image")
    publisher_id = data.get("publisher_id")
    threshold = data.get("threshold")
    authors = data.get("authors", [])

    insert_book_query = """
    INSERT INTO book (ISBN_number, title, publication_year, quantity_stock, category, selling_price, book_image, publisher_id, threshold)
    VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s)
    """
    cursor.execute(insert_book_query, (isbn, title, publication_year, quantity_stock, category, selling_price, book_image, publisher_id, threshold))

    for author in authors:
        insert_author_query = "INSERT INTO author (ISBN_number, author_name) VALUES (%s, %s)"
        cursor.execute(insert_author_query, (isbn, author))

    db.commit()

def update_existing_book(data):
    db = get_db()
    cursor = db.cursor()

    isbn = data.get("ISBN_number")
    title = data.get("title")
    publication_year = data.get("publication_year")
    quantity_stock = data.get("quantity_stock")
    category = data.get("category")
    selling_price = data.get("selling_price")
    book_image = data.get("book_image")
    publisher_id = data.get("publisher_id")
    threshold = data.get("threshold")
    authors = data.get("authors")

    set_clauses = []
    params = []
    if title is not None:
        set_clauses.append("title = %s")
        params.append(title)
    if publication_year is not None:
        set_clauses.append("publication_year = %s")
        params.append(publication_year)
    if quantity_stock is not None:
        set_clauses.append("quantity_stock = %s")
        params.append(quantity_stock)
    if category is not None:
        set_clauses.append("category = %s")
        params.append(category)
    if selling_price is not None:
        set_clauses.append("selling_price = %s")
        params.append(selling_price)
    if book_image is not None:
        set_clauses.append("book_image = %s")
        params.append(book_image)
    if publisher_id is not None:
        set_clauses.append("publisher_id = %s")
        params.append(publisher_id)
    if threshold is not None:
        set_clauses.append("threshold = %s")
        params.append(threshold)

    if set_clauses:
        update_query = f"UPDATE book SET {', '.join(set_clauses)} WHERE ISBN_number = %s"
        params.append(isbn)
        cursor.execute(update_query, params)
    if authors is not None:
        cursor.execute("DELETE FROM author WHERE ISBN_number = %s", (isbn,))
        for author in authors:
            insert_author_query = "INSERT INTO author (ISBN_number, author_name) VALUES (%s, %s)"
            cursor.execute(insert_author_query, (isbn, author))
    db.commit()
    