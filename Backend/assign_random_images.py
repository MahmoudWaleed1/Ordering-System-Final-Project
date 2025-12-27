"""
Script to randomly assign images to books from the public/images folder
"""
import random
from app import create_app
from db.db_connection import get_db

# Available images in the public/images folder
AVAILABLE_IMAGES = [
    'OIP.jpg',
    'OIP (1).jpg',
    'OIP (2).jpg',
    'OIP (3).jpg',
    'OIP (4).jpg',
    'attachment_80004080-e1488217702832.avif'
]

def assign_random_images():
    """Randomly assign images to all books in the database"""
    app = create_app()
    
    with app.app_context():
        try:
            db = get_db()
            cursor = db.cursor(dictionary=True)
            
            # Get all books
            cursor.execute("SELECT ISBN_number, title FROM book")
            books = cursor.fetchall()
            
            if not books:
                print("❌ No books found in the database")
                return
            
            print(f"📚 Found {len(books)} books to update")
            print("🎲 Assigning random images...\n")
            
            # Shuffle images for random assignment
            random.shuffle(AVAILABLE_IMAGES)
            
            # Assign images to books
            for i, book in enumerate(books):
                # Cycle through images if we have more books than images
                image_filename = AVAILABLE_IMAGES[i % len(AVAILABLE_IMAGES)]
                image_path = f"/images/{image_filename}"
                
                cursor.execute(
                    "UPDATE book SET book_image = %s WHERE ISBN_number = %s",
                    (image_path, book['ISBN_number'])
                )
                print(f"✅ {book['title'][:40]:40s} → {image_filename}")
            
            db.commit()
            print(f"\n🎉 Successfully assigned random images to {len(books)} books!")
            
            # Show results
            print("\n📋 Final assignments:")
            cursor.execute("SELECT ISBN_number, title, book_image FROM book ORDER BY ISBN_number")
            results = cursor.fetchall()
            for book in results:
                print(f"   {book['ISBN_number']} - {book['title']}")
                print(f"      Image: {book['book_image']}\n")
            
        except Exception as e:
            print(f"❌ Error assigning images: {e}")
            import traceback
            traceback.print_exc()
            if 'db' in locals():
                db.rollback()

if __name__ == "__main__":
    print("=" * 60)
    print("Random Image Assignment Script")
    print("=" * 60)
    print()
    assign_random_images()
    print()
    print("=" * 60)

