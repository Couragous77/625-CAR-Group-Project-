"""
Categories (Envelopes) Router

Handles CRUD operations for budget categories/envelopes with monthly spending limits.
"""

from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import func
from sqlalchemy.orm import Session

from . import models, schemas
from .deps import get_current_user, get_db

router = APIRouter()


@router.post("", response_model=schemas.CategoryOut, status_code=201)
async def create_category(
    category: schemas.CategoryCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    """
    Create a new category/envelope for the current user.

    - **name**: Category name (required)
    - **monthly_limit_cents**: Optional monthly spending limit in cents
    - **type**: Category type - 'income' or 'expense' (required)
    - **is_default**: Whether this is a default category (defaults to False)
    """
    # Validate type
    if category.type not in ["income", "expense"]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Category type must be 'income' or 'expense'",
        )

    # Check for duplicate category name for this user
    existing = (
        db.query(models.Category)
        .filter(
            models.Category.user_id == current_user.id,
            func.lower(models.Category.name) == func.lower(category.name),
        )
        .first()
    )

    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Category '{category.name}' already exists",
        )

    # Validate monthly_limit_cents if provided
    if category.monthly_limit_cents is not None and category.monthly_limit_cents < 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Monthly limit cannot be negative",
        )

    # Create new category
    db_category = models.Category(
        user_id=current_user.id,
        name=category.name,
        monthly_limit_cents=category.monthly_limit_cents,
        type=category.type,
        is_default=category.is_default,
    )

    db.add(db_category)
    db.commit()
    db.refresh(db_category)

    return db_category


@router.get("", response_model=list[schemas.CategoryOut])
async def list_categories(
    type: str = None,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    """
    List all categories/envelopes for the current user.

    Optional query parameters:
    - **type**: Filter by category type ('income' or 'expense')
    """
    query = db.query(models.Category).filter(models.Category.user_id == current_user.id)

    # Filter by type if provided
    if type:
        if type not in ["income", "expense"]:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Type must be 'income' or 'expense'",
            )
        query = query.filter(models.Category.type == type)

    # Order by default status first, then by name
    query = query.order_by(models.Category.is_default.desc(), models.Category.name)

    categories = query.all()
    return categories


@router.get("/{category_id}", response_model=schemas.CategoryOut)
async def get_category(
    category_id: UUID,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    """
    Get a specific category/envelope by ID.
    """
    category = (
        db.query(models.Category)
        .filter(
            models.Category.id == category_id,
            models.Category.user_id == current_user.id,
        )
        .first()
    )

    if not category:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Category not found",
        )

    return category


@router.put("/{category_id}", response_model=schemas.CategoryOut)
async def update_category(
    category_id: UUID,
    category_update: schemas.CategoryCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    """
    Update a category/envelope.

    - Default categories can be edited but their name and type should remain consistent
    - Custom categories can be fully edited
    """
    # Get existing category
    db_category = (
        db.query(models.Category)
        .filter(
            models.Category.id == category_id,
            models.Category.user_id == current_user.id,
        )
        .first()
    )

    if not db_category:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Category not found",
        )

    # Validate type
    if category_update.type not in ["income", "expense"]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Category type must be 'income' or 'expense'",
        )

    # Check for duplicate name (excluding current category)
    if category_update.name != db_category.name:
        existing = (
            db.query(models.Category)
            .filter(
                models.Category.user_id == current_user.id,
                models.Category.id != category_id,
                func.lower(models.Category.name) == func.lower(category_update.name),
            )
            .first()
        )

        if existing:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Category '{category_update.name}' already exists",
            )

    # Validate monthly_limit_cents if provided
    if (
        category_update.monthly_limit_cents is not None
        and category_update.monthly_limit_cents < 0
    ):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Monthly limit cannot be negative",
        )

    # Update category fields
    db_category.name = category_update.name
    db_category.monthly_limit_cents = category_update.monthly_limit_cents
    db_category.type = category_update.type
    # Note: is_default is not updated to prevent users from changing default status

    db.commit()
    db.refresh(db_category)

    return db_category


@router.delete("/{category_id}", status_code=204)
async def delete_category(
    category_id: UUID,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    """
    Delete a category/envelope.

    - Default categories cannot be deleted
    - Categories with existing transactions cannot be deleted
    """
    # Get category
    db_category = (
        db.query(models.Category)
        .filter(
            models.Category.id == category_id,
            models.Category.user_id == current_user.id,
        )
        .first()
    )

    if not db_category:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Category not found",
        )

    # Prevent deletion of default categories
    if db_category.is_default:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot delete default categories. You can edit them instead.",
        )

    # Check if category is used in any transactions
    transaction_count = (
        db.query(models.Transaction)
        .filter(models.Transaction.category_id == category_id)
        .count()
    )

    if transaction_count > 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Cannot delete category. It is used in {transaction_count} transaction(s). "
            "Please reassign or delete those transactions first.",
        )

    # Delete category
    db.delete(db_category)
    db.commit()

    return None
