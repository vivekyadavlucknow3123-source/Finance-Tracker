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

from database.database.db_connection import (
    get_connection
)


def register_user(
    username,
    email,
    password
):
    """
    Register new user.
    """

    connection = get_connection()

    cursor = connection.cursor()

    hashed_password = (
        generate_password_hash(
            password
        )
    )

    query = """
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
    """

    cursor.execute(
        query,
        (
            username,
            email,
            hashed_password
        )
    )

    connection.commit()

    cursor.close()
    connection.close()


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