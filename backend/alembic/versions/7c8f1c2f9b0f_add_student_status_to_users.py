"""add student_status to users

Revision ID: 7c8f1c2f9b0f
Revises: 5b2a0f755bde
Create Date: 2025-11-25 00:00:00.000000
"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision: str = "7c8f1c2f9b0f"
down_revision: Union[str, None] = "5b2a0f755bde"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column("users", sa.Column("student_status", sa.String(length=100), nullable=True))


def downgrade() -> None:
    op.drop_column("users", "student_status")
