from flask import Flask, render_template, jsonify
from flask import Flask, g
from db import db_connection
from flask_jwt_extended import JWTManager
from users import users_bp

jwt = JWTManager()

def create_app(config_class=None):
    app = Flask(__name__)
    if config_class:
        app.config.from_object(config_class)
    else:
        app.config.from_object("config.Config")

    jwt.init_app(app)
    app.register_blueprint(users_bp)

    @app.route("/health")
    def health():
        return {"status": "ok"}

    @app.teardown_appcontext
    def close_db(exception):
        db = g.pop('db', None)
        if db is not None:
            db.close()

    return app