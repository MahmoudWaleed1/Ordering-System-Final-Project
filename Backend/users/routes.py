from . import users_bp
from config import *
from flask import Blueprint, request, jsonify
from users.models import get_user_by_username, create_user, update_user_by_username
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
    name = data.get("name", "").strip()
    parts = name.split()
    if len(parts) < 2:
        return jsonify({"error": "Full name must include first and last name"}), 400
    first_name = parts[0]
    last_name = " ".join(parts[1:])


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

@users_bp.route("/me", methods=["PUT"])
@jwt_required
def update_profile():
    username = get_jwt_identity()
    data = request.get_json()
    allowed_fields = { # password is excluded. It has a separate condition
        "username": "username",
        "first_name": "first_name",
        "last_name": "last_name",
        "email": "email",
        "phone_number": "phone_number",
        "shipping_address": "shipping_address"
    }
    updates = {}

    for api_field, db_field in allowed_fields:
        if api_field in data:
            updates[db_field] = data[api_field]

    if "old_password" in data and "new_password" in data:
        user = get_user_by_username(data["username"])
        if not user or not bcrypt.checkpw(data["old_password"].encode('utf-8'), user["password_hash"].encode('utf-8')):
            return jsonify({"msg": "Incorrect Password"}), HTTP_401_UNAUTHORIZED
        updates["password_hash"] = bcrypt.hashpw(data["new_password"].encode('utf-8'), bcrypt.gensalt()).decode('utf-8')

    if not updates:
        return jsonify({"msg": "No valid fields provided for update"}), HTTP_400_BAD_REQUEST 
    
    try:
        success = update_user_by_username(username, updates)

        if success:
            return jsonify({"msg": "Profile updated successfully"}), 200
        else:
            return jsonify({"msg": "User not found or no changes made"}), 404

    except IntegrityError:
        if "email" in data and "username" in data:
            return jsonify({"msg": "Username or Email already taken"}), HTTP_409_CONFLICT
        elif "username" in data:
            return jsonify({"msg": "Username already taken"}), HTTP_409_CONFLICT
        else:
            return jsonify({"msg": "email already taken"}), HTTP_409_CONFLICT

    except Exception as e:
        print(f"Error: {e}")
        return jsonify({"msg": "Internal Server Error"}), 500
    
@users_bp.route("/orders", methods=["POST"])
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

