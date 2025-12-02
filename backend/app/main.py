from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import text

from .auth_router import router as auth_router
from .categories_router import router as categories_router
from .config import settings
from .db import SessionLocal
from .files_router import ensure_upload_dir, router as files_router
from .goals_router import router as goals_router
from .password_reset_router import router as password_reset_router
from .transactions_router import router as transactions_router

app = FastAPI(title=settings.app_name)


@app.on_event("startup")
async def startup_event():
    """Initialize resources on app startup."""
    # Create upload directory if it doesn't exist
    ensure_upload_dir()


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
    """Basic health check endpoint."""
    return {"status": "ok"}


@app.get("/health/ready")
def health_ready():
    """
    Readiness check - verifies the app can serve traffic.
    Checks database connectivity.
    """
    try:
        db = SessionLocal()
        db.execute(text("SELECT 1"))
        db.close()
        db_status = "connected"
    except Exception as e:
        db_status = f"error: {str(e)}"
        return {
            "status": "not_ready",
            "database": db_status,
            "environment": settings.env,
        }

    return {
        "status": "ready",
        "database": db_status,
        "environment": settings.env,
    }


@app.get("/health/live")
def health_live():
    """
    Liveness check - verifies the app process is running.
    Used by container orchestrators to determine if restart is needed.
    """
    return {"status": "alive"}


# Include routers
app.include_router(auth_router)
app.include_router(password_reset_router)
app.include_router(categories_router, prefix="/api/categories", tags=["categories"])
app.include_router(goals_router)
app.include_router(transactions_router)
app.include_router(files_router)


# Future routers to be added:
# from app.routers import notifications
# app.include_router(notifications.router, prefix="/api/notifications", tags=["notifications"])
