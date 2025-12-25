from flask import g, current_app
import mysql.connector

def get_db():
    if 'db' not in g:
        g.db = mysql.connector.connect(
            host=current_app.config['DB_HOST'],
            user=current_app.config['DB_USER'],
            password=current_app.config['DB_PASSWORD'],
            database=current_app.config['DB_NAME']
        )
    return g.db

# def create_user(email, password):
#     conn = get_connection()
#     cursor = conn.cursor()
#     cursor.execute("INSERT INTO users (email, password) VALUES (%s, %s)", (email, password))
#     conn.commit()
#     conn.close()