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
    """Schema for creating a transaction."""

    category_id: Optional[UUID] = None
    type: str = Field(pattern="^(income|expense)$")  # Must be 'income' or 'expense'
    amount_cents: int = Field(gt=0)  # Must be positive
    occurred_at: Optional[datetime] = None
    description: Optional[str] = None
    receipt_url: Optional[str] = None
    metadata_: Optional[dict] = Field(default=None, alias="metadata")


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
    metadata_: Optional[dict] = Field(default=None, alias="metadata")
    created_at: datetime

    class Config:
        from_attributes = True
        populate_by_name = True  # Allow both 'metadata' and 'metadata_'


# ================================
# Notification Schemas
# ================================


class NotificationPreferenceCreate(BaseModel):
    """Schema for creating notification preferences."""

    email_enabled: bool = True
    sms_enabled: bool = False
    low_balance_threshold_cents: Optional[int] = None
    quiet_hours: Optional[dict] = None


class NotificationPreferenceOut(BaseModel):
    """Schema for notification preference response."""

    id: UUID
    user_id: UUID
    email_enabled: bool
    sms_enabled: bool
    low_balance_threshold_cents: Optional[int]
    quiet_hours: Optional[dict]

    class Config:
        from_attributes = True
