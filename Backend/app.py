from flask import Flask, g
from flask_cors import CORS
from flask_jwt_extended import JWTManager
from users import users_bp
from books import books_bp
from admins import admins_bp

jwt = JWTManager()

def create_app(config_class=None):
    app = Flask(__name__)
    CORS(
        app,
        resources={r"/api/*": {"origins": "http://localhost:3000"}},
        supports_credentials=True
    )
    
    if config_class:
        app.config.from_object(config_class)
    else:
        app.config.from_object("config.Config")

    jwt.init_app(app)
    app.register_blueprint(users_bp)
    app.register_blueprint(books_bp)
    app.register_blueprint(admins_bp)

    @app.route("/health")
    def health():
        return {"status": "ok"}

    @app.teardown_appcontext
    def close_db(exception):
        db = g.pop('db', None)
        if db is not None:
            db.close()

    return app