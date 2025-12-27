from . import books_bp
from config import *
from flask import Blueprint, request, jsonify
from models import *
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

@books_bp.route("/", methods=["POST"])
@admin_required
def add_book():
    data = request.get_json()

    try:
        add_new_book(data)
    except IntegrityError as e:
        return jsonify({"message": "Book with this ISBN already exists."}), 400

    return jsonify({"message": "Book added successfully."}), 201

@books_bp.route("/", methods=["PUT"])
@admin_required
def update_book():
    data = request.get_json()

    update_existing_book(data)

    return jsonify({"message": "Book updated successfully."}), 200

