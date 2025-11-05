from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .auth_router import router as auth_router
from .config import settings
from .password_reset_router import router as password_reset_router

app = FastAPI(title=settings.app_name)

# Configure CORS
origins = [o.strip() for o in settings.cors_origins.split(",") if o.strip()]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins or ["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health")
def health():
    """Health check endpoint."""
    return {"status": "ok"}


# Include routers
app.include_router(auth_router)
app.include_router(password_reset_router)


# Future routers to be added:
# from app.routers import expenses, income, categories, notifications
# app.include_router(categories.router, prefix="/api/categories", tags=["categories"])
# app.include_router(expenses.router, prefix="/api/expenses", tags=["expenses"])
# app.include_router(income.router, prefix="/api/income", tags=["income"])
# app.include_router(notifications.router, prefix="/api/notifications", tags=["notifications"])
