"""add_type_to_categories

Revision ID: 20241110_01
Revises: 20241104_01
Create Date: 2025-11-10

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '20241110_01'
down_revision = '20241104_01'
branch_labels = None
depends_on = None


def upgrade():
    # Add type column to categories table with default value 'expense'
    op.add_column('categories', sa.Column('type', sa.String(), nullable=False, server_default='expense'))
    
    # Remove server_default after setting initial values
    # (server_default is only for migration, not for future inserts)
    op.alter_column('categories', 'type', server_default=None)


def downgrade():
    op.drop_column('categories', 'type')
