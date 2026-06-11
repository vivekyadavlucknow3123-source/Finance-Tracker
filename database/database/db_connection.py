import mysql.connector

def get_connection():
    """
    Create and return a MySQL database connection.
    """

    connection = mysql.connector.connect(
        host="localhost",
        user="db name",#mysql username
        password="password",#mysql password
        database="finance_tracker"
    )

    return connection


# Test connection when file is run directly
if __name__ == "__main__":

    conn = get_connection()

    if conn.is_connected():
        print("✅ Connected Successfully to MySQL!")
        conn.close()
        print("Connection closed.")