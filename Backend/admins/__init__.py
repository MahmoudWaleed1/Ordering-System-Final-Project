from flask import Blueprint

admins_bp = Blueprint("admins", __name__, url_prefix="/api/admins")
from . import routes

