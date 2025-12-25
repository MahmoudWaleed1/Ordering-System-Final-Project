from . import users_bp
from config import *
from flask import Blueprint, request, jsonify
from users.models import get_user_by_username, create_user, get_user_by_id
from auth.tokens import generate_access_token
from auth.decorators import admin_required
from flask_jwt_extended import jwt_required, get_jwt_identity
from mysql.connector import IntegrityError

@users_bp.route("/login", methods=["POST"])
def login():
    data = request.get_json()
    user = get_user_by_username(data["username"])
    if not user or user["password"] != data["password"]:
        return jsonify({"msg": "Invalid credentials"}), HTTP_401_UNAUTHORIZED

    token = generate_access_token(user["id"], user["role"])
    return jsonify({"access_token": token, "role": user["role"]})

@users_bp.route("/register", methods=["POST"])
def register():
    data = request.get_json()
    try:
        user_id = create_user(data["username"], data["password"])
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

