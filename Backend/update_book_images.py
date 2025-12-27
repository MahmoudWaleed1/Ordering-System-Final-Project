"""
Script to update book images in the database with images from the frontend public folder
"""
from app import create_app
from db.db_connection import get_db

# Image mapping - mapping ISBN to image filename
IMAGE_MAPPING = {
    '978-0131103627': 'OIP.jpg',  # The C Programming Language
    '978-0596007126': 'OIP (1).jpg',  # Head First Design Patterns
    '978-0062316097': 'OIP (2).jpg',  # Sapiens: A Brief History
    '978-0141439518': 'OIP (3).jpg',  # Pride and Prejudice
    '978-3030555555': 'OIP (4).jpg',  # Geography of the World
    '978-5555555555': 'attachment_80004080-e1488217702832.avif',  # Test Trigger Book
}

def update_book_images():
    """Update book images in the database"""
    app = create_app()
    
    with app.app_context():
        try:
            db = get_db()
            cursor = db.cursor()
            
            # Update each book with its corresponding image
            for isbn, image_filename in IMAGE_MAPPING.items():
                # Store as /images/filename to indicate it's in the public folder
                image_path = f"/images/{image_filename}"
                cursor.execute(
                    "UPDATE book SET book_image = %s WHERE ISBN_number = %s",
                    (image_path, isbn)
                )
                print(f"✅ Updated {isbn} with image: {image_path}")
            
            db.commit()
            print("\n✅ All book images updated successfully!")
            
        except Exception as e:
            print(f"❌ Error updating book images: {e}")
            if 'db' in locals():
                db.rollback()

if __name__ == "__main__":
    print("=" * 50)
    print("Updating Book Images")
    print("=" * 50)
    print()
    update_book_images()
    print()
    print("=" * 50)

