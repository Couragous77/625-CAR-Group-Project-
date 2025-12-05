"""add missing type column to categories

Revision ID: 8f1d2c3a4b5c
Revises: 7c8f1c2f9b0f
Create Date: 2025-11-26 00:00:00.000000
"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision: str = "8f1d2c3a4b5c"
down_revision: Union[str, None] = "7c8f1c2f9b0f"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Add the column if it does not exist (handles databases that missed the earlier migration)
    op.execute(
        sa.text(
            "ALTER TABLE categories ADD COLUMN IF NOT EXISTS type VARCHAR(255) DEFAULT 'expense';"
        )
    )
    # Ensure column is non-nullable going forward
    op.alter_column("categories", "type", existing_type=sa.String(), nullable=False)
    # Remove default after backfilling existing rows
    op.alter_column("categories", "type", server_default=None)


def downgrade() -> None:
    # Drop the column if it exists
    op.execute(sa.text("ALTER TABLE categories DROP COLUMN IF EXISTS type;"))
