from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from . import schemas
from .config import settings
from .db import get_db
from .models import Session as SessionModel
from .models import User
from .security import (
    create_access_token,
    hash_password,
    new_refresh_token,
    verify_password,
)

router = APIRouter(prefix="/api", tags=["auth"])


@router.post(
    "/register",
    response_model=schemas.TokenResponse,
    status_code=status.HTTP_201_CREATED,
)
def register(
    body: schemas.RegisterRequest,
    db: Annotated[Session, Depends(get_db)],
):
    """Register a new user account.

    Args:
        body: Registration request with email, password, and optional name fields
        db: Database session

    Returns:
        TokenResponse with access token and optional refresh token

    Raises:
        HTTPException: If email is already registered (409 Conflict)
    """
    # Check if email already exists (case-insensitive)
    existing_user = db.query(User).filter(User.email.ilike(body.email)).first()
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Email already registered",
        )

    # Hash password and create user
    pwd_hash = hash_password(body.password)
    user = User(
        email=body.email.lower(),  # Store email in lowercase
        password_hash=pwd_hash,
        first_name=body.first_name,
        last_name=body.last_name,
        role="student",  # Default role
    )
    db.add(user)
    db.commit()
    db.refresh(user)

    # Create access token
    access_token, expires_in = create_access_token(str(user.id))

    # Optionally create refresh token
    refresh_val = None
    if settings.use_refresh_tokens:
        raw, hashed, exp = new_refresh_token()
        session = SessionModel(
            user_id=user.id,
            refresh_token_hash=hashed,
            expires_at=exp,
        )
        db.add(session)
        db.commit()
        refresh_val = raw

    return schemas.TokenResponse(
        access_token=access_token,
        refresh_token=refresh_val,
        expires_in=expires_in,
    )


@router.post("/login", response_model=schemas.TokenResponse)
def login(
    body: schemas.LoginRequest,
    db: Annotated[Session, Depends(get_db)],
):
    """Authenticate a user and return access token.

    Args:
        body: Login request with email and password
        db: Database session

    Returns:
        TokenResponse with access token and optional refresh token

    Raises:
        HTTPException: If credentials are invalid (401 Unauthorized)
    """
    # Find user by email (case-insensitive)
    user = db.query(User).filter(User.email.ilike(body.email)).first()

    # Verify user exists and password is correct
    if not user or not verify_password(body.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid credentials",
        )

    # Create access token
    access_token, expires_in = create_access_token(str(user.id))

    # Optionally create refresh token
    refresh_val = None
    if settings.use_refresh_tokens:
        raw, hashed, exp = new_refresh_token()
        session = SessionModel(
            user_id=user.id,
            refresh_token_hash=hashed,
            expires_at=exp,
        )
        db.add(session)
        db.commit()
        refresh_val = raw

    return schemas.TokenResponse(
        access_token=access_token,
        refresh_token=refresh_val,
        expires_in=expires_in,
    )
