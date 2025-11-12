"""Transaction CRUD endpoints for income and expense management."""

from datetime import datetime, timedelta, timezone
from typing import Optional
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import func
from sqlalchemy.orm import Session

from . import models, schemas
from .db import get_db
from .deps import get_current_user

router = APIRouter(prefix="/api/transactions", tags=["transactions"])


@router.post("", response_model=schemas.TransactionOut, status_code=201)
def create_transaction(
    body: schemas.TransactionCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    """Create a new transaction (income or expense)."""

    # Validate: no future dates
    occurred_at = body.occurred_at or datetime.now(timezone.utc)
    if occurred_at > datetime.now(timezone.utc):
        raise HTTPException(
            status_code=400, detail="Transaction date cannot be in the future"
        )

    # Validate: category belongs to user (if provided)
    if body.category_id:
        category = (
            db.query(models.Category)
            .filter(
                models.Category.id == body.category_id,
                models.Category.user_id == current_user.id,
            )
            .first()
        )
        if not category:
            raise HTTPException(
                status_code=404, detail="Category not found or does not belong to user"
            )

    # Create transaction
    transaction = models.Transaction(
        user_id=current_user.id,
        category_id=body.category_id,
        type=body.type,
        amount_cents=body.amount_cents,
        occurred_at=occurred_at,
        description=body.description,
        receipt_url=body.receipt_url,
        metadata_=body.metadata_,
    )

    db.add(transaction)
    db.commit()
    db.refresh(transaction)

    # Return as dict to avoid SQLAlchemy metadata conflict
    return schemas.TransactionOut.model_validate(transaction, from_attributes=True)


@router.get("", response_model=list[schemas.TransactionOut])
def list_transactions(
    type: Optional[str] = Query(None, pattern="^(income|expense)$"),
    category_id: Optional[UUID] = None,
    start_date: Optional[datetime] = None,
    end_date: Optional[datetime] = None,
    min_amount: Optional[int] = None,
    max_amount: Optional[int] = None,
    sort_by: str = Query(
        "occurred_at", pattern="^(occurred_at|amount_cents|category_id)$"
    ),
    sort_order: str = Query("desc", pattern="^(asc|desc)$"),
    page: int = Query(1, ge=1),
    limit: int = Query(50, ge=1, le=100),
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    """
    List transactions with filtering, sorting, and pagination.

    Users see only their own transactions. Admins see all transactions.
    """

    # Base query - users see own, admins see all
    query = db.query(models.Transaction)
    if current_user.role != "admin":
        query = query.filter(models.Transaction.user_id == current_user.id)

    # Apply filters
    if type:
        query = query.filter(models.Transaction.type == type)

    if category_id:
        query = query.filter(models.Transaction.category_id == category_id)

    if start_date:
        query = query.filter(models.Transaction.occurred_at >= start_date)

    if end_date:
        query = query.filter(models.Transaction.occurred_at <= end_date)

    if min_amount is not None:
        query = query.filter(models.Transaction.amount_cents >= min_amount)

    if max_amount is not None:
        query = query.filter(models.Transaction.amount_cents <= max_amount)

    # Apply sorting
    sort_column = getattr(models.Transaction, sort_by)
    if sort_order == "desc":
        query = query.order_by(sort_column.desc())
    else:
        query = query.order_by(sort_column.asc())

    # Apply pagination
    offset = (page - 1) * limit
    transactions = query.offset(offset).limit(limit).all()

    # Return as validated models to avoid SQLAlchemy metadata conflict
    return [
        schemas.TransactionOut.model_validate(t, from_attributes=True)
        for t in transactions
    ]


@router.get("/{transaction_id}", response_model=schemas.TransactionOut)
def get_transaction(
    transaction_id: UUID,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    """Get a single transaction by ID."""

    # Base query
    query = db.query(models.Transaction).filter(models.Transaction.id == transaction_id)

    # Users can only see their own, admins see all
    if current_user.role != "admin":
        query = query.filter(models.Transaction.user_id == current_user.id)

    transaction = query.first()
    if not transaction:
        raise HTTPException(status_code=404, detail="Transaction not found")

    return schemas.TransactionOut.model_validate(transaction, from_attributes=True)


@router.put("/{transaction_id}", response_model=schemas.TransactionOut)
def update_transaction(
    transaction_id: UUID,
    body: schemas.TransactionCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    """Update a transaction (full replacement)."""

    # Find transaction (users can only update their own)
    query = db.query(models.Transaction).filter(models.Transaction.id == transaction_id)
    if current_user.role != "admin":
        query = query.filter(models.Transaction.user_id == current_user.id)

    transaction = query.first()
    if not transaction:
        raise HTTPException(status_code=404, detail="Transaction not found")

    # Validate: no future dates
    occurred_at = body.occurred_at or datetime.now(timezone.utc)
    if occurred_at > datetime.now(timezone.utc):
        raise HTTPException(
            status_code=400, detail="Transaction date cannot be in the future"
        )

    # Validate: category belongs to user (if provided)
    if body.category_id:
        category = (
            db.query(models.Category)
            .filter(
                models.Category.id == body.category_id,
                models.Category.user_id == current_user.id,
            )
            .first()
        )
        if not category:
            raise HTTPException(
                status_code=404, detail="Category not found or does not belong to user"
            )

    # Update fields
    transaction.category_id = body.category_id
    transaction.type = body.type
    transaction.amount_cents = body.amount_cents
    transaction.occurred_at = occurred_at
    transaction.description = body.description
    transaction.receipt_url = body.receipt_url
    transaction.metadata_ = body.metadata_

    db.commit()
    db.refresh(transaction)

    return schemas.TransactionOut.model_validate(transaction, from_attributes=True)


@router.delete("/{transaction_id}", status_code=204)
def delete_transaction(
    transaction_id: UUID,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    """Delete a transaction."""

    # Find transaction (users can only delete their own)
    query = db.query(models.Transaction).filter(models.Transaction.id == transaction_id)
    if current_user.role != "admin":
        query = query.filter(models.Transaction.user_id == current_user.id)

    transaction = query.first()
    if not transaction:
        raise HTTPException(status_code=404, detail="Transaction not found")

    db.delete(transaction)
    db.commit()

    return None


@router.get("/aggregates")
def get_transaction_aggregates(
    group_by: str = Query("category", pattern="^(category|period)$"),
    period: str = Query("monthly", pattern="^(weekly|monthly|yearly)$"),
    start_date: Optional[datetime] = None,
    end_date: Optional[datetime] = None,
    type: Optional[str] = Query(None, pattern="^(income|expense)$"),
    category_id: Optional[UUID] = None,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    """
    Aggregate transactions by category or time period.

    - **group_by**: 'category' or 'period'
    - **period**: 'weekly', 'monthly', or 'yearly' (used when group_by='period')
    - **start_date**: Filter transactions from this date
    - **end_date**: Filter transactions until this date
    - **type**: Filter by 'income' or 'expense'
    - **category_id**: Filter by specific category

    Returns aggregated data with totals and metadata.
    """

    # Base query - users see only their own transactions
    query = db.query(models.Transaction)
    if current_user.role != "admin":
        query = query.filter(models.Transaction.user_id == current_user.id)

    # Apply filters
    if type:
        query = query.filter(models.Transaction.type == type)

    if category_id:
        query = query.filter(models.Transaction.category_id == category_id)

    if start_date:
        query = query.filter(models.Transaction.occurred_at >= start_date)

    if end_date:
        query = query.filter(models.Transaction.occurred_at <= end_date)

    # Aggregate by category
    if group_by == "category":
        results = (
            query.with_entities(
                models.Transaction.category_id,
                models.Transaction.type,
                func.sum(models.Transaction.amount_cents).label("total_cents"),
                func.count(models.Transaction.id).label("count"),
            )
            .group_by(models.Transaction.category_id, models.Transaction.type)
            .all()
        )

        # Fetch category details and format response
        aggregates = []
        for row in results:
            category = None
            if row.category_id:
                category = (
                    db.query(models.Category)
                    .filter(models.Category.id == row.category_id)
                    .first()
                )

            aggregates.append(
                {
                    "category_id": str(row.category_id) if row.category_id else None,
                    "category_name": category.name if category else "Uncategorized",
                    "type": row.type,
                    "total_cents": row.total_cents or 0,
                    "count": row.count,
                }
            )

        return {
            "group_by": "category",
            "period": period,
            "aggregates": aggregates,
        }

    # Aggregate by time period
    else:  # group_by == "period"
        # Determine the date truncation based on period
        if period == "weekly":
            # PostgreSQL: date_trunc('week', occurred_at)
            # SQLite: strftime('%Y-%W', occurred_at) - but we'll use PostgreSQL
            date_group = func.date_trunc("week", models.Transaction.occurred_at)
        elif period == "monthly":
            date_group = func.date_trunc("month", models.Transaction.occurred_at)
        else:  # yearly
            date_group = func.date_trunc("year", models.Transaction.occurred_at)

        # Query with date grouping
        results = (
            query.with_entities(
                date_group.label("period_start"),
                models.Transaction.type,
                func.sum(models.Transaction.amount_cents).label("total_cents"),
                func.count(models.Transaction.id).label("count"),
            )
            .group_by("period_start", models.Transaction.type)
            .order_by("period_start")
            .all()
        )

        # Format response with period labels
        aggregates = []
        for row in results:
            period_start = row.period_start

            # Calculate period end based on period type
            if period == "weekly":
                period_end = period_start + timedelta(days=6)
            elif period == "monthly":
                # Last day of month
                if period_start.month == 12:
                    period_end = datetime(period_start.year + 1, 1, 1) - timedelta(
                        days=1
                    )
                else:
                    period_end = datetime(
                        period_start.year, period_start.month + 1, 1
                    ) - timedelta(days=1)
            else:  # yearly
                period_end = datetime(period_start.year, 12, 31)

            aggregates.append(
                {
                    "period_start": period_start.isoformat(),
                    "period_end": period_end.isoformat() if period_end else None,
                    "type": row.type,
                    "total_cents": row.total_cents or 0,
                    "count": row.count,
                }
            )

        return {
            "group_by": "period",
            "period": period,
            "aggregates": aggregates,
        }
