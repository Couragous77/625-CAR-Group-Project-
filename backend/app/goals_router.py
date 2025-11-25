"""
Goals Router

Handles listing and creating savings/budgeting goals for the current user.
"""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from . import models, schemas
from .deps import get_current_user, get_db

router = APIRouter(prefix="/api/goals", tags=["goals"])


@router.get("", response_model=list[schemas.GoalOut])
async def list_goals(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    """
    List all goals for the current user, newest first.
    """
    goals = (
        db.query(models.Goal)
        .filter(models.Goal.user_id == current_user.id)
        .order_by(models.Goal.created_at.desc())
        .all()
    )
    return goals


@router.post("", response_model=schemas.GoalOut, status_code=status.HTTP_201_CREATED)
async def create_goal(
    goal: schemas.GoalCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    """
    Create a new goal for the current user.
    """
    if goal.target_cents <= 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="target_cents must be greater than 0",
        )

    db_goal = models.Goal(
        user_id=current_user.id,
        name=goal.name,
        target_cents=goal.target_cents,
        target_date=goal.target_date,
    )
    db.add(db_goal)
    db.commit()
    db.refresh(db_goal)

    return db_goal
