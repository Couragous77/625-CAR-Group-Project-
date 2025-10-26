from datetime import datetime

from sqlalchemy import (
    Boolean,
    Column,
    DateTime,
    ForeignKey,
    Integer,
    Numeric,
    String,
    Text,
)
from sqlalchemy.orm import relationship

from .db import Base


class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True)
    email = Column(String(255), unique=True, nullable=False, index=True)
    hashed_password = Column(String(255), nullable=False)
    first_name = Column(String(100))
    last_name = Column(String(100))
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    expenses = relationship(
        "Expense", back_populates="user", cascade="all, delete-orphan"
    )
    income = relationship("Income", back_populates="user", cascade="all, delete-orphan")
    categories = relationship(
        "Category", back_populates="user", cascade="all, delete-orphan"
    )


class Category(Base):
    __tablename__ = "categories"
    id = Column(Integer, primary_key=True)
    user_id = Column(
        Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=True, index=True
    )
    name = Column(String(120), nullable=False)
    type = Column(String(20), nullable=False)  # "expense" or "income"
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    user = relationship("User", back_populates="categories")


class Expense(Base):
    __tablename__ = "expenses"
    id = Column(Integer, primary_key=True)
    user_id = Column(
        Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True
    )
    category_id = Column(
        Integer, ForeignKey("categories.id", ondelete="SET NULL"), nullable=True
    )
    amount = Column(Numeric(12, 2), nullable=False)
    date = Column(DateTime, default=datetime.utcnow, nullable=False)
    vendor = Column(String(255))
    payment_method = Column(String(50))
    tags = Column(String(255))  # comma-separated
    notes = Column(Text)

    user = relationship("User", back_populates="expenses")


class Income(Base):
    __tablename__ = "income"
    id = Column(Integer, primary_key=True)
    user_id = Column(
        Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True
    )
    category_id = Column(
        Integer, ForeignKey("categories.id", ondelete="SET NULL"), nullable=True
    )
    amount = Column(Numeric(12, 2), nullable=False)
    date = Column(DateTime, default=datetime.utcnow, nullable=False)
    source = Column(String(255))
    deposit_account = Column(String(50))
    reference = Column(String(120))
    notes = Column(Text)
    is_recurring = Column(Boolean, default=False, nullable=False)

    user = relationship("User", back_populates="income")
