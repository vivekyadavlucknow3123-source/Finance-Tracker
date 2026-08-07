import mysql.connector
from config import Config


def get_connection():
    """
    Create and return a MySQL database connection.
    Credentials come from environment variables (.env) via config.py -
    nothing sensitive is hardcoded here anymore.
    """

    connection = mysql.connector.connect(
        host=Config.DB_HOST,
        user=Config.DB_USER,
        password=Config.DB_PASSWORD,
        database=Config.DB_NAME
    )

    return connection


# Test connection when file is run directly
if __name__ == "__main__":

    conn = get_connection()

    if conn.is_connected():
        print("✅ Connected Successfully to MySQL!")
        conn.close()
        print("Connection closed.")
