import os
import uuid
from pathlib import Path

from fastapi import APIRouter, Depends, File, HTTPException, UploadFile
from fastapi.responses import FileResponse

from . import models
from .deps import get_current_user

router = APIRouter(prefix="/api/files", tags=["files"])

# Upload directory - will be mounted as Docker volume
UPLOAD_DIR = Path("/app/uploads")


def ensure_upload_dir():
    """Create upload directory if it doesn't exist. Called on app startup."""
    UPLOAD_DIR.mkdir(parents=True, exist_ok=True)


# Allowed file extensions for receipts
ALLOWED_EXTENSIONS = {".jpg", ".jpeg", ".png", ".pdf", ".gif"}
MAX_FILE_SIZE = 10 * 1024 * 1024  # 10MB


@router.post("/receipts", status_code=201)
async def upload_receipt(
    file: UploadFile = File(...),
    current_user: models.User = Depends(get_current_user),
):
    """
    Upload a receipt image.

    Allowed formats: jpg, jpeg, png, pdf, gif
    Max size: 10MB

    Returns the URL path to use in transaction receipt_url field.
    """

    # Validate file extension
    file_ext = Path(file.filename).suffix.lower()
    if file_ext not in ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=400,
            detail=f"Invalid file type. Allowed: {', '.join(ALLOWED_EXTENSIONS)}",
        )

    # Read file and check size
    contents = await file.read()
    if len(contents) > MAX_FILE_SIZE:
        raise HTTPException(
            status_code=400,
            detail=f"File too large. Max size: {MAX_FILE_SIZE // (1024*1024)}MB",
        )

    # Generate unique filename: {user_id}_{uuid}{extension}
    unique_filename = f"{current_user.id}_{uuid.uuid4()}{file_ext}"
    file_path = UPLOAD_DIR / unique_filename

    # Save file
    with open(file_path, "wb") as f:
        f.write(contents)

    # Return URL path
    return {
        "url": f"/api/files/receipts/{unique_filename}",
        "filename": unique_filename,
    }


@router.get("/receipts/{filename}")
async def get_receipt(
    filename: str,
    current_user: models.User = Depends(get_current_user),
):
    """
    Retrieve a receipt file.

    Users can only access their own receipts. Admins can access all.
    """

    # Security: Check filename starts with user_id (unless admin)
    if current_user.role != "admin":
        if not filename.startswith(str(current_user.id)):
            raise HTTPException(status_code=403, detail="Access denied")

    file_path = UPLOAD_DIR / filename

    if not file_path.exists():
        raise HTTPException(status_code=404, detail="File not found")

    # Return file
    return FileResponse(file_path)


@router.delete("/receipts/{filename}", status_code=204)
async def delete_receipt(
    filename: str,
    current_user: models.User = Depends(get_current_user),
):
    """
    Delete a receipt file.

    Users can only delete their own receipts. Admins can delete any.
    """

    # Security: Check filename starts with user_id (unless admin)
    if current_user.role != "admin":
        if not filename.startswith(str(current_user.id)):
            raise HTTPException(status_code=403, detail="Access denied")

    file_path = UPLOAD_DIR / filename

    if not file_path.exists():
        raise HTTPException(status_code=404, detail="File not found")

    # Delete file
    os.remove(file_path)

    return None
