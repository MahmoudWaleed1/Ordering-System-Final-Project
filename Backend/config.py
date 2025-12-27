class Config:
    SECRET_KEY = "dev-secret"
    JWT_SECRET_KEY = "jwt-dev-secret"

    DB_HOST = "localhost"
    DB_USER = "root"
    DB_PASSWORD = ""
    DB_NAME = "Book_Order_Processing_System"  # Production DB

class TestConfig(Config):
    DB_NAME = "ordering_system_test" # Test DB

HTTP_200_OK = 200
HTTP_201_CREATED = 201
HTTP_400_BAD_REQUEST = 400
HTTP_401_UNAUTHORIZED = 401
HTTP_403_ADMIN_REQ = 403
HTTP_404_NOT_FOUND = 404
HTTP_409_CONFLICT = 409
HTTP_422_INVALID_TOKEN = 422