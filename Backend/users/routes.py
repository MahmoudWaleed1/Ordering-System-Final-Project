<<<<<<< Updated upstream
=======
from . import users_bp
from config import *
from flask import Blueprint, request, jsonify
from users.models import get_user_by_username, create_user
from auth.tokens import generate_access_token
from auth.decorators import admin_required
from flask_jwt_extended import jwt_required, get_jwt_identity
from mysql.connector import IntegrityError
import bcrypt


@users_bp.route("/login", methods=["POST"])
def login():
    data = request.get_json()
    user = get_user_by_username(data["username"])
    password = data.get("password")

    if not user or not bcrypt.checkpw(password.encode('utf-8'), user["password_hash"].encode('utf-8')):
        return jsonify({"msg": "Invalid credentials"}), HTTP_401_UNAUTHORIZED

    token = generate_access_token(user["username"], user["role"])
    return jsonify({"access_token": token, "role": user["role"]})

@users_bp.route("/register", methods=["POST"])
def register():
    data = request.get_json()
    username = data.get("username")
    password = data.get("password")
    role = data.get("role", "Customer")
    shipping_address = data.get("shipping_address")
    phone_number = data.get("phone_number")
    email = data.get("email")
    first_name = data.get("first_name")
    last_name = data.get("last_name")


    required_fields = [username, password, email, first_name, last_name]
    if not all(required_fields):
        return {"msg": "Missing required fields"}, HTTP_400_BAD_REQUEST


    hashed_password = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')

    try:
        user_id = create_user(username, hashed_password, role, shipping_address, phone_number, email, first_name, last_name)
    except IntegrityError:
        return {"msg": "Username already exists"}, HTTP_409_CONFLICT

    return jsonify({"message": "success"}), HTTP_201_CREATED

@users_bp.route("/me", methods=["GET"])
@jwt_required()
def me():
    username = get_jwt_identity()
    user = get_user_by_username(username)
    if not user:
        return {"msg": "User not found"}, HTTP_404_NOT_FOUND
    return user

>>>>>>> Stashed changes
