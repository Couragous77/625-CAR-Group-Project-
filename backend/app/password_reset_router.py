import hashlib
from datetime import datetime, timezone
from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from . import schemas
from .db import get_db
from .models import PasswordResetToken, User
from .security import hash_password, new_reset_token

router = APIRouter(prefix="/api", tags=["password-reset"])


@router.post("/password_reset")
def request_reset(
    body: schemas.PasswordResetRequest,
    db: Annotated[Session, Depends(get_db)],
):
    """Request a password reset token.

    This endpoint does not leak whether the email exists in the system.
    It always returns a success response for security reasons.

    Args:
        body: Password reset request with email
        db: Database session

    Returns:
        Success response (always returns 200 OK)
    """
    # Find user by email (case-insensitive)
    user = db.query(User).filter(User.email.ilike(body.email)).first()

    if user:
        # Generate reset token
        raw, hashed, exp = new_reset_token()

        # Store hashed token in database
        reset_token = PasswordResetToken(
            user_id=user.id,
            token_hash=hashed,
            expires_at=exp,
        )
        db.add(reset_token)
        db.commit()

        # In development, print the token. In production, send it via email.
        print(f"[DEV ONLY] Password reset token for {body.email}: {raw}")

        # TODO: Send email with reset link containing the raw token
        # send_email(
        #     to=body.email,
        #     subject="Password Reset Request",
        #     body=f"Click here to reset your password: {settings.frontend_url}/reset-password?token={raw}"
        # )

    # Always return success to prevent email enumeration
    return {"ok": True}


@router.post("/password_reset/confirm")
def confirm_reset(
    body: schemas.PasswordResetConfirm,
    db: Annotated[Session, Depends(get_db)],
):
    """Confirm password reset with token and set new password.

    Args:
        body: Password reset confirmation with token and new password
        db: Database session

    Returns:
        Success response

    Raises:
        HTTPException: If token is invalid or expired (400 Bad Request)
    """
    # Hash the provided token to compare with stored hash
    token_hash = hashlib.sha256(body.token.encode()).hexdigest()
    now = datetime.now(timezone.utc)

    # Find valid, unused token that hasn't expired
    reset_token = (
        db.query(PasswordResetToken)
        .filter(
            PasswordResetToken.token_hash == token_hash,
            PasswordResetToken.used_at.is_(None),
            PasswordResetToken.expires_at > now,
        )
        .first()
    )

    if not reset_token:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid or expired token",
        )

    # Update user's password
    new_hash = hash_password(body.new_password)
    user = db.query(User).filter(User.id == reset_token.user_id).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="User not found",
        )

    user.password_hash = new_hash
    user.updated_at = now

    # Mark token as used
    reset_token.used_at = now

    db.commit()

    return {"ok": True}
