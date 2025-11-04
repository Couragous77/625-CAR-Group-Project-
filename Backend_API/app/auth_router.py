from fastapi import APIRouter, HTTPException, status
from . import schemas
from .db import get_conn
from .security import hash_password, verify_password, create_access_token, new_refresh_token
from .config import settings

router = APIRouter(prefix="/api", tags=["auth"])

@router.post("/register", response_model=schemas.TokenResponse, status_code=201)
def register(body: schemas.RegisterRequest):
    # NOTE: DB teammate must ensure users(email) is unique (ideally CITEXT)
    with get_conn() as conn, conn.cursor() as cur:
        cur.execute("SELECT id FROM users WHERE LOWER(email)=LOWER(%s)", (body.email,))
        if cur.fetchone():
            raise HTTPException(status_code=409, detail="Email already registered")

        pwd_hash = hash_password(body.password)
        cur.execute("""
            INSERT INTO users (email, password_hash, name)
            VALUES (%s, %s, %s)
            RETURNING id
        """, (body.email, pwd_hash, body.name))
        row = cur.fetchone()
        user_id = row["id"]

        access_token, expires_in = create_access_token(str(user_id))

        refresh_val = None
        if settings.USE_REFRESH_TOKENS:
            raw, hashed, exp = new_refresh_token()
            cur.execute("""
                INSERT INTO sessions (user_id, refresh_token_hash, expires_at)
                VALUES (%s, %s, %s)
                RETURNING id
            """, (user_id, hashed, exp))
            refresh_val = raw

    return schemas.TokenResponse(
        access_token=access_token,
        refresh_token=refresh_val,
        expires_in=expires_in,
    )

@router.post("/login", response_model=schemas.TokenResponse)
def login(body: schemas.LoginRequest):
    with get_conn() as conn, conn.cursor() as cur:
        cur.execute("SELECT id, password_hash FROM users WHERE LOWER(email)=LOWER(%s)", (body.email,))
        user = cur.fetchone()
        if not user or not verify_password(body.password, user["password_hash"]):
            raise HTTPException(status_code=401, detail="Invalid credentials")

        access_token, expires_in = create_access_token(str(user["id"]))
        refresh_val = None
        if settings.USE_REFRESH_TOKENS:
            raw, hashed, exp = new_refresh_token()
            cur.execute("""
                INSERT INTO sessions (user_id, refresh_token_hash, expires_at)
                VALUES (%s, %s, %s)
                RETURNING id
            """, (user["id"], hashed, exp))
            refresh_val = raw

    return schemas.TokenResponse(
        access_token=access_token,
        refresh_token=refresh_val,
        expires_in=expires_in,
    )
