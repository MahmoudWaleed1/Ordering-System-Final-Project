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

