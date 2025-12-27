from db.db_connection import get_db

def get_all_books():
    db = get_db()
    cursor = db.cursor(dictionary=True)
    
    query = """
    SELECT B.ISBN_number, B.title, B.publication_year, B.quantity_stock, 
           B.category, B.threshold, B.selling_price, B.book_image, 
           P.publisher_id, P.name AS publisher_name
    FROM book AS B 
    LEFT JOIN publisher AS P ON B.publisher_id = P.publisher_id
    ORDER BY B.title
    """
    
    cursor.execute(query)
    books = cursor.fetchall()
    
    for book in books:
        cursor.execute("SELECT author_name FROM author WHERE ISBN_number = %s", (book['ISBN_number'],))
        authors = cursor.fetchall()
        book["authors"] = [a["author_name"] for a in authors]
    
    return books

def get_book_by_isbn(isbn):
    db = get_db()
    cursor = db.cursor(dictionary=True)
    
    query = """
    SELECT B.ISBN_number, B.title, B.publication_year, B.quantity_stock, 
           B.category, B.threshold, B.selling_price, B.book_image, 
           P.publisher_id, P.name AS publisher_name
    FROM book AS B 
    LEFT JOIN publisher AS P ON B.publisher_id = P.publisher_id
    WHERE B.ISBN_number = %s
    """
    
    cursor.execute(query, (isbn,))
    book = cursor.fetchone()
    
    if book:
        cursor.execute("SELECT author_name FROM author WHERE ISBN_number = %s", (isbn,))
        authors = cursor.fetchall()
        book["authors"] = [a["author_name"] for a in authors]
    
    return book

def create_book(isbn, title, publication_year, quantity_stock, category, threshold, 
                selling_price, publisher_id, book_image, authors):
    db = get_db()
    cursor = db.cursor()
    
    try:
        cursor.execute("""
            INSERT INTO book (ISBN_number, title, publication_year, quantity_stock, 
                            category, threshold, selling_price, publisher_id, book_image)
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s)
        """, (isbn, title, publication_year, quantity_stock, category, threshold, 
              selling_price, publisher_id, book_image))
        
        for author in authors:
            cursor.execute("""
                INSERT INTO author (ISBN_number, author_name) VALUES (%s, %s)
            """, (isbn, author))
        
        db.commit()
        return True
    except Exception as e:
        db.rollback()
        raise e

def update_book(isbn, title=None, publication_year=None, quantity_stock=None, 
                category=None, threshold=None, selling_price=None, 
                publisher_id=None, book_image=None, authors=None):
    db = get_db()
    cursor = db.cursor()
    
    updates = []
    params = []
    
    if title is not None:
        updates.append("title = %s")
        params.append(title)
    if publication_year is not None:
        updates.append("publication_year = %s")
        params.append(publication_year)
    if quantity_stock is not None:
        updates.append("quantity_stock = %s")
        params.append(quantity_stock)
    if category is not None:
        updates.append("category = %s")
        params.append(category)
    if threshold is not None:
        updates.append("threshold = %s")
        params.append(threshold)
    if selling_price is not None:
        updates.append("selling_price = %s")
        params.append(selling_price)
    if publisher_id is not None:
        updates.append("publisher_id = %s")
        params.append(publisher_id)
    if book_image is not None:
        updates.append("book_image = %s")
        params.append(book_image)
    
    if updates:
        params.append(isbn)
        query = f"UPDATE book SET {', '.join(updates)} WHERE ISBN_number = %s"
        cursor.execute(query, params)
    
    if authors is not None:
        cursor.execute("DELETE FROM author WHERE ISBN_number = %s", (isbn,))
        for author in authors:
            cursor.execute("INSERT INTO author (ISBN_number, author_name) VALUES (%s, %s)", 
                          (isbn, author))
    
    db.commit()
    return cursor.rowcount > 0

def delete_book(isbn):
    db = get_db()
    cursor = db.cursor()
    
    cursor.execute("DELETE FROM book WHERE ISBN_number = %s", (isbn,))
    db.commit()
    return cursor.rowcount > 0

def get_all_publisher_orders():
    db = get_db()
    cursor = db.cursor(dictionary=True)
    
    query = """
    SELECT po.order_id, po.cost, po.order_date, po.status, po.quantity,
           po.ISBN_number, b.title AS book_title
    FROM publisher_order po
    LEFT JOIN book b ON po.ISBN_number = b.ISBN_number
    ORDER BY po.order_date DESC
    """
    
    cursor.execute(query)
    return cursor.fetchall()

def confirm_publisher_order(order_id):
    db = get_db()
    cursor = db.cursor()
    
    cursor.execute("""
        UPDATE publisher_order 
        SET status = 'Confirmed' 
        WHERE order_id = %s AND status = 'Pending'
    """, (order_id,))
    
    db.commit()
    return cursor.rowcount > 0

def get_all_publishers():
    db = get_db()
    cursor = db.cursor(dictionary=True)
    
    cursor.execute("SELECT publisher_id, name FROM publisher ORDER BY name")
    return cursor.fetchall()

def get_sales_previous_month():
    db = get_db()
    cursor = db.cursor(dictionary=True)
    
    cursor.execute("""
        SELECT SUM(cost) AS total_sales
        FROM customer_order
        WHERE order_date >= DATE_FORMAT(NOW() - INTERVAL 1 MONTH, '%Y-%m-01') 
        AND order_date < DATE_FORMAT(NOW(), '%Y-%m-01')
    """)
    return cursor.fetchone()

def get_sales_by_date(target_date):
    db = get_db()
    cursor = db.cursor(dictionary=True)
    
    cursor.execute("""
        SELECT SUM(cost) AS total_sales
        FROM customer_order
        WHERE DATE(order_date) = %s
    """, (target_date,))
    return cursor.fetchone()

def get_top_5_customers():
    db = get_db()
    cursor = db.cursor(dictionary=True)
    
    cursor.execute("""
        SELECT first_name, last_name, SUM(cost) AS total_purchase_amount   
        FROM customer_order NATURAL JOIN user        
        WHERE customer_order.order_date >= (CURRENT_DATE - INTERVAL 3 MONTH)        
        GROUP BY customer_order.username      
        ORDER BY total_purchase_amount DESC        
        LIMIT 5
    """)
    return cursor.fetchall()

def get_top_10_selling_books():
    db = get_db()
    cursor = db.cursor(dictionary=True)
    
    cursor.execute("""
        SELECT title, SUM(item_quantity) AS total_number_of_copies_sold
        FROM book_order NATURAL JOIN book NATURAL JOIN customer_order
        WHERE customer_order.order_date >= (CURRENT_DATE - INTERVAL 3 MONTH)
        GROUP BY title
        ORDER BY total_number_of_copies_sold DESC
        LIMIT 10
    """)
    return cursor.fetchall()

def get_replenishment_history(isbn):
    db = get_db()
    cursor = db.cursor(dictionary=True)
    
    cursor.execute("""
        SELECT COUNT(order_id) AS number_of_replenishments
        FROM publisher_order
        WHERE ISBN_number = %s
    """, (isbn,))
    return cursor.fetchone()

def get_all_customer_orders():
    db = get_db()
    cursor = db.cursor(dictionary=True)
    
    # First get all orders
    cursor.execute("""
        SELECT co.order_id, co.order_date, co.cost AS total_cost,
               co.username, u.first_name, u.last_name
        FROM customer_order co
        LEFT JOIN user u ON co.username = u.username
        ORDER BY co.order_date DESC
    """)
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

