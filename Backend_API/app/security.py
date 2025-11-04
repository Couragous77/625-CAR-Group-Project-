import time, secrets, hashlib
from datetime import datetime, timedelta, timezone
from jose import jwt
from passlib.hash import bcrypt
from .config import settings

def hash_password(plain: str) -> str:
    return bcrypt.hash(plain)

def verify_password(plain: str, hashed: str) -> bool:
    return bcrypt.verify(plain, hashed)

def create_access_token(sub: str) -> tuple[str, int]:
    exp = datetime.now(timezone.utc) + settings.ACCESS_TOKEN_EXPIRE
    payload = {"sub": sub, "exp": int(exp.timestamp()), "iat": int(time.time())}
    token = jwt.encode(payload, settings.JWT_SECRET, algorithm=settings.JWT_ALG)
    return token, int(settings.ACCESS_TOKEN_EXPIRE.total_seconds())

# Refresh tokens: store only a hash in DB
def new_refresh_token() -> tuple[str, str, datetime]:
    raw = secrets.token_urlsafe(48)
    hashed = bcrypt.hash(raw)
    exp = datetime.now(timezone.utc) + settings.REFRESH_TOKEN_EXPIRE
    return raw, hashed, exp

# Password reset tokens (send raw to user, store hashed)
def new_reset_token() -> tuple[str, str, datetime]:
    raw = secrets.token_urlsafe(32)
    hashed = hashlib.sha256(raw.encode()).hexdigest()
    exp = datetime.now(timezone.utc) + settings.RESET_TOKEN_EXPIRE
    return raw, hashed, exp
