"""
=========================================
App Configuration
=========================================
Loads all secrets/settings from environment variables (.env file)
instead of hardcoding them in source files.
"""

import os
from dotenv import load_dotenv

# Load variables from a .env file in the project root (if present)
load_dotenv()


class Config:

    # ---- Flask ----
    SECRET_KEY = os.environ.get(
        "FLASK_SECRET_KEY",
        "dev-secret-key-change-me"
    )

    # ---- MySQL ----
    DB_HOST = os.environ.get("DB_HOST", "localhost")
    DB_USER = os.environ.get("DB_USER", "root")
    DB_PASSWORD = os.environ.get("DB_PASSWORD", "")
    DB_NAME = os.environ.get("DB_NAME", "finance_tracker")

    # ---- Resend ----
    RESEND_API_KEY = os.environ.get("RESEND_API_KEY", "")
    RESEND_FROM_EMAIL = os.environ.get(
        "RESEND_FROM_EMAIL",
        "onboarding@resend.dev"
    )

    # ---- OTP abuse protection ----
    OTP_RESEND_COOLDOWN_SECONDS = int(
        os.environ.get("OTP_RESEND_COOLDOWN_SECONDS", "60")
    )
    OTP_MAX_REQUESTS_PER_HOUR = int(
        os.environ.get("OTP_MAX_REQUESTS_PER_HOUR", "5")
    )
