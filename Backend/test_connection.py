"""
Test script to verify database connection and basic functionality
Run this to check if everything is properly connected
"""

from app import create_app
from db.db_connection import get_db

def test_database_connection():
    """Test if database connection works"""
    app = create_app()
    
    with app.app_context():
        try:
            db = get_db()
            cursor = db.cursor()
            cursor.execute("SELECT DATABASE()")
            db_name = cursor.fetchone()
            print(f"✅ Database connection successful!")
            print(f"   Connected to: {db_name[0]}")
            
            # Test if tables exist
            cursor.execute("SHOW TABLES")
            tables = cursor.fetchall()
            print(f"✅ Found {len(tables)} tables:")
            for table in tables:
                print(f"   - {table[0]}")
            
            # Test user table
            cursor.execute("SELECT COUNT(*) FROM user")
            user_count = cursor.fetchone()
            print(f"✅ User table has {user_count[0]} records")
            
            # Test book table
            cursor.execute("SELECT COUNT(*) FROM book")
            book_count = cursor.fetchone()
            print(f"✅ Book table has {book_count[0]} records")
            
            print("\n✅ All database tests passed!")
            return True
            
        except Exception as e:
            print(f"❌ Database connection failed: {e}")
            return False

def test_app_creation():
    """Test if Flask app can be created"""
    try:
        app = create_app()
        print("✅ Flask app created successfully")
        print(f"   Blueprints registered: {len(app.blueprints)}")
        for name in app.blueprints.keys():
            print(f"   - {name}")
        return True
    except Exception as e:
        print(f"❌ Flask app creation failed: {e}")
        return False

if __name__ == "__main__":
    print("=" * 50)
    print("Testing Backend Connection")
    print("=" * 50)
    print()
    
    app_ok = test_app_creation()
    print()
    db_ok = test_database_connection()
    
    print()
    print("=" * 50)
    if app_ok and db_ok:
        print("✅ All tests passed! Backend is ready.")
    else:
        print("❌ Some tests failed. Please check the errors above.")
    print("=" * 50)

