import hashlib
import secrets
import time
from datetime import datetime, timezone

from jose import jwt
from passlib.hash import bcrypt

from .config import settings


def hash_password(plain: str) -> str:
    """Hash a plain password using bcrypt.

    Args:
        plain: The plain text password to hash

    Returns:
        The bcrypt hashed password
    """
    return bcrypt.hash(plain)


def verify_password(plain: str, hashed: str) -> bool:
    """Verify a plain password against a bcrypt hash.

    Args:
        plain: The plain text password to verify
        hashed: The bcrypt hashed password

    Returns:
        True if the password matches, False otherwise
    """
    return bcrypt.verify(plain, hashed)


def create_access_token(sub: str) -> tuple[str, int]:
    """Create a JWT access token.

    Args:
        sub: The subject (usually user_id) for the token

    Returns:
        Tuple of (token_string, expires_in_seconds)
    """
    exp = datetime.now(timezone.utc) + settings.access_token_expire
    payload = {
        "sub": sub,
        "exp": int(exp.timestamp()),
        "iat": int(time.time()),
    }
    token = jwt.encode(payload, settings.jwt_secret, algorithm=settings.jwt_algorithm)
    return token, int(settings.access_token_expire.total_seconds())


def new_refresh_token() -> tuple[str, str, datetime]:
    """Generate a new refresh token.

    Returns:
        Tuple of (raw_token, hashed_token, expiration_datetime)
        Store only the hashed token in the database.
    """
    raw = secrets.token_urlsafe(48)
    hashed = bcrypt.hash(raw)
    exp = datetime.now(timezone.utc) + settings.refresh_token_expire
    return raw, hashed, exp


def new_reset_token() -> tuple[str, str, datetime]:
    """Generate a new password reset token.

    Returns:
        Tuple of (raw_token, hashed_token, expiration_datetime)
        Send the raw token to the user, store only the hashed token in the database.
    """
    raw = secrets.token_urlsafe(32)
    hashed = hashlib.sha256(raw.encode()).hexdigest()
    exp = datetime.now(timezone.utc) + settings.reset_token_expire
    return raw, hashed, exp
