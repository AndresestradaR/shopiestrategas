import os
import uuid

from fastapi import HTTPException, UploadFile, status

from app.config import settings

ALLOWED_CONTENT_TYPES = {
    "image/jpeg",
    "image/png",
    "image/webp",
    "image/gif",
}

ALLOWED_EXTENSIONS = {".jpg", ".jpeg", ".png", ".webp", ".gif"}

MAX_FILE_SIZE = 5 * 1024 * 1024  # 5 MB


async def validate_and_save_image(
    file: UploadFile,
    tenant_id: uuid.UUID,
    subfolder: str = "products",
) -> str:
    """Validate an uploaded image file and save it to disk.

    Validates file type (JPEG, PNG, WebP, GIF only) and file size (max 5MB).
    Generates a unique filename using UUID and saves to the tenant's upload directory.

    Returns the URL path like ``/uploads/{tenant_id}/{subfolder}/{filename}``.
    Raises ``HTTPException`` on invalid file type or size.
    """

    # Validate content type
    if file.content_type not in ALLOWED_CONTENT_TYPES:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid file type '{file.content_type}'. Allowed: JPEG, PNG, WebP, GIF.",
        )

    # Validate extension
    ext = os.path.splitext(file.filename or "image.jpg")[1].lower()
    if ext not in ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid file extension '{ext}'. Allowed: {', '.join(ALLOWED_EXTENSIONS)}.",
        )

    # Read file content and validate size
    content = await file.read()
    if len(content) > MAX_FILE_SIZE:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"File too large. Maximum size is {MAX_FILE_SIZE // (1024 * 1024)}MB.",
        )

    # Generate unique filename
    filename = f"{uuid.uuid4()}{ext}"

    # Ensure upload directory exists
    upload_dir = os.path.join(settings.UPLOAD_DIR, str(tenant_id), subfolder)
    os.makedirs(upload_dir, exist_ok=True)

    # Save file
    filepath = os.path.join(upload_dir, filename)
    with open(filepath, "wb") as f:
        f.write(content)

    # Return URL path
    return f"/uploads/{tenant_id}/{subfolder}/{filename}"
