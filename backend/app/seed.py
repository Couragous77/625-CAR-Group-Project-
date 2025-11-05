from datetime import datetime, timedelta, timezone
from uuid import UUID

from . import models
from .db import Base, SessionLocal, engine
from .security import hash_password


def seed(db):
    """Populate database with seed data using fixed UUIDs for deterministic references."""

    # Fixed UUIDs for deterministic references (from schema)
    admin_id = UUID("11111111-1111-1111-1111-111111111111")
    courage_id = UUID("22222222-2222-2222-2222-222222222222")
    session_id = UUID("33333333-3333-3333-3333-333333333333")
    rent_cat_id = UUID("44444444-4444-4444-4444-444444444444")
    groceries_cat_id = UUID("55555555-5555-5555-5555-555555555555")
    transport_cat_id = UUID("66666666-6666-6666-6666-666666666666")

    # ================================
    # Users
    # ================================
    admin_email = "admin@example.com"
    if not db.query(models.User).filter_by(email=admin_email).first():
        admin = models.User(
            id=admin_id,
            email=admin_email,
            password_hash=hash_password("admin"),
            first_name="Admin",
            last_name="User",
            role="admin",
        )
        db.add(admin)
        print(f"✓ Created admin user: {admin_email}")

    courage_email = "courage@example.com"
    if not db.query(models.User).filter_by(email=courage_email).first():
        courage = models.User(
            id=courage_id,
            email=courage_email,
            password_hash=hash_password("courage"),
            first_name="Courage",
            last_name="Tikum",
            role="student",
        )
        db.add(courage)
        print(f"✓ Created student user: {courage_email}")

    db.flush()

    # ================================
    # Sessions (example active refresh token)
    # ================================
    if not db.query(models.Session).filter_by(id=session_id).first():
        session = models.Session(
            id=session_id,
            user_id=courage_id,
            refresh_token_hash="refhash_abc123",
            expires_at=datetime.now(timezone.utc) + timedelta(days=30),
        )
        db.add(session)
        print("✓ Created example session")

    # ================================
    # Categories
    # ================================
    categories_data = [
        (rent_cat_id, "Rent", 120000, True),
        (groceries_cat_id, "Groceries", 40000, False),
        (transport_cat_id, "Transport", 15000, False),
    ]

    for cat_id, name, limit, is_default in categories_data:
        if not db.query(models.Category).filter_by(id=cat_id).first():
            category = models.Category(
                id=cat_id,
                user_id=courage_id,
                name=name,
                monthly_limit_cents=limit,
                is_default=is_default,
            )
            db.add(category)
            print(f"✓ Created category: {name}")

    db.flush()

    # ================================
    # Transactions
    # ================================
    transactions_data = [
        (
            UUID("77777777-7777-7777-7777-777777777777"),
            rent_cat_id,
            "expense",
            120000,
            datetime.now(timezone.utc) - timedelta(days=3),
            "October Rent",
        ),
        (
            UUID("88888888-8888-8888-8888-888888888888"),
            groceries_cat_id,
            "expense",
            1250,
            datetime.now(timezone.utc) - timedelta(days=2),
            "Milk + Bread",
        ),
        (
            UUID("99999999-9999-9999-9999-999999999999"),
            None,
            "income",
            250000,
            datetime.now(timezone.utc) - timedelta(days=10),
            "Paycheck",
        ),
    ]

    for txn_id, cat_id, txn_type, amount, occurred_at, desc in transactions_data:
        if not db.query(models.Transaction).filter_by(id=txn_id).first():
            transaction = models.Transaction(
                id=txn_id,
                user_id=courage_id,
                category_id=cat_id,
                type=txn_type,
                amount_cents=amount,
                occurred_at=occurred_at,
                description=desc,
            )
            db.add(transaction)
            print(f"✓ Created transaction: {desc}")

    # ================================
    # Notification Preferences & Thresholds
    # ================================
    notif_pref_id = UUID("aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa")
    if not db.query(models.NotificationPreference).filter_by(id=notif_pref_id).first():
        notif_pref = models.NotificationPreference(
            id=notif_pref_id,
            user_id=courage_id,
            email_enabled=True,
            sms_enabled=False,
            low_balance_threshold_cents=5000,
            quiet_hours={"start": "22:00", "end": "07:00"},
        )
        db.add(notif_pref)
        print("✓ Created notification preferences")

    threshold_id = UUID("bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb")
    if not db.query(models.CategoryThreshold).filter_by(id=threshold_id).first():
        threshold = models.CategoryThreshold(
            id=threshold_id,
            user_id=courage_id,
            category_id=groceries_cat_id,
            threshold_cents=35000,
        )
        db.add(threshold)
        print("✓ Created category threshold")

    # ================================
    # Notification Events
    # ================================
    event_id = UUID("13131313-1313-1313-1313-131313131313")
    if not db.query(models.NotificationEvent).filter_by(id=event_id).first():
        event = models.NotificationEvent(
            id=event_id,
            user_id=courage_id,
            category_id=groceries_cat_id,
            kind="LOW_BALANCE",
            channel="email",
            payload={"remaining_cents": 5000},
            sent_at=datetime.now(timezone.utc) - timedelta(hours=1),
            status="sent",
        )
        db.add(event)
        print("✓ Created notification event")

    db.commit()
    print("\n✅ Seed complete!")
    print("Demo users:")
    print(f"  - Admin: {admin_email}")
    print(f"  - Student: {courage_email}")


if __name__ == "__main__":
    """Run seed script directly."""
    Base.metadata.create_all(bind=engine)
    with SessionLocal() as db:
        seed(db)
