import os
import mysql.connector

def get_connection():
    """
    Create and return a MySQL database connection.
    """



connection = mysql.connector.connect(
    host=os.getenv("DB_HOST"),
    port=int(os.getenv("DB_PORT")),
    user=os.getenv("DB_USER"),
    password=os.getenv("DB_PASSWORD"),
    database=os.getenv("DB_NAME"),
)

    return connection


# Test connection when file is run directly
if __name__ == "__main__":

    conn = get_connection()

    if conn.is_connected():
        print("✅ Connected Successfully to MySQL!")
        conn.close()
        print("Connection closed.")
