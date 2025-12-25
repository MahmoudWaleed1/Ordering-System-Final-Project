from flask_jwt_extended import create_access_token

def generate_access_token(user_id, role):
    return create_access_token(identity=str(user_id), additional_claims={"role": role})