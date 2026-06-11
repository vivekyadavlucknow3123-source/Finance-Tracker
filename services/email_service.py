import smtplib
from email.mime.text import MIMEText


def send_reset_email(
    receiver_email,
    reset_link
):

    sender_email = "vivek.yadavcse23@smslucknow.ac.in"#your email address

    app_password = "amsw qxjx qowi mpvf"#your email app password

    message = MIMEText(
        f"""
Click the link below to reset your password:

{reset_link}
"""
    )

    message["Subject"] = (
        "FinanceTracker Password Reset"
    )

    message["From"] = sender_email

    message["To"] = receiver_email

    server = smtplib.SMTP(
        "smtp.gmail.com",
        587
    )

    server.starttls()

    server.login(
        sender_email,
        app_password
    )

    server.send_message(
        message
    )

    server.quit()
def send_otp_email(
    receiver_email,
    otp
):

    sender_email = "vivek.yadavcse23@smslucknow.ac.in"

    app_password = "amsw qxjx qowi mpvf"

    msg = MIMEText(
        f"""
Your Finance Tracker OTP is:

{otp}

Do not share this OTP with anyone.
"""
    )

    msg["Subject"] = (
        "Finance Tracker OTP Verification"
    )

    msg["From"] = sender_email

    msg["To"] = receiver_email

    server = smtplib.SMTP(
        "smtp.gmail.com",
        587
    )

    server.starttls()

    server.login(
        sender_email,
        app_password
    )

    server.send_message(
        msg
    )

    server.quit()