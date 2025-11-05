import uuid

from sqlalchemy import (
    Boolean,
    CheckConstraint,
    Column,
    DateTime,
    ForeignKey,
    Integer,
    String,
    Text,
)
from sqlalchemy.dialects.postgresql import JSONB, UUID
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from .db import Base


class User(Base):
    """Core user account for authentication and authorization."""

    __tablename__ = "users"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    email = Column(String, unique=True, nullable=False, index=True)  # CITEXT in DB
    password_hash = Column(Text, nullable=False)
    first_name = Column(String(100))
    last_name = Column(String(100))
    role = Column(String, nullable=False, default="student")  # student, admin
    created_at = Column(
        DateTime(timezone=True), nullable=False, server_default=func.now()
    )
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # Relationships
    sessions = relationship(
        "Session", back_populates="user", cascade="all, delete-orphan"
    )
    password_reset_tokens = relationship(
        "PasswordResetToken", back_populates="user", cascade="all, delete-orphan"
    )
    categories = relationship(
        "Category", back_populates="user", cascade="all, delete-orphan"
    )
    transactions = relationship(
        "Transaction", back_populates="user", cascade="all, delete-orphan"
    )
    notification_preferences = relationship(
        "NotificationPreference",
        back_populates="user",
        uselist=False,
        cascade="all, delete-orphan",
    )
    category_thresholds = relationship(
        "CategoryThreshold", back_populates="user", cascade="all, delete-orphan"
    )
    notification_events = relationship(
        "NotificationEvent", back_populates="user", cascade="all, delete-orphan"
    )


class Session(Base):
    """Refresh token sessions for JWT authentication."""

    __tablename__ = "sessions"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(
        UUID(as_uuid=True),
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    refresh_token_hash = Column(Text, nullable=False, index=True)
    expires_at = Column(DateTime(timezone=True), nullable=False, index=True)
    created_at = Column(
        DateTime(timezone=True), nullable=False, server_default=func.now()
    )
    revoked_at = Column(DateTime(timezone=True))

    # Relationships
    user = relationship("User", back_populates="sessions")


class PasswordResetToken(Base):
    """One-time tokens for password reset flow."""

    __tablename__ = "password_reset_tokens"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(
        UUID(as_uuid=True),
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    token_hash = Column(Text, nullable=False, index=True)
    expires_at = Column(DateTime(timezone=True), nullable=False, index=True)
    used_at = Column(DateTime(timezone=True))
    created_at = Column(
        DateTime(timezone=True), nullable=False, server_default=func.now()
    )

    # Relationships
    user = relationship("User", back_populates="password_reset_tokens")


class Category(Base):
    """Budget categories with optional spending limits."""

    __tablename__ = "categories"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(
        UUID(as_uuid=True),
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    name = Column(Text, nullable=False)
    monthly_limit_cents = Column(Integer)  # Optional spending limit in cents
    is_default = Column(Boolean, nullable=False, default=False)
    created_at = Column(
        DateTime(timezone=True), nullable=False, server_default=func.now()
    )

    # Relationships
    user = relationship("User", back_populates="categories")
    transactions = relationship("Transaction", back_populates="category")
    category_thresholds = relationship("CategoryThreshold", back_populates="category")
    notification_events = relationship("NotificationEvent", back_populates="category")

    __table_args__ = (
        # Unique constraint: user cannot have duplicate category names
        CheckConstraint("name IS NOT NULL", name="categories_name_not_null"),
    )


class Transaction(Base):
    """Unified income and expense transactions."""

    __tablename__ = "transactions"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(
        UUID(as_uuid=True),
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    category_id = Column(
        UUID(as_uuid=True), ForeignKey("categories.id", ondelete="SET NULL")
    )
    type = Column(String, nullable=False)  # 'income' or 'expense'
    amount_cents = Column(Integer, nullable=False)  # Amount in cents
    occurred_at = Column(DateTime(timezone=True), nullable=False, index=True)
    description = Column(Text)
    receipt_url = Column(Text)
    metadata_ = Column("metadata", JSONB)  # Flexible storage for additional data
    created_at = Column(
        DateTime(timezone=True), nullable=False, server_default=func.now()
    )

    # Relationships
    user = relationship("User", back_populates="transactions")
    category = relationship("Category", back_populates="transactions")

    __table_args__ = (
        CheckConstraint(
            "type IN ('income', 'expense')", name="transactions_type_check"
        ),
    )


class NotificationPreference(Base):
    """User preferences for notifications."""

    __tablename__ = "notification_preferences"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(
        UUID(as_uuid=True),
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
        unique=True,
    )
    email_enabled = Column(Boolean, nullable=False, default=True)
    sms_enabled = Column(Boolean, nullable=False, default=False)
    low_balance_threshold_cents = Column(Integer)
    quiet_hours = Column(JSONB)  # e.g., {"start": "22:00", "end": "07:00"}
    created_at = Column(
        DateTime(timezone=True), nullable=False, server_default=func.now()
    )

    # Relationships
    user = relationship("User", back_populates="notification_preferences")


class CategoryThreshold(Base):
    """Alert thresholds for specific categories."""

    __tablename__ = "category_thresholds"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(
        UUID(as_uuid=True),
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
    )
    category_id = Column(
        UUID(as_uuid=True),
        ForeignKey("categories.id", ondelete="CASCADE"),
        nullable=False,
    )
    threshold_cents = Column(Integer, nullable=False)

    # Relationships
    user = relationship("User", back_populates="category_thresholds")
    category = relationship("Category", back_populates="category_thresholds")


class NotificationEvent(Base):
    """Log of notification events sent to users."""

    __tablename__ = "notification_events"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(
        UUID(as_uuid=True),
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    category_id = Column(
        UUID(as_uuid=True), ForeignKey("categories.id", ondelete="SET NULL")
    )
    kind = Column(Text, nullable=False)  # e.g., LOW_BALANCE, DIGEST
    channel = Column(Text, nullable=False)  # email, sms, inapp
    payload = Column(JSONB)
    sent_at = Column(DateTime(timezone=True), index=True)
    status = Column(Text)  # queued, sent, failed
    created_at = Column(
        DateTime(timezone=True), nullable=False, server_default=func.now()
    )

    # Relationships
    user = relationship("User", back_populates="notification_events")
    category = relationship("Category", back_populates="notification_events")
