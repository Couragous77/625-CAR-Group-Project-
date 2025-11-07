import sqlalchemy as sa
from alembic import op
from sqlalchemy.dialects.postgresql import JSONB, UUID

revision = "20241104_01"
down_revision = None
branch_labels = None
depends_on = None


def upgrade():
    # Enable extensions
    op.execute("CREATE EXTENSION IF NOT EXISTS citext")
    op.execute("CREATE EXTENSION IF NOT EXISTS pgcrypto")

    # ================================
    # Users table
    # ================================
    op.create_table(
        "users",
        sa.Column(
            "id",
            UUID(as_uuid=True),
            primary_key=True,
            server_default=sa.text("gen_random_uuid()"),
        ),
        sa.Column("email", sa.String, nullable=False, unique=True),
        sa.Column("password_hash", sa.Text, nullable=False),
        sa.Column("first_name", sa.String(100)),
        sa.Column("last_name", sa.String(100)),
        sa.Column("role", sa.String, nullable=False, server_default="student"),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            nullable=False,
            server_default=sa.text("now()"),
        ),
        sa.Column("updated_at", sa.DateTime(timezone=True)),
    )
    op.create_index("ix_users_email", "users", ["email"], unique=True)

    # ================================
    # Sessions table
    # ================================
    op.create_table(
        "sessions",
        sa.Column(
            "id",
            UUID(as_uuid=True),
            primary_key=True,
            server_default=sa.text("gen_random_uuid()"),
        ),
        sa.Column(
            "user_id",
            UUID(as_uuid=True),
            sa.ForeignKey("users.id", ondelete="CASCADE"),
            nullable=False,
        ),
        sa.Column("refresh_token_hash", sa.Text, nullable=False),
        sa.Column("expires_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            nullable=False,
            server_default=sa.text("now()"),
        ),
        sa.Column("revoked_at", sa.DateTime(timezone=True)),
    )
    op.create_index("ix_sessions_user_id", "sessions", ["user_id"])
    op.create_index(
        "ix_sessions_user_expires", "sessions", ["user_id", "expires_at"]
    )
    op.create_index(
        "ix_sessions_refresh_hash", "sessions", ["refresh_token_hash"]
    )

    # ================================
    # Password Reset Tokens table
    # ================================
    op.create_table(
        "password_reset_tokens",
        sa.Column(
            "id",
            UUID(as_uuid=True),
            primary_key=True,
            server_default=sa.text("gen_random_uuid()"),
        ),
        sa.Column(
            "user_id",
            UUID(as_uuid=True),
            sa.ForeignKey("users.id", ondelete="CASCADE"),
            nullable=False,
        ),
        sa.Column("token_hash", sa.Text, nullable=False),
        sa.Column("expires_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("used_at", sa.DateTime(timezone=True)),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            nullable=False,
            server_default=sa.text("now()"),
        ),
    )
    op.create_index("ix_prt_user_id", "password_reset_tokens", ["user_id"])
    op.create_index(
        "ix_prt_user_expires", "password_reset_tokens", ["user_id", "expires_at"]
    )
    op.create_index("ix_prt_token_hash", "password_reset_tokens", ["token_hash"])

    # ================================
    # Categories table
    # ================================
    op.create_table(
        "categories",
        sa.Column(
            "id",
            UUID(as_uuid=True),
            primary_key=True,
            server_default=sa.text("gen_random_uuid()"),
        ),
        sa.Column(
            "user_id",
            UUID(as_uuid=True),
            sa.ForeignKey("users.id", ondelete="CASCADE"),
            nullable=False,
        ),
        sa.Column("name", sa.Text, nullable=False),
        sa.Column("monthly_limit_cents", sa.Integer),
        sa.Column(
            "is_default", sa.Boolean, nullable=False, server_default="false"
        ),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            nullable=False,
            server_default=sa.text("now()"),
        ),
    )
    op.create_index("ix_categories_user_id", "categories", ["user_id"])

    # ================================
    # Transactions table
    # ================================
    op.create_table(
        "transactions",
        sa.Column(
            "id",
            UUID(as_uuid=True),
            primary_key=True,
            server_default=sa.text("gen_random_uuid()"),
        ),
        sa.Column(
            "user_id",
            UUID(as_uuid=True),
            sa.ForeignKey("users.id", ondelete="CASCADE"),
            nullable=False,
        ),
        sa.Column(
            "category_id",
            UUID(as_uuid=True),
            sa.ForeignKey("categories.id", ondelete="SET NULL"),
        ),
        sa.Column("type", sa.String, nullable=False),
        sa.Column("amount_cents", sa.Integer, nullable=False),
        sa.Column("occurred_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("description", sa.Text),
        sa.Column("receipt_url", sa.Text),
        sa.Column("metadata", JSONB),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            nullable=False,
            server_default=sa.text("now()"),
        ),
        sa.CheckConstraint(
            "type IN ('income', 'expense')", name="transactions_type_check"
        ),
    )
    op.create_index("ix_transactions_user_id", "transactions", ["user_id"])
    op.create_index(
        "ix_transactions_user_occurred", "transactions", ["user_id", "occurred_at"]
    )
    op.create_index(
        "ix_transactions_user_category",
        "transactions",
        ["user_id", "category_id", "occurred_at"],
    )
    op.create_index(
        "ix_transactions_user_type",
        "transactions",
        ["user_id", "type", "occurred_at"],
    )
    op.execute(
        "CREATE INDEX IF NOT EXISTS ix_transactions_metadata "
        "ON transactions USING GIN (metadata)"
    )

    # ================================
    # Notification Preferences table
    # ================================
    op.create_table(
        "notification_preferences",
        sa.Column(
            "id",
            UUID(as_uuid=True),
            primary_key=True,
            server_default=sa.text("gen_random_uuid()"),
        ),
        sa.Column(
            "user_id",
            UUID(as_uuid=True),
            sa.ForeignKey("users.id", ondelete="CASCADE"),
            nullable=False,
            unique=True,
        ),
        sa.Column(
            "email_enabled", sa.Boolean, nullable=False, server_default="true"
        ),
        sa.Column(
            "sms_enabled", sa.Boolean, nullable=False, server_default="false"
        ),
        sa.Column("low_balance_threshold_cents", sa.Integer),
        sa.Column("quiet_hours", JSONB),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            nullable=False,
            server_default=sa.text("now()"),
        ),
    )

    # ================================
    # Category Thresholds table
    # ================================
    op.create_table(
        "category_thresholds",
        sa.Column(
            "id",
            UUID(as_uuid=True),
            primary_key=True,
            server_default=sa.text("gen_random_uuid()"),
        ),
        sa.Column(
            "user_id",
            UUID(as_uuid=True),
            sa.ForeignKey("users.id", ondelete="CASCADE"),
            nullable=False,
        ),
        sa.Column(
            "category_id",
            UUID(as_uuid=True),
            sa.ForeignKey("categories.id", ondelete="CASCADE"),
            nullable=False,
        ),
        sa.Column("threshold_cents", sa.Integer, nullable=False),
    )

    # ================================
    # Notification Events table
    # ================================
    op.create_table(
        "notification_events",
        sa.Column(
            "id",
            UUID(as_uuid=True),
            primary_key=True,
            server_default=sa.text("gen_random_uuid()"),
        ),
        sa.Column(
            "user_id",
            UUID(as_uuid=True),
            sa.ForeignKey("users.id", ondelete="CASCADE"),
            nullable=False,
        ),
        sa.Column(
            "category_id",
            UUID(as_uuid=True),
            sa.ForeignKey("categories.id", ondelete="SET NULL"),
        ),
        sa.Column("kind", sa.Text, nullable=False),
        sa.Column("channel", sa.Text, nullable=False),
        sa.Column("payload", JSONB),
        sa.Column("sent_at", sa.DateTime(timezone=True)),
        sa.Column("status", sa.Text),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            nullable=False,
            server_default=sa.text("now()"),
        ),
    )
    op.create_index(
        "ix_notification_events_user_id", "notification_events", ["user_id"]
    )
    op.create_index(
        "ix_notification_events_user_sent",
        "notification_events",
        ["user_id", "sent_at"],
    )


def downgrade():
    op.drop_table("notification_events")
    op.drop_table("category_thresholds")
    op.drop_table("notification_preferences")
    op.drop_table("transactions")
    op.drop_table("categories")
    op.drop_table("password_reset_tokens")
    op.drop_table("sessions")
    op.drop_table("users")

    # Drop extensions
    op.execute("DROP EXTENSION IF EXISTS pgcrypto")
    op.execute("DROP EXTENSION IF EXISTS citext")
