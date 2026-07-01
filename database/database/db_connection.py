import os
import mysql.connector

def get_connection():
    """
    Create and return a MySQL database connection.
    """



connection = mysql.connector.connect(
    host=os.getenv("sql.freedb.tech"),
    port=int(os.getenv("3306")),
    user=os.getenv("u_55dXWt"),
    password=os.getenv("JgfTDRrmECll"),
    database=os.getenv("u_55dXWt"),
)

    return connection


# Test connection when file is run directly
if __name__ == "__main__":

    conn = get_connection()

    if conn.is_connected():
        print("✅ Connected Successfully to MySQL!")
        conn.close()
        print("Connection closed.")
