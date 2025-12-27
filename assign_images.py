"""
Simple script to assign images to books - connects directly to MySQL
"""
import mysql.connector
import random
import os

# Database configuration (update these if needed)
DB_CONFIG = {
    'host': 'localhost',
    'user': 'root',
    'password': '',  # Update if you have a password
    'database': 'Book_Order_Processing_System'
}

# Available images
AVAILABLE_IMAGES = [
    'OIP.jpg',
    'OIP (1).jpg',
    'OIP (2).jpg',
    'OIP (3).jpg',
    'OIP (4).jpg',
    'attachment_80004080-e1488217702832.avif'
]

def assign_images():
    try:
        # Connect to database
        print("Connecting to database...")
        conn = mysql.connector.connect(**DB_CONFIG)
        cursor = conn.cursor(dictionary=True)
        
        # Get all books
        cursor.execute("SELECT ISBN_number, title FROM book")
        books = cursor.fetchall()
        
        if not books:
            print("ERROR: No books found in the database")
            return
        
        print(f"Found {len(books)} books to update\n")
        
        # Shuffle images for random assignment
        random.shuffle(AVAILABLE_IMAGES)
        
        # Assign images to books
        for i, book in enumerate(books):
            image_filename = AVAILABLE_IMAGES[i % len(AVAILABLE_IMAGES)]
            image_path = f"/images/{image_filename}"
            
            cursor.execute(
                "UPDATE book SET book_image = %s WHERE ISBN_number = %s",
                (image_path, book['ISBN_number'])
            )
            print(f"OK - {book['title'][:45]:45s} -> {image_filename}")
        
        conn.commit()
        print(f"\nSuccessfully assigned images to {len(books)} books!")
        
        # Show results
        print("\nFinal assignments:")
        cursor.execute("SELECT ISBN_number, title, book_image FROM book ORDER BY ISBN_number")
        results = cursor.fetchall()
        for book in results:
            print(f"   {book['ISBN_number']} - {book['title']}")
            print(f"      Image: {book['book_image']}\n")
        
        cursor.close()
        conn.close()
        
    except mysql.connector.Error as e:
        print(f"Database error: {e}")
    except Exception as e:
        print(f"Error: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    print("=" * 60)
    print("Assigning Images to Books")
    print("=" * 60)
    print()
    assign_images()
    print()
    print("=" * 60)

