from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .auth_router import router as auth_router
from .password_reset_router import router as pr_router
from .config import settings
from .db import get_conn

app = FastAPI(title=settings.APP_NAME)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], allow_credentials=True, allow_methods=["*"], allow_headers=["*"],
)

@app.on_event("startup")
def _check_db():
    
    with get_conn() as conn:
        with conn.cursor() as cur:
            cur.execute("SELECT 1")

@app.get("/health")
def health():
    return {"ok": True}

app.include_router(auth_router)
app.include_router(pr_router)
