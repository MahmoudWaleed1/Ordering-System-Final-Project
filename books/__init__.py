from flask import Blueprint

books_bp = Blueprint("books", __name__, url_prefix="/api/books")
from . import routes 
