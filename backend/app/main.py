from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import os

app = FastAPI(title="Budget CAR API")

origins = [o.strip() for o in os.getenv("CORS_ORIGINS", "").split(",") if o.strip()]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins or ["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/health")
def health():
    return {"status": "ok"}

# from app.routers import auth, expenses, income
# app.include_router(auth.router, prefix="/auth", tags=["auth"])
# app.include_router(expenses.router, prefix="/expenses", tags=["expenses"])
# app.include_router(income.router, prefix="/income", tags=["income"])
