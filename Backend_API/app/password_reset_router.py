from fastapi import APIRouter, HTTPException
from datetime import datetime, timezone
from passlib.hash import bcrypt
import hashlib
from . import schemas
from .db import get_conn
from .security import new_reset_token, hash_password

router = APIRouter(prefix="/api", tags=["password-reset"])

@router.post("/password_reset")
def request_reset(body: schemas.PasswordResetRequest):
    # We do not leak whether the email exists (respond 200 either way)
    with get_conn() as conn, conn.cursor() as cur:
        cur.execute("SELECT id FROM users WHERE LOWER(email)=LOWER(%s)", (body.email,))
        user = cur.fetchone()
        if user:
            raw, hashed, exp = new_reset_token()
            cur.execute("""
                INSERT INTO password_reset_tokens (user_id, token_hash, expires_at)
                VALUES (%s, %s, %s)
                RETURNING id
            """, (user["id"], hashed, exp))
            # In dev, just print the raw token. In prod, email it.
            print(f"[DEV ONLY] Password reset token for {body.email}: {raw}")
    return {"ok": True}

@router.post("/password_reset/confirm")
def confirm_reset(body: schemas.PasswordResetConfirm):
    token_hash = hashlib.sha256(body.token.encode()).hexdigest()
    now = datetime.now(timezone.utc)
    with get_conn() as conn, conn.cursor() as cur:
        cur.execute("""
            SELECT id, user_id FROM password_reset_tokens
            WHERE token_hash=%s AND used_at IS NULL AND expires_at > %s
        """, (token_hash, now))
        tok = cur.fetchone()
        if not tok:
            raise HTTPException(status_code=400, detail="Invalid or expired token")

        new_hash = hash_password(body.new_password)
        # one transaction: update user pw + mark token used
        cur.execute("UPDATE users SET password_hash=%s, updated_at=NOW() WHERE id=%s",
                    (new_hash, tok["user_id"]))
        cur.execute("UPDATE password_reset_tokens SET used_at=NOW() WHERE id=%s",
                    (tok["id"],))
    return {"ok": True}
