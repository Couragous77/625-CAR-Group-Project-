import os
from decimal import Decimal
from passlib.hash import bcrypt
from sqlalchemy.orm import Session
from .db import SessionLocal, engine, Base
from . import models

def seed(db: Session):
    email = os.getenv("SEED_USER_EMAIL", "student@school.edu")
    pwd = os.getenv("SEED_USER_PASSWORD", "password123")

    user = db.query(models.User).filter(models.User.email == email).first()
    if not user:
        user = models.User(email=email, hashed_password=bcrypt.hash(pwd), first_name="Demo", last_name="Student")
        db.add(user); db.flush()

    default_cats = [
        ("Textbooks", "expense"),
        ("Tuition", "expense"),
        ("Rent", "expense"),
        ("Food", "expense"),
        ("Entertainment", "expense"),
        ("Scholarship", "income"),
        ("Part-time Job", "income"),
    ]
    existing = {(c.name, c.type) for c in db.query(models.Category).filter((models.Category.user_id.is_(None)) | (models.Category.user_id == user.id)).all()}
    for name, ctype in default_cats:
        if (name, ctype) not in existing:
            db.add(models.Category(user_id=user.id, name=name, type=ctype))

    db.flush()

    food = db.query(models.Category).filter_by(user_id=user.id, name="Food", type="expense").first()
    rent = db.query(models.Category).filter_by(user_id=user.id, name="Rent", type="expense").first()
    job  = db.query(models.Category).filter_by(user_id=user.id, name="Part-time Job", type="income").first()

    if not db.query(models.Expense).filter_by(user_id=user.id, vendor="Campus Cafe").first():
        db.add(models.Expense(user_id=user.id, category_id=food.id if food else None,
                              amount=Decimal("12.50"), vendor="Campus Cafe", payment_method="Debit Card", tags="lunch"))
    if not db.query(models.Expense).filter_by(user_id=user.id, vendor="September Rent").first():
        db.add(models.Expense(user_id=user.id, category_id=rent.id if rent else None,
                              amount=Decimal("800.00"), vendor="September Rent", payment_method="Checking"))
    if not db.query(models.Income).filter_by(user_id=user.id, source="Part-time Job").first():
        db.add(models.Income(user_id=user.id, category_id=job.id if job else None,
                             amount=Decimal("300.00"), source="Part-time Job", deposit_account="Checking"))

    db.commit()
    print("Seed complete. Demo user:", email)

if __name__ == "__main__":
    Base.metadata.create_all(bind=engine)
    with SessionLocal() as db:
        seed(db)
