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
    UniqueConstraint,
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
    
    bank_connections = relationship(
        "BankConnection", back_populates="user", cascade="all, delete-orphan"
    )
    imported_transactions = relationship(
        "ImportedTransaction", back_populates="user", cascade="all, delete-orphan"
    )
    goals = relationship(
        "Goal", back_populates="user", cascade="all, delete-orphan"
    )
    achievements = relationship(
        "Achievement", back_populates="user", cascade="all, delete-orphan"
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
    
    # we need the Unique constraints to prevent a user from having two categories with the same name.
    __table_args__ = (
        UniqueConstraint("user_id", "name", name="uq_categories_user_id_name"),
    )

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
    imported_transactions = relationship(
        "ImportedTransaction", back_populates="mapped_transaction"
    )

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

    # we need the Unique constraints to prevent a user from having two category thresholds for the same category
    __table_args__ = (
        UniqueConstraint(
            "user_id",
            "category_id",
            name="uq_category_thresholds_user_category",
        ),
    )

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

class BankConnection(Base):
    """Represents a linked banking provider connection (e.g. Plaid)."""

    __tablename__ = "bank_connections"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(
        UUID(as_uuid=True),
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    provider = Column(Text, nullable=False)  
    access_token_encrypted = Column(Text, nullable=False)
    status = Column(Text)  
    created_at = Column(
        DateTime(timezone=True), nullable=False, server_default=func.now()
    )

    # Relationships
    user = relationship("User", back_populates="bank_connections")
    accounts = relationship(
        "BankAccount", back_populates="connection", cascade="all, delete-orphan"
    )
    
class BankAccount(Base):
    """Individual bank account synced via a BankConnection."""

    __tablename__ = "bank_accounts"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    connection_id = Column(
        UUID(as_uuid=True),
        ForeignKey("bank_connections.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    external_account_id = Column(Text, nullable=False)
    name = Column(Text)
    mask = Column(Text)  # last 4 digits etc.
    type = Column(Text)  # checking, savings, credit
    currency = Column(Text, nullable=False, default="USD")
    created_at = Column(
        DateTime(timezone=True), nullable=False, server_default=func.now()
    )

    # Relationships
    connection = relationship("BankConnection", back_populates="accounts")
    imported_transactions = relationship(
        "ImportedTransaction",
        back_populates="bank_account",
        cascade="all, delete-orphan",
    )

    __table_args__ = (
        UniqueConstraint(
            "connection_id",
            "external_account_id",
            name="bank_accounts_unique",
        ),
    )
    
class ImportedTransaction(Base):
    """Raw transactions imported from a bank account, optionally mapped to a Transaction."""

    __tablename__ = "imported_transactions"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(
        UUID(as_uuid=True),
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    bank_account_id = Column(
        UUID(as_uuid=True),
        ForeignKey("bank_accounts.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    external_txn_id = Column(Text, nullable=False)
    raw = Column(JSONB, nullable=False)
    mapped_transaction_id = Column(
        UUID(as_uuid=True),
        ForeignKey("transactions.id", ondelete="SET NULL"),
        nullable=True,
    )
    occurred_at = Column(DateTime(timezone=True), nullable=False, index=True)
    amount_cents = Column(Integer, nullable=False)
    description = Column(Text)
    created_at = Column(
        DateTime(timezone=True), nullable=False, server_default=func.now()
    )

    # Relationships
    user = relationship("User", back_populates="imported_transactions")
    bank_account = relationship(
        "BankAccount", back_populates="imported_transactions"
    )
    mapped_transaction = relationship(
        "Transaction", back_populates="imported_transactions"
    )

    __table_args__ = (
        UniqueConstraint(
            "bank_account_id",
            "external_txn_id",
            name="imported_transactions_unique",
        ),
    )

class Goal(Base):
    """Savings or budgeting goal for a user."""

    __tablename__ = "goals"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(
        UUID(as_uuid=True),
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    name = Column(Text, nullable=False)
    target_cents = Column(Integer, nullable=False)
    target_date = Column(DateTime(timezone=False))  # DATE in DB; DATE maps fine from naive DateTime
    created_at = Column(
        DateTime(timezone=True), nullable=False, server_default=func.now()
    )

    # Relationships
    user = relationship("User", back_populates="goals")

class Achievement(Base):
    """Gamification badges / achievements unlocked by a user."""

    __tablename__ = "achievements"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(
        UUID(as_uuid=True),
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    code = Column(Text, nullable=False)
    awarded_at = Column(DateTime(timezone=True), nullable=False)

    # Relationships
    user = relationship("User", back_populates="achievements")

    __table_args__ = (
        UniqueConstraint(
            "user_id",
            "code",
            name="achievements_user_code_unique",
        ),
    )

