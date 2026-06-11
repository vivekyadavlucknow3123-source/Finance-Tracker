"""
=========================================
Authentication Service
Day 13
=========================================

Handles:

- User Registration
- User Login
"""

from werkzeug.security import (
    generate_password_hash,
    check_password_hash
)
from services.otp_service import generate_otp


from database.database.db_connection import (
    get_connection
)


def register_user(
    username,
    email,
    password
):

    connection = get_connection()

    cursor = connection.cursor(
        dictionary=True
    )

    cursor.execute(
        """
        SELECT user_id
        FROM users
        WHERE email=%s
        """,
        (email,)
    )

    existing_user = cursor.fetchone()

    if existing_user:

        cursor.close()
        connection.close()

        return False

    hashed_password = generate_password_hash(
        password
    )

    cursor.execute(
        """
        INSERT INTO users
        (
            username,
            email,
            password_hash
        )
        VALUES
        (
            %s,
            %s,
            %s
        )
        """,
        (
            username,
            email,
            hashed_password
        )
    )

    connection.commit()

    cursor.close()
    connection.close()

    return True


def login_user(email):

    connection = get_connection()

    cursor = connection.cursor(
        dictionary=True
    )

    query = """
    SELECT *
    FROM users
    WHERE email=%s
    """

    cursor.execute(
        query,
        (email,)
    )

    user = cursor.fetchone()

    cursor.close()
    connection.close()

    return user

def save_otp(
    email,
    otp
):

    conn = get_connection()

    cursor = conn.cursor()

    cursor.execute(

        """
        INSERT INTO email_otps
        (
            email,
            otp
        )
        VALUES
        (
            %s,
            %s
        )
        """,

        (
            email,
            otp
        )
    )

    conn.commit()

    cursor.close()

    conn.close()

def verify_otp(
    email,
    otp
):

    conn = get_connection()

    cursor = conn.cursor(
        dictionary=True
    )

    cursor.execute(

        """
        SELECT *
        FROM email_otps

        WHERE email=%s

        AND otp=%s

        ORDER BY otp_id DESC

        LIMIT 1
        """,

        (
            email,
            otp
        )
    )

    result = cursor.fetchone()

    cursor.close()

    conn.close()

    return result