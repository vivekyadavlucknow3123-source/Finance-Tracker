"""
=========================================
Validation Service
=========================================
Everything an OTP alone can't verify:

- Email syntax        (catches typos before wasting a Resend call)
- Disposable email     (blocks throwaway inboxes like 10MinuteMail)

Database uniqueness and abuse/rate-limiting live in auth_service.py
since they need a DB connection - this module stays dependency-light
so it's easy to unit test.
"""

import re
import difflib
from disposable_email_domains import blocklist

# A handful of very common providers - if someone's domain is a close
# (but not exact) match to one of these, it's almost always a typo
# ("gmal.com", "gmial.com", "yahooo.com", "hotmial.com", ...).
COMMON_EMAIL_DOMAINS = [
    "gmail.com", "yahoo.com", "outlook.com", "hotmail.com",
    "icloud.com", "live.com", "rediffmail.com", "protonmail.com",
]

# Reasonably strict RFC-5322-lite pattern - good enough to catch the
# typos that matter (missing @, missing TLD, spaces, double dots, etc.)
# without rejecting valid real-world addresses.
EMAIL_REGEX = re.compile(
    r"^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+"
    r"@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?"
    r"(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$"
)


def is_valid_email_syntax(email):
    """
    Returns True only for a syntactically valid, single, non-empty
    email address. Rejects things like 'user@gmal', 'user @x.com',
    'user@@x.com', trailing dots, etc.
    """

    if not email or len(email) > 254:
        return False

    email = email.strip()

    if " " in email:
        return False

    return bool(EMAIL_REGEX.match(email))


def is_disposable_email(email):
    """
    Returns True if the email's domain is a known disposable/throwaway
    provider (10MinuteMail, Mailinator, YOPmail, Guerrilla Mail, etc.),
    using the community-maintained `disposable-email-domains` blocklist
    (8000+ domains, pip-installable, updated regularly).
    """

    if "@" not in email:
        return False

    domain = email.rsplit("@", 1)[-1].strip().lower()

    return domain in blocklist


def suggest_domain_typo_fix(email):
    """
    Catches the "gmal.com" style typo that a syntax regex can't:
    'gmal.com' IS a syntactically valid domain, it's just wrong.

    Returns a suggested full email (e.g. 'user@gmail.com') if the
    domain is a near-miss of a common provider, otherwise None.
    Doesn't flag the domain if it's already an exact match.
    """

    if "@" not in email:
        return None

    local_part, domain = email.rsplit("@", 1)
    domain = domain.lower()

    if domain in COMMON_EMAIL_DOMAINS:
        return None

    close_matches = difflib.get_close_matches(
        domain,
        COMMON_EMAIL_DOMAINS,
        n=1,
        cutoff=0.82  # high cutoff = only flag near-identical, not "outlook.com" vs "outbox.com"
    )

    if close_matches:
        return f"{local_part}@{close_matches[0]}"

    return None


def validate_registration_email(email):
    """
    Runs both checks and returns a (is_valid, error_message) tuple so
    routes can do:

        ok, error = validate_registration_email(email)
        if not ok:
            return render_template("register.html", error=error)
    """

    if not is_valid_email_syntax(email):
        return False, "Please enter a valid email address."

    if is_disposable_email(email):
        return False, "Temporary/disposable email addresses are not allowed. Please use a real email address."

    suggestion = suggest_domain_typo_fix(email)

    if suggestion:
        return False, f"That domain looks like a typo. Did you mean {suggestion}?"

    return True, None
