import os
import uuid

from fastapi import APIRouter, UploadFile, File, Depends, HTTPException

from app.api.deps import get_current_tenant
from app.models.tenant import Tenant
from app.services.storage import upload_file

router = APIRouter(prefix="/api/admin/media", tags=["admin-media"])

ALLOWED_EXTENSIONS = {".jpg", ".jpeg", ".png", ".gif", ".webp", ".svg"}
MAX_FILE_SIZE = 10 * 1024 * 1024  # 10MB

CONTENT_TYPE_MAP = {
    ".jpg": "image/jpeg",
    ".jpeg": "image/jpeg",
    ".png": "image/png",
    ".gif": "image/gif",
    ".webp": "image/webp",
    ".svg": "image/svg+xml",
}


@router.post("/upload")
async def upload_media(
    file: UploadFile = File(...),
    current_tenant: Tenant = Depends(get_current_tenant),
):
    ext = os.path.splitext(file.filename or "")[1].lower()
    if ext not in ALLOWED_EXTENSIONS:
        raise HTTPException(
            400,
            f"Tipo de archivo no permitido. Usa: {', '.join(ALLOWED_EXTENSIONS)}",
        )

    contents = await file.read()
    if len(contents) > MAX_FILE_SIZE:
        raise HTTPException(400, "Archivo demasiado grande (maximo 10MB)")

    filename = f"{uuid.uuid4().hex}{ext}"
    key = f"media/{current_tenant.id}/{filename}"
    content_type = CONTENT_TYPE_MAP.get(ext, "application/octet-stream")

    url = upload_file(contents, key, content_type)

    return {"url": url, "filename": filename, "size": len(contents)}
