"""
=========================================
Email Service (Resend API)
=========================================

Sends transactional emails (OTP + password reset) through Resend
instead of smtplib, using an API key loaded from environment
variables (see config.py / .env).
"""

import resend
from config import Config

# Resend's SDK reads the key off this module-level attribute
resend.api_key = Config.RESEND_API_KEY


def _send(to_email, subject, html_body):
    """
    Internal helper that actually calls the Resend API.

    Returns:
        True  -> email accepted by Resend
        False -> send failed (bad key, invalid recipient domain, etc.)
    """

    if not Config.RESEND_API_KEY:
        # Fail loudly in the server logs instead of pretending it worked
        print("[EmailService] RESEND_API_KEY is not set. Check your .env file.")
        return False

    try:
        resend.Emails.send({
            "from": Config.RESEND_FROM_EMAIL,
            "to": to_email,
            "subject": subject,
            "html": html_body,
        })
        return True

    except Exception as error:
        # Resend raises on 4xx/5xx responses (bad key, unverified domain,
        # rate limit, invalid recipient, etc.) - never let that crash the
        # request, just log it and let the caller decide what to do.
        print(f"[EmailService] Failed to send email to {to_email}: {error}")
        return False


def send_otp_email(receiver_email, otp):
    """
    Sends the 6-digit registration OTP.
    Returns True/False so the caller can show an error instead of
    silently redirecting to a verify-otp page the user can never pass.
    """

    html_body = f"""
        <p>Your Finance Tracker OTP is:</p>
        <h2 style="letter-spacing: 4px;">{otp}</h2>
        <p>This code expires shortly. Do not share it with anyone.</p>
    """

    return _send(
        receiver_email,
        "Finance Tracker OTP Verification",
        html_body
    )


def send_reset_email(receiver_email, reset_link):
    """
    Sends the password-reset link.
    Returns True/False - same reasoning as send_otp_email.
    """

    html_body = f"""
        <p>Click the link below to reset your Finance Tracker password:</p>
        <p><a href="{reset_link}">{reset_link}</a></p>
        <p>If you didn't request this, you can safely ignore this email.</p>
    """

    return _send(
        receiver_email,
        "FinanceTracker Password Reset",
        html_body
    )
