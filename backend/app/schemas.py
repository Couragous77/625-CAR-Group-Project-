from datetime import datetime
from typing import Optional
from uuid import UUID

from pydantic import BaseModel, EmailStr, Field


# ================================
# Authentication Schemas
# ================================


class RegisterRequest(BaseModel):
    """Schema for user registration request."""

    email: EmailStr
    password: str = Field(min_length=8, max_length=128)
    first_name: Optional[str] = None
    last_name: Optional[str] = None


class LoginRequest(BaseModel):
    """Schema for user login request."""

    email: EmailStr
    password: str


class TokenResponse(BaseModel):
    """Schema for authentication token response."""

    access_token: str
    token_type: str = "bearer"
    refresh_token: Optional[str] = None
    expires_in: int  # seconds


class PasswordResetRequest(BaseModel):
    """Schema for requesting a password reset."""

    email: EmailStr


class PasswordResetConfirm(BaseModel):
    """Schema for confirming password reset with token."""

    token: str
    new_password: str = Field(min_length=8, max_length=128)


# ================================
# User Schemas
# ================================


class UserCreate(BaseModel):
    """Schema for creating a new user."""

    email: EmailStr
    password: str
    first_name: Optional[str] = None
    last_name: Optional[str] = None


class UserOut(BaseModel):
    """Schema for user response."""

    id: UUID
    email: EmailStr
    first_name: Optional[str]
    last_name: Optional[str]
    role: str
    created_at: datetime

    class Config:
        from_attributes = True


# ================================
# Category Schemas
# ================================


class CategoryCreate(BaseModel):
    """Schema for creating a category."""

    name: str
    monthly_limit_cents: Optional[int] = None
    is_default: bool = False


class CategoryOut(BaseModel):
    """Schema for category response."""

    id: UUID
    name: str
    monthly_limit_cents: Optional[int]
    is_default: bool

    class Config:
        from_attributes = True


# ================================
# Transaction Schemas
# ================================


class TransactionCreate(BaseModel):
    """
    Schema for creating a transaction.

    Business Rules:
    - amount_cents must be positive (> 0)
    - type must be 'income' or 'expense'
    - occurred_at defaults to now if not provided
    - occurred_at cannot be in the future (validated in endpoint)
    - category_id must belong to the user (validated in endpoint)
    """

    category_id: Optional[UUID] = Field(
        None, description="Category UUID (must belong to user)"
    )
    type: str = Field(
        pattern="^(income|expense)$",
        description="Transaction type: 'income' or 'expense'",
    )
    amount_cents: int = Field(gt=0, description="Amount in cents (must be positive)")
    occurred_at: Optional[datetime] = Field(
        None, description="Transaction date (defaults to now, cannot be future)"
    )
    description: Optional[str] = Field(
        None, max_length=500, description="Optional description"
    )
    receipt_url: Optional[str] = Field(None, description="URL or path to receipt image")
    metadata_: Optional[dict] = Field(
        default=None, description="Additional flexible data (use 'metadata_' in JSON)"
    )


class TransactionOut(BaseModel):
    """Schema for transaction response."""

    id: UUID
    user_id: UUID
    category_id: Optional[UUID]
    type: str
    amount_cents: int
    occurred_at: datetime
    description: Optional[str]
    receipt_url: Optional[str]
    metadata_: Optional[dict] = Field(
        default=None, description="Additional flexible data"
    )
    created_at: datetime

    model_config = {
        "from_attributes": True,
    }


# ================================
# Notification Schemas
# ================================


class NotificationPreferenceCreate(BaseModel):
    email_enabled: bool = True
    sms_enabled: bool = False
    low_balance_threshold_cents: Optional[int] = None
    quiet_hours: Optional[dict] = None


class NotificationPreferenceOut(BaseModel):
    id: UUID
    user_id: UUID
    email_enabled: bool
    sms_enabled: bool
    low_balance_threshold_cents: Optional[int]
    quiet_hours: Optional[dict]

    class Config:
        from_attributes = True
