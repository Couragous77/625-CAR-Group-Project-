import psycopg2
from psycopg2.extras import RealDictCursor
from .config import settings

def get_conn():
    if not settings.DATABASE_URL:
        raise RuntimeError("DATABASE_URL is not set")
    return psycopg2.connect(settings.DATABASE_URL, cursor_factory=RealDictCursor)
