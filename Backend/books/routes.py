from . import books_bp
from config import *
from flask import Blueprint, request, jsonify
from books.models import get_books_page, book_search, create_customer_order, get_book_details
from auth.tokens import generate_access_token
from auth.decorators import admin_required
from flask_jwt_extended import jwt_required, get_jwt_identity
from mysql.connector import IntegrityError
import bcrypt

@books_bp.route("/", methods=["GET"])
def get_books():
    
    books = get_books_page()

    return jsonify(books)

@books_bp.route("/search", methods=["GET"])
def search_for_books():
    title = request.args.get("title")
    isbn = request.args.get("isbn")
    category = request.args.get("category")
    author = request.args.get("author")
    publisher = request.args.get("publisher")

    books = book_search(isbn, title, category, author, publisher)

    return jsonify(books)

@books_bp.route("/<isbn>", methods=["GET"])
def get_book_by_isbn(isbn):
    """Get individual book details by ISBN"""
    book = get_book_details(isbn)
    if not book:
        return jsonify({"msg": "Book not found"}), HTTP_404_NOT_FOUND
    return jsonify(book), HTTP_200_OK

@books_bp.route("/orders", methods=["POST"])
@jwt_required()
def order_books():
    username = get_jwt_identity()
    data = request.get_json()

    books = data.get("books")
    credit_card = data.get("credit_card_number")
    expiration_date = data.get("expiration_date")  # Format: YYYY-MM-DD

    if not books or not isinstance(books, list) or not credit_card:
        return jsonify({"msg": "Missing Arguments"}), HTTP_400_BAD_REQUEST

    try:
        order_id = create_customer_order(username, credit_card, books, expiration_date)
    except IntegrityError:
        return jsonify({"msg": "Invalid Input"}), HTTP_400_BAD_REQUEST
    except ValueError as e:
        return jsonify({"msg": str(e)}), HTTP_400_BAD_REQUEST

    return jsonify({"msg": "Order placed successfully", "order_id": order_id}), 201
