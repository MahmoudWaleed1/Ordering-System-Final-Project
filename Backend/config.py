class Config:
    SECRET_KEY = "dev-secret"
    JWT_SECRET_KEY = "jwt-dev-secret"

    DB_HOST = "localhost"
    DB_USER = "root"
    DB_PASSWORD = ""
    DB_NAME = "user_test"  # Production DB

class TestConfig(Config):
    DB_NAME = "ordering_system_test" # Test DB