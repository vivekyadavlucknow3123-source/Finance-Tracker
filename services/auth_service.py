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


def email_exists(email):
    """
    Lightweight existence check used BEFORE we spend a Resend API call
    on an OTP. (register_user() also re-checks at insert time, as a
    safety net against race conditions.)
    """

    connection = get_connection()

    cursor = connection.cursor(dictionary=True)

    cursor.execute(
        """
        SELECT user_id
        FROM users
        WHERE email=%s
        """,
        (email,)
    )

    existing_user = cursor.fetchone()

    cursor.close()
    connection.close()

    return existing_user is not None


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


def seconds_since_last_otp(email):
    """
    Returns how many seconds ago the last OTP was requested for this
    email, or None if no OTP has ever been requested. Used to enforce
    a short cooldown between "resend OTP" clicks (email bombing guard).
    """

    conn = get_connection()

    cursor = conn.cursor(dictionary=True)

    cursor.execute(
        """
        SELECT
            TIMESTAMPDIFF(SECOND, created_at, NOW()) AS seconds_ago
        FROM email_otps
        WHERE email=%s
        ORDER BY otp_id DESC
        LIMIT 1
        """,
        (email,)
    )

    result = cursor.fetchone()

    cursor.close()
    conn.close()

    if not result:
        return None

    return result["seconds_ago"]


def count_recent_otp_requests(email, window_seconds=3600):
    """
    Counts how many OTPs were requested for this email in the last
    `window_seconds` (default 1 hour). Used to cap total requests per
    hour so an attacker can't flood a victim's inbox or burn through
    your Resend free-tier quota.
    """

    conn = get_connection()

    cursor = conn.cursor(dictionary=True)

    cursor.execute(
        """
        SELECT COUNT(*) AS request_count
        FROM email_otps
        WHERE email=%s
        AND created_at >= NOW() - INTERVAL %s SECOND
        """,
        (email, window_seconds)
    )

    result = cursor.fetchone()

    cursor.close()
    conn.close()

    return result["request_count"] if result else 0


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