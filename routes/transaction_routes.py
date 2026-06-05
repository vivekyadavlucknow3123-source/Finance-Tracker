from services.db_service import get_connection

def get_transactions():
    conn = get_connection()
    cursor = conn.cursor(dictionary=True)

    cursor.execute("SELECT * FROM transactions")

    data = cursor.fetchall()

    cursor.close()
    conn.close()

    return data