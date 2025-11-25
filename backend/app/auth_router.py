from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from . import schemas, models
from .config import settings
from .db import get_db
from .deps import get_current_user
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


@router.get("/me", response_model=schemas.UserResponse)
def get_current_user_profile(
    current_user: Annotated[User, Depends(get_current_user)],
    db: Annotated[Session, Depends(get_db)],
):
    """Get the current authenticated user's profile.

    Args:
        current_user: The authenticated user from the JWT token
        db: Database session for eager loading related data

    Returns:
        UserResponse with user profile information
    """
    goals = (
        db.query(models.Goal)
        .filter(models.Goal.user_id == current_user.id)
        .order_by(models.Goal.created_at.desc())
        .all()
    )

    return schemas.UserResponse(
        id=current_user.id,
        email=current_user.email,
        first_name=current_user.first_name,
        last_name=current_user.last_name,
        student_status=current_user.student_status,
        role=current_user.role,
        goals=goals,
    )


@router.patch("/me", response_model=schemas.UserResponse)
def update_current_user_profile(
    body: schemas.UserUpdate,
    current_user: Annotated[User, Depends(get_current_user)],
    db: Annotated[Session, Depends(get_db)],
):
    """Update the current authenticated user's profile."""
    # Apply updates if provided
    if body.first_name is not None:
        current_user.first_name = body.first_name
    if body.last_name is not None:
        current_user.last_name = body.last_name
    if body.student_status is not None:
        current_user.student_status = body.student_status

    db.add(current_user)
    db.commit()
    db.refresh(current_user)

    goals = (
        db.query(models.Goal)
        .filter(models.Goal.user_id == current_user.id)
        .order_by(models.Goal.created_at.desc())
        .all()
    )

    return schemas.UserResponse(
        id=current_user.id,
        email=current_user.email,
        first_name=current_user.first_name,
        last_name=current_user.last_name,
        student_status=current_user.student_status,
        role=current_user.role,
        goals=goals,
    )
