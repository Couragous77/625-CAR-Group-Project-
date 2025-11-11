from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .auth_router import router as auth_router
from .categories_router import router as categories_router
from .config import settings
from .files_router import ensure_upload_dir, router as files_router
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
    """Health check endpoint."""
    return {"status": "ok"}


# Include routers
app.include_router(auth_router)
app.include_router(password_reset_router)
app.include_router(categories_router, prefix="/api/categories", tags=["categories"])
app.include_router(transactions_router)
app.include_router(files_router)


# Future routers to be added:
# from app.routers import notifications
# app.include_router(notifications.router, prefix="/api/notifications", tags=["notifications"])
