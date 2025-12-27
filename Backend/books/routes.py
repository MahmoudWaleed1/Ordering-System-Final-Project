from . import books_bp
from config import *
from flask import Blueprint, request, jsonify
from books.models import get_books_page, book_search, create_customer_order
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

@books_bp.route("/orders", methods=["POST"])
@jwt_required()
def order_books():
    username = get_jwt_identity()
    data = request.get_json()

    books = data.get("books")
    credit_card = data.get("credit_card_number")


    if not books or not isinstance(books, list) or not credit_card:
        return jsonify({"msg": "Missing Arguments"}), HTTP_400_BAD_REQUEST

    try:
        order_id = create_customer_order(username, credit_card, books)
    except IntegrityError:
        return jsonify({"msg": "Invalid Input"}), HTTP_400_BAD_REQUEST

    return jsonify({"msg": "Order placed successfully", "order_id": order_id}), 201
