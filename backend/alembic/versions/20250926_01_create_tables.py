from alembic import op
import sqlalchemy as sa

revision = "20250926_01_create_tables"
down_revision = None
branch_labels = None
depends_on = None

def upgrade():
    op.create_table(
        "users",
        sa.Column("id", sa.Integer, primary_key=True),
        sa.Column("email", sa.String(255), nullable=False, unique=True),
        sa.Column("hashed_password", sa.String(255), nullable=False),
        sa.Column("first_name", sa.String(100)),
        sa.Column("last_name", sa.String(100)),
        sa.Column("created_at", sa.DateTime, server_default=sa.text("CURRENT_TIMESTAMP"), nullable=False),
    )
    op.create_index("ix_users_email", "users", ["email"], unique=True)

    op.create_table(
        "categories",
        sa.Column("id", sa.Integer, primary_key=True),
        sa.Column("user_id", sa.Integer, sa.ForeignKey("users.id", ondelete="CASCADE"), nullable=True),
        sa.Column("name", sa.String(120), nullable=False),
        sa.Column("type", sa.String(20), nullable=False),
        sa.Column("created_at", sa.DateTime, server_default=sa.text("CURRENT_TIMESTAMP"), nullable=False),
    )
    op.create_index("ix_categories_user", "categories", ["user_id"])

    op.create_table(
        "expenses",
        sa.Column("id", sa.Integer, primary_key=True),
        sa.Column("user_id", sa.Integer, sa.ForeignKey("users.id", ondelete="CASCADE"), nullable=False),
        sa.Column("category_id", sa.Integer, sa.ForeignKey("categories.id", ondelete="SET NULL"), nullable=True),
        sa.Column("amount", sa.Numeric(12,2), nullable=False),
        sa.Column("date", sa.DateTime, server_default=sa.text("CURRENT_TIMESTAMP"), nullable=False),
        sa.Column("vendor", sa.String(255)),
        sa.Column("payment_method", sa.String(50)),
        sa.Column("tags", sa.String(255)),
        sa.Column("notes", sa.Text),
    )
    op.create_index("ix_expenses_user", "expenses", ["user_id"])

    op.create_table(
        "income",
        sa.Column("id", sa.Integer, primary_key=True),
        sa.Column("user_id", sa.Integer, sa.ForeignKey("users.id", ondelete="CASCADE"), nullable=False),
        sa.Column("category_id", sa.Integer, sa.ForeignKey("categories.id", ondelete="SET NULL"), nullable=True),
        sa.Column("amount", sa.Numeric(12,2), nullable=False),
        sa.Column("date", sa.DateTime, server_default=sa.text("CURRENT_TIMESTAMP"), nullable=False),
        sa.Column("source", sa.String(255)),
        sa.Column("deposit_account", sa.String(50)),
        sa.Column("reference", sa.String(120)),
        sa.Column("notes", sa.Text),
        sa.Column("is_recurring", sa.Boolean, server_default=sa.text("false"), nullable=False),
    )
    op.create_index("ix_income_user", "income", ["user_id"])

def downgrade():
    op.drop_table("income")
    op.drop_table("expenses")
    op.drop_table("categories")
    op.drop_table("users")
