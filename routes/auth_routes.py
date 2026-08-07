"""
=========================================
Authentication Routes
Day 13
=========================================
"""
import uuid
from services.email_service import (
    send_reset_email
)
from flask import (
    Blueprint,
    jsonify,
    render_template,
    request,
    redirect,
    session
)
from services.auth_service import (
    verify_otp
)
from services.otp_service import generate_otp
from services.auth_service import save_otp, verify_otp

from database.database.db_connection import get_connection

from services.auth_service import (
    register_user,
    login_user,
    email_exists,
    seconds_since_last_otp,
    count_recent_otp_requests
)
from services.otp_service import (
    generate_otp
)
from services.email_service import (
    send_otp_email
)
from services.validation_service import (
    validate_registration_email
)
from config import Config
from extensions import limiter


from services.auth_service import (
    save_otp
)

from werkzeug.security import (
    check_password_hash,
    generate_password_hash
)
from services.email_service import (
    send_reset_email
)
from flask import redirect

# Create Blueprint
auth_bp = Blueprint(
    "auth_bp",
    __name__
)

# =========================================
# REGISTER ROUTE
# Paste this BELOW auth_bp
# =========================================

@auth_bp.route(
    "/register",
    methods=["GET", "POST"]
)
@limiter.limit(
    "10 per hour",
    methods=["POST"]
)
def register():

    if request.method == "POST":

        username = request.form["username"].strip()

        email = request.form["email"].strip().lower()

        password = request.form["password"]

        # ---- 1. Correct syntax (catches typos before an API call) ----
        is_valid, error = validate_registration_email(email)

        if not is_valid:
            return render_template(
                "register.html",
                error=error
            )

        # ---- 2. Database uniqueness (before wasting a Resend send) ----
        if email_exists(email):
            return render_template(
                "register.html",
                error="An account with this email already exists. Try logging in instead."
            )

        # ---- 3. Abuse / bot protection (email bombing + quota guard) ----
        seconds_since = seconds_since_last_otp(email)

        if seconds_since is not None and seconds_since < Config.OTP_RESEND_COOLDOWN_SECONDS:
            wait_left = Config.OTP_RESEND_COOLDOWN_SECONDS - seconds_since
            return render_template(
                "register.html",
                error=f"Please wait {wait_left} seconds before requesting another OTP."
            )

        recent_requests = count_recent_otp_requests(email, window_seconds=3600)

        if recent_requests >= Config.OTP_MAX_REQUESTS_PER_HOUR:
            return render_template(
                "register.html",
                error="Too many OTP requests for this email. Please try again later."
            )

        # ---- 4. Disposable check already ran inside validate_registration_email ----

        otp = generate_otp()

        email_sent = send_otp_email(email, otp)

        if not email_sent:
            return render_template(
                "register.html",
                error="We couldn't send the verification email right now. Please try again in a moment."
            )

        save_otp(
            email,
            otp
        )

        session[
            "pending_username"
        ] = username

        session[
            "pending_email"
        ] = email

        session[
            "pending_password"
        ] = password

        return redirect(
            "/verify-otp"
        )

    return render_template(
        "register.html"
    )
# =========================================
# LOGIN ROUTE
# =========================================

@auth_bp.route(
    "/login",
    methods=["GET", "POST"]
)
def login():

    if request.method == "POST":

        email = request.form["email"]

        password = request.form["password"]

        user = login_user(email)

        if user:

            if check_password_hash(
                user["password_hash"],
                password
            ):

                session["user_id"] = (
                    user["user_id"]
                )

                session["username"] = (
                    user["username"]
                )

                return redirect("/")

        return "Invalid Email or Password"

    return render_template(
        "login.html"
    )
# =========================================
# LOGOUT ROUTE
# =========================================

@auth_bp.route("/logout")
def logout():

    session.clear()

    return redirect("/login")
@auth_bp.route(
    "/forgot-password",
    methods=["GET", "POST"]
)
def forgot_password():

    if request.method == "GET":

        return render_template(
            "forgot_password.html"
        )

    email = request.form["email"]

    conn = get_connection()

    cursor = conn.cursor(
        dictionary=True
    )

    cursor.execute(
        """
        SELECT *
        FROM users
        WHERE email = %s
        """,
        (email,)
    )

    user = cursor.fetchone()

    if not user:

        cursor.close()
        conn.close()

        return "Email not found"

    token = str(
        uuid.uuid4()
    )

    cursor.execute(
        """
        INSERT INTO password_resets
        (
            user_id,
            token
        )
        VALUES
        (
            %s,
            %s
        )
        """,
        (
            user["user_id"],
            token
        )
    )

    conn.commit()

    reset_link = (
        f"http://127.0.0.1:5000/reset-password/{token}"
    )

    send_reset_email(
        email,
        reset_link
    )

    cursor.close()
    conn.close()

    return """

    Reset link sent.

    Check your email.

    <br><br>

    <a href='/login'>
        Back To Login
    </a>

    """
@auth_bp.route(
    "/reset-password/<token>",
    methods=["GET", "POST"]
)
def reset_password(token):

    if request.method == "GET":

        return render_template(
            "reset_password.html"
        )

    new_password = request.form[
        "password"
    ]

    conn = get_connection()

    cursor = conn.cursor(
        dictionary=True
    )

    cursor.execute(
        """
        SELECT *
        FROM password_resets
        WHERE token = %s
        """,
        (token,)
    )

    reset = cursor.fetchone()

    if not reset:

        cursor.close()
        conn.close()

        return "Invalid Token"

    hashed_password = (
        generate_password_hash(
            new_password
        )
    )

    cursor.execute(
        """
        UPDATE users
        SET password_hash = %s
        WHERE user_id = %s
        """,
        (
            hashed_password,
            reset["user_id"]
        )
    )

    cursor.execute(
        """
        DELETE FROM
        password_resets
        WHERE token = %s
        """,
        (token,)
    )

    conn.commit()

    cursor.close()
    conn.close()

    return """

    Password Updated Successfully

    <br><br>

    <a href='/login'>
        Login Now
    </a>

    """
@auth_bp.route(
    "/verify-otp",
    methods=["GET","POST"]
)
def verify_email_otp():

    if request.method == "GET":

        return render_template(
            "verify_otp.html"
        )

    otp = request.form["otp"]

    email = session[
        "pending_email"
    ]

    result = verify_otp(
        email,
        otp
    )

    if not result:

        return "Invalid OTP"

    register_user(

        session[
            "pending_username"
        ],

        session[
            "pending_email"
        ],

        session[
            "pending_password"
        ]
    )

    return redirect(
        "/login"
    )
