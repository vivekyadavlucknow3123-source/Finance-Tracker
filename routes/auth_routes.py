"""
=========================================
Authentication Routes
Day 13
=========================================
"""

from flask import (
    Blueprint,
    render_template,
    request,
    redirect,
    session
)

from services.auth_service import (
    register_user,
    login_user
)

from werkzeug.security import (
    check_password_hash
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
def register():

    if request.method == "POST":

        username = request.form["username"]

        email = request.form["email"]

        password = request.form["password"]

        register_user(
            username,
            email,
            password
        )

        return redirect("/login")

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