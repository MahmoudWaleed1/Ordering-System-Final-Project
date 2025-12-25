from . import users_bp
from config import *
from flask import Blueprint, request, jsonify
from users.models import get_user_by_username, create_user, get_user_by_id
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

    if not user or not bcrypt.checkpw(password.encode('utf-8'), user["password"].encode('utf-8')):
        return jsonify({"msg": "Invalid credentials"}), HTTP_401_UNAUTHORIZED

    token = generate_access_token(user["id"], user["role"])
    return jsonify({"access_token": token, "role": user["role"]})

@users_bp.route("/register", methods=["POST"])
def register():
    data = request.get_json()
    username = data.get("username")
    password = data.get("password")

    if not username or not password:
        return {"msg": "Missing username or password"}, 400

    hashed_password = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')

    try:
        user_id = create_user(username, hashed_password)
    except IntegrityError:
        return {"msg": "Username already exists"}, HTTP_409_CONFLICT
    
    return jsonify({"user_id": user_id}), HTTP_201_CREATED

@users_bp.route("/me", methods=["GET"])
@jwt_required()
def me():
    user_id = int(get_jwt_identity())
    user = get_user_by_id(user_id)
    if not user:
        return {"msg": "User not found"}, HTTP_404_NOT_FOUND
    return user

