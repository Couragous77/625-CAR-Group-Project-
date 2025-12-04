from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, EmailStr, Field

from .notifications import find_low_funds_envelopes
from .email_service import send_email_notification
from .deps import get_current_user

router = APIRouter(
    prefix="/notifications",
    tags=["notifications"],
)

class EnvelopeInput(BaseModel):
    id: Optional[int] = None
    name: str
    balance: float = 0.0
    budgeted: float = 0.0

class LowFundsRequest(BaseModel):
    envelopes: List[EnvelopeInput]
    absolute_threshold: Optional[float] = None
    percentage_threshold: Optional[float] = 0.1

class LowFundsEnvelope(BaseModel):
    id: Optional[int]
    name: str
    balance: float
    budgeted: float
    reason: str

class LowFundsResponse(BaseModel):
    count: int
    envelopes: List[LowFundsEnvelope]

class LowFundsEmailRequest(LowFundsRequest):
    to_email: EmailStr
    subject: str = "Low funds alert from Budget CAR"

@router.post("/low-funds", response_model=LowFundsResponse)
def compute_low_funds(payload: LowFundsRequest, current_user=Depends(get_current_user)):
    data = find_low_funds_envelopes(
        [env.dict() for env in payload.envelopes],
        absolute_threshold=payload.absolute_threshold,
        percentage_threshold=payload.percentage_threshold,
    )
    return LowFundsResponse(count=len(data), envelopes=data)

@router.post("/low-funds/test-email", response_model=LowFundsResponse)
def compute_low_funds_and_email(payload: LowFundsEmailRequest, current_user=Depends(get_current_user)):
    data = find_low_funds_envelopes(
        [env.dict() for env in payload.envelopes],
        absolute_threshold=payload.absolute_threshold,
        percentage_threshold=payload.percentage_threshold,
    )

    body = "Low funds detected:\n" + "\n".join(
        f"{env['name']}: {env['reason']}" for env in data
    ) if data else "No low funds detected."

    send_email_notification(
        to_email=payload.to_email,
        subject=payload.subject,
        body=body
    )

    return LowFundsResponse(count=len(data), envelopes=data)
