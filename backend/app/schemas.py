from datetime import datetime
from typing import Optional

from pydantic import BaseModel, EmailStr, condecimal


class UserCreate(BaseModel):
    email: EmailStr
    password: str
    first_name: Optional[str] = None
    last_name: Optional[str] = None

class UserOut(BaseModel):
    id: int
    email: EmailStr
    first_name: Optional[str]
    last_name: Optional[str]
    created_at: datetime

    class Config:
        from_attributes = True


class CategoryCreate(BaseModel):
    name: str
    type: str

class CategoryOut(BaseModel):
    id: int
    name: str
    type: str

    class Config:
        from_attributes = True


class ExpenseCreate(BaseModel):
    category_id: Optional[int] = None
    amount: condecimal(max_digits=12, decimal_places=2)
    date: Optional[datetime] = None
    vendor: Optional[str] = None
    payment_method: Optional[str] = None
    tags: Optional[str] = None
    notes: Optional[str] = None

class ExpenseOut(BaseModel):
    id: int
    category_id: Optional[int]
    amount: condecimal(max_digits=12, decimal_places=2)
    date: datetime
    vendor: Optional[str]
    payment_method: Optional[str]
    tags: Optional[str]
    notes: Optional[str]

    class Config:
        from_attributes = True


class IncomeCreate(BaseModel):
    category_id: Optional[int] = None
    amount: condecimal(max_digits=12, decimal_places=2)
    date: Optional[datetime] = None
    source: Optional[str] = None
    deposit_account: Optional[str] = None
    reference: Optional[str] = None
    notes: Optional[str] = None
    is_recurring: bool = False

class IncomeOut(BaseModel):
    id: int
    category_id: Optional[int]
    amount: condecimal(max_digits=12, decimal_places=2)
    date: datetime
    source: Optional[str]
    deposit_account: Optional[str]
    reference: Optional[str]
    notes: Optional[str]
    is_recurring: bool

    class Config:
        from_attributes = True
