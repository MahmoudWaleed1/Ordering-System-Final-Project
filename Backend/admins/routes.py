from . import admins_bp
from config import *
from flask import request, jsonify
from admins.models import (
    get_all_books, get_book_by_isbn, create_book, update_book, delete_book,
    get_all_publisher_orders, confirm_publisher_order, get_all_publishers,
    get_sales_previous_month, get_sales_by_date, get_top_5_customers,
    get_top_10_selling_books, get_replenishment_history, get_all_customer_orders
)
from auth.decorators import admin_required
from flask_jwt_extended import jwt_required
from mysql.connector import IntegrityError

# ==========================================================
# BOOK MANAGEMENT ENDPOINTS
# ==========================================================

@admins_bp.route("/books", methods=["GET"])
@jwt_required()
@admin_required
def list_all_books():
    """Get all books with full details"""
    books = get_all_books()
    return jsonify(books), HTTP_200_OK

@admins_bp.route("/books/<isbn>", methods=["GET"])
@jwt_required()
@admin_required
def get_book(isbn):
    """Get a specific book by ISBN"""
    book = get_book_by_isbn(isbn)
    if not book:
        return jsonify({"msg": "Book not found"}), HTTP_404_NOT_FOUND
    return jsonify(book), HTTP_200_OK

@admins_bp.route("/books", methods=["POST"])
@jwt_required()
@admin_required
def add_book():
    """Create a new book"""
    data = request.get_json()
    
    required_fields = ["ISBN_number", "title", "publication_year", "quantity_stock", 
                      "category", "threshold", "selling_price", "book_image"]
    
    for field in required_fields:
        if field not in data:
            return jsonify({"msg": f"Missing required field: {field}"}), HTTP_400_BAD_REQUEST
    
    isbn = data["ISBN_number"]
    title = data["title"]
    publication_year = data["publication_year"]
    quantity_stock = data["quantity_stock"]
    category = data["category"]
    threshold = data["threshold"]
    selling_price = data["selling_price"]
    publisher_id = data.get("publisher_id")
    book_image = data["book_image"]
    authors = data.get("authors", [])
    
    if not isinstance(authors, list):
        return jsonify({"msg": "Authors must be a list"}), HTTP_400_BAD_REQUEST
    
    try:
        create_book(isbn, title, publication_year, quantity_stock, category, 
                   threshold, selling_price, publisher_id, book_image, authors)
        return jsonify({"msg": "Book created successfully"}), HTTP_201_CREATED
    except IntegrityError:
        return jsonify({"msg": "Book with this ISBN already exists"}), HTTP_409_CONFLICT
    except Exception as e:
        return jsonify({"msg": f"Error creating book: {str(e)}"}), HTTP_400_BAD_REQUEST

@admins_bp.route("/books/<isbn>", methods=["PUT"])
@jwt_required()
@admin_required
def update_book_details(isbn):
    """Update a book's details"""
    data = request.get_json()
    
    # Check if book exists
    book = get_book_by_isbn(isbn)
    if not book:
        return jsonify({"msg": "Book not found"}), HTTP_404_NOT_FOUND
    
    title = data.get("title")
    publication_year = data.get("publication_year")
    quantity_stock = data.get("quantity_stock")
    category = data.get("category")
    threshold = data.get("threshold")
    selling_price = data.get("selling_price")
    publisher_id = data.get("publisher_id")
    book_image = data.get("book_image")
    authors = data.get("authors")
    
    try:
        success = update_book(isbn, title, publication_year, quantity_stock, 
                            category, threshold, selling_price, publisher_id, 
                            book_image, authors)
        if success:
            return jsonify({"msg": "Book updated successfully"}), HTTP_200_OK
        else:
            return jsonify({"msg": "No changes made"}), HTTP_400_BAD_REQUEST
    except Exception as e:
        return jsonify({"msg": f"Error updating book: {str(e)}"}), HTTP_400_BAD_REQUEST

