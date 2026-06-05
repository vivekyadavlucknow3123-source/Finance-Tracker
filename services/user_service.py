"""
User Service

Purpose:
Get user data from database.
"""

from services.db_service import get_connection


def get_all_users():
    """
    Fetch all users from database.

    Returns:
        List of dictionaries
    """

    conn = get_connection()

    cursor = conn.cursor(dictionary=True)

    query = """
    SELECT
        user_id,
        username,
        email,
        created_at
    FROM users
    """

    cursor.execute(query)

    users = cursor.fetchall()

    cursor.close()
    conn.close()

    return users