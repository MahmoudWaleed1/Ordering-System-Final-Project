from . import books_bp
from config import *
from flask import Blueprint, request, jsonify
from models import *
from auth.tokens import generate_access_token
from auth.decorators import admin_required
from flask_jwt_extended import jwt_required, get_jwt_identity
from mysql.connector import IntegrityError
import bcrypt

@app.route("/api/books", methods=["GET"])
def get_books():
    page = int(request.args.get("page", 1))
    limit = int(request.args.get("limit", 30))
    search = request.args.get("search")
    category = request.args.get("category")
    min_price = request.args.get("min_price")
    max_price = request.args.get("max_price")

    offset = (page - 1) * limit

    
    books = get_books_model(limit, offset, search, category, min_price, max_price)

    return jsonify({
        "data": books,
        "pagination": {
            "page": page,
            "limit": limit
        }
    })

@app.route("/api/books/<int:book_id>", methods=["GET"])
def get_book(book_id):
    book = get_book_by_id(book_id)

    if not book:
        return jsonify({"error": "Book not found"}), 404

    return jsonify(book)
