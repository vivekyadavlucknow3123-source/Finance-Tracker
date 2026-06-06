"""
Category Service
"""

from database.database.db_connection import get_connection


def get_all_categories():

    conn = get_connection()

    cursor = conn.cursor(
        dictionary=True
    )

    cursor.execute(
        "SELECT * FROM categories"
    )

    data = cursor.fetchall()

    cursor.close()
    conn.close()

    return data