@admins_bp.route("/books/<isbn>", methods=["DELETE"])
@jwt_required()
@admin_required
def remove_book(isbn):
    """Delete a book"""
    book = get_book_by_isbn(isbn)
    if not book:
        return jsonify({"msg": "Book not found"}), HTTP_404_NOT_FOUND
    
    try:
        success = delete_book(isbn)
        if success:
            return jsonify({"msg": "Book deleted successfully"}), HTTP_200_OK
        else:
            return jsonify({"msg": "Failed to delete book"}), HTTP_400_BAD_REQUEST
    except IntegrityError:
        return jsonify({"msg": "Cannot delete book: it is referenced in orders"}), HTTP_400_BAD_REQUEST
    except Exception as e:
        return jsonify({"msg": f"Error deleting book: {str(e)}"}), HTTP_400_BAD_REQUEST

# ==========================================================
# PUBLISHER ORDER MANAGEMENT ENDPOINTS
# ==========================================================

@admins_bp.route("/publisher-orders", methods=["GET"])
@jwt_required()
@admin_required
def list_publisher_orders():
    """Get all publisher orders"""
    orders = get_all_publisher_orders()
    return jsonify(orders), HTTP_200_OK

@admins_bp.route("/publisher-orders/<int:order_id>/confirm", methods=["PUT"])
@jwt_required()
@admin_required
def confirm_publisher_order_endpoint(order_id):
    """Confirm a pending publisher order"""
    success = confirm_publisher_order(order_id)
    if success:
        return jsonify({"msg": "Publisher order confirmed successfully"}), HTTP_200_OK
    else:
        return jsonify({"msg": "Order not found or already confirmed"}), HTTP_404_NOT_FOUND

@admins_bp.route("/publishers", methods=["GET"])
@jwt_required()
@admin_required
def list_publishers():
    """Get all publishers"""
    publishers = get_all_publishers()
    return jsonify(publishers), HTTP_200_OK

# ==========================================================
# CUSTOMER ORDER MANAGEMENT ENDPOINTS
# ==========================================================

@admins_bp.route("/customer-orders", methods=["GET"])
@jwt_required()
@admin_required
def list_customer_orders():
    """Get all customer orders"""
    orders = get_all_customer_orders()
    return jsonify(orders), HTTP_200_OK

# ==========================================================
# REPORTS ENDPOINTS
# ==========================================================

@admins_bp.route("/reports/sales/previous-month", methods=["GET"])
@jwt_required()
@admin_required
def report_sales_previous_month():
    """Get total sales for the previous month"""
    result = get_sales_previous_month()
    return jsonify(result), HTTP_200_OK

@admins_bp.route("/reports/sales/by-date", methods=["GET"])
@jwt_required()
@admin_required
def report_sales_by_date():
    """Get total sales for a specific date"""
    target_date = request.args.get("date")
    if not target_date:
        return jsonify({"msg": "Missing date parameter"}), HTTP_400_BAD_REQUEST
    
    result = get_sales_by_date(target_date)
    return jsonify(result), HTTP_200_OK

@admins_bp.route("/reports/top-customers", methods=["GET"])
@jwt_required()
@admin_required
def report_top_customers():
    """Get top 5 customers by purchase amount (last 3 months)"""
    customers = get_top_5_customers()
    return jsonify(customers), HTTP_200_OK

@admins_bp.route("/reports/top-books", methods=["GET"])
@jwt_required()
@admin_required
def report_top_books():
    """Get top 10 selling books (last 3 months)"""
    books = get_top_10_selling_books()
    return jsonify(books), HTTP_200_OK

@admins_bp.route("/reports/replenishment-history/<isbn>", methods=["GET"])
@jwt_required()
@admin_required
def report_replenishment_history(isbn):
    """Get replenishment history for a specific book"""
    result = get_replenishment_history(isbn)
    if result is None:
        return jsonify({"msg": "Book not found"}), HTTP_404_NOT_FOUND
    return jsonify(result), HTTP_200_OK

