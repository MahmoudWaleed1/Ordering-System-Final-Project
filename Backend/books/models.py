from db.db_connection import get_db

def normalize_image_path(img_path):
    """
    Normalize image path to detect external URLs and local paths correctly.
    Handles various formats of image paths.
    """
    if not img_path:
        return None
    
    # If already a full URL, return as-is
    if img_path.startswith('http://') or img_path.startswith('https://'):
        return img_path
    
    # If starts with //, it's a protocol-relative URL - add https
    if img_path.startswith('//'):
        return f"https:{img_path}"
    
    # Check for common domain patterns (likely missing protocol)
    external_domains = [
        'up.yimg.com',
        'tse1.mm.bing.net',
        'tse2.mm.bing.net', 
        'tse3.mm.bing.net',
        'tse4.mm.bing.net',
        'cdn.pixabay.com',
    ]
    
    for domain in external_domains:
        if domain in img_path:
            # This looks like an external URL without protocol
            if img_path.startswith('/'):
                # Remove leading slash and add protocol
                return f"https:{img_path}"
            else:
                return f"https://{img_path}"
    
    # If it starts with /images/, use as-is (from public folder)
    if img_path.startswith('/images/'):
        return img_path
    
    # Otherwise, treat as local path - prepend /images/
    if img_path.startswith('/'):
        return img_path
    else:
        return f"/images/{img_path}"

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
        img_path = book['book_image']
        book["book_image"] = normalize_image_path(img_path)

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
        query += " AND A.author_name LIKE %s"
        params.append(f"%{author}%")
    if publisher:
        query += " AND name LIKE %s"
        params.append(f"%{publisher}%")

    cursor.execute(query, params)
    books= cursor.fetchall()

    for book in books:
        img_path = book['book_image']
        book["book_image"] = normalize_image_path(img_path)
        cursor.execute("SELECT author_name FROM author WHERE ISBN_number = %s", (book['ISBN_number'],))
        authors = cursor.fetchall()
        book["authors"] = [a["author_name"] for a in authors]
    return books
   
def get_book_details(isbn):
    """Get detailed information about a single book by ISBN"""
    db = get_db()
    cursor = db.cursor(dictionary=True)
    
    query = """
    SELECT DISTINCT B.ISBN_number, B.title, B.publication_year, B.quantity_stock, 
           B.category, B.threshold, B.selling_price, B.book_image, P.name AS publisher_name, P.publisher_id
    FROM book AS B 
    LEFT JOIN publisher AS P ON (B.publisher_id = P.publisher_id)
    WHERE B.ISBN_number = %s
    """
    
    cursor.execute(query, (isbn,))
    book = cursor.fetchone()
    
    if book:
        if book['book_image']:
            img_path = book['book_image']
            book["book_image"] = normalize_image_path(img_path)
        cursor.execute("SELECT author_name FROM author WHERE ISBN_number = %s", (isbn,))
        authors = cursor.fetchall()
        book["authors"] = [a["author_name"] for a in authors]
    
    return book

def create_customer_order(username, credit_card, books, expiration_date=None):
    db = get_db()
    cursor = db.cursor(dictionary=True)

    # Validate credit card exists and check expiration
    cursor.execute("""
        SELECT expiration_date FROM credit_card WHERE credit_card_number = %s
    """, (credit_card,))
    card_info = cursor.fetchone()
    
    if not card_info:
        # Create credit card entry if it doesn't exist
        if not expiration_date:
            raise ValueError("Credit card not found. Please provide expiration date.")
        # Parse expiration date (format: YYYY-MM)
        from datetime import datetime
        try:
            exp_date = datetime.strptime(expiration_date + "-01", '%Y-%m-%d').date()
        except ValueError:
            raise ValueError("Invalid expiration date format. Use YYYY-MM")
        cursor.execute("""
            INSERT INTO credit_card (credit_card_number, expiration_date) 
            VALUES (%s, %s)
        """, (credit_card, exp_date))
    else:
        # Check if card is expired
        from datetime import datetime
        exp_date = card_info['expiration_date']
        if isinstance(exp_date, str):
            exp_date = datetime.strptime(exp_date, '%Y-%m-%d').date()
        elif hasattr(exp_date, 'date'):
            exp_date = exp_date.date()
        if exp_date < datetime.now().date():
            raise ValueError("Credit card has expired")

    cursor.execute("INSERT INTO customer_order (credit_card_number, username) VALUES (%s, %s)", (credit_card, username))
    order_id = cursor.lastrowid
    total_cost = 0
    
    for book in books:
        isbn = book.get("ISBN_number")
        quantity = book.get("quantity")
        cursor.execute("SELECT selling_price, quantity_stock FROM book WHERE ISBN_number = %s", (isbn,))
        price_result = cursor.fetchone()
        if not price_result:
            raise ValueError(f"Book with ISBN {isbn} not found")
        if price_result['quantity_stock'] < quantity:
            raise ValueError(f"Insufficient stock for book {isbn}")
        unit_price = float(price_result['selling_price'])
        cursor.execute("INSERT INTO book_order (order_id, ISBN_number, item_quantity, unit_price) VALUES (%s, %s, %s, %s)", (order_id, isbn, quantity, unit_price))
        # Update stock
        cursor.execute("UPDATE book SET quantity_stock = quantity_stock - %s WHERE ISBN_number = %s", (quantity, isbn))
        total_cost += unit_price * quantity

    cursor.execute("UPDATE customer_order SET cost = %s WHERE order_id = %s", (total_cost, order_id))
    db.commit()
    return order_id