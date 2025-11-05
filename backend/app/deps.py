from typing import Annotated
from uuid import UUID

from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from jose import JWTError, jwt
from sqlalchemy.orm import Session

from .config import settings
from .db import get_db
from .models import User

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="api/login")


def get_current_user_id(token: Annotated[str, Depends(oauth2_scheme)]) -> UUID:
    """Extract and validate user ID from JWT token.

    Args:
        token: The JWT access token from the Authorization header

    Returns:
        The user's UUID from the token

    Raises:
        HTTPException: If the token is invalid or expired
    """
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(
            token, settings.jwt_secret, algorithms=[settings.jwt_algorithm]
        )
        user_id_str: str = payload.get("sub")
        if user_id_str is None:
            raise credentials_exception
        return UUID(user_id_str)
    except (JWTError, ValueError):
        raise credentials_exception


def get_current_user(
    db: Annotated[Session, Depends(get_db)],
    user_id: Annotated[UUID, Depends(get_current_user_id)],
) -> User:
    """Get the current authenticated user from the database.

    Args:
        db: Database session
        user_id: User's UUID from JWT token

    Returns:
        The authenticated User object

    Raises:
        HTTPException: If the user is not found
    """
    user = db.query(User).filter(User.id == user_id).first()
    if user is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found",
        )
    return user
