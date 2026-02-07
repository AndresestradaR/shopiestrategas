import os
import uuid

from fastapi import HTTPException, UploadFile, status

from app.services.storage import upload_file

ALLOWED_CONTENT_TYPES = {
    "image/jpeg",
    "image/png",
    "image/webp",
    "image/gif",
}

ALLOWED_EXTENSIONS = {".jpg", ".jpeg", ".png", ".webp", ".gif"}

MAX_FILE_SIZE = 5 * 1024 * 1024  # 5 MB

CONTENT_TYPE_MAP = {
    ".jpg": "image/jpeg",
    ".jpeg": "image/jpeg",
    ".png": "image/png",
    ".webp": "image/webp",
    ".gif": "image/gif",
}


async def validate_and_save_image(
    file: UploadFile,
    tenant_id: uuid.UUID,
    subfolder: str = "products",
) -> str:
    """Validate an uploaded image file and save it to storage.

    Validates file type (JPEG, PNG, WebP, GIF only) and file size (max 5MB).
    Generates a unique filename using UUID and uploads via storage service.

    Returns the public URL (R2) or relative path (local dev).
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

    # Generate unique filename and storage key
    filename = f"{uuid.uuid4()}{ext}"
    key = f"{tenant_id}/{subfolder}/{filename}"
    content_type = CONTENT_TYPE_MAP.get(ext, "image/jpeg")

    return upload_file(content, key, content_type)
