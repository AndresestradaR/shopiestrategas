import os
import uuid

from fastapi import APIRouter, UploadFile, File, Depends, HTTPException

from app.api.deps import get_current_tenant
from app.config import settings
from app.models.tenant import Tenant

router = APIRouter(prefix="/api/admin/media", tags=["admin-media"])

ALLOWED_EXTENSIONS = {".jpg", ".jpeg", ".png", ".gif", ".webp", ".svg"}
MAX_FILE_SIZE = 10 * 1024 * 1024  # 10MB


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

    media_dir = os.path.join(settings.UPLOAD_DIR, "media", str(current_tenant.id))
    os.makedirs(media_dir, exist_ok=True)

    filename = f"{uuid.uuid4().hex}{ext}"
    filepath = os.path.join(media_dir, filename)

    with open(filepath, "wb") as f:
        f.write(contents)

    url = f"/uploads/media/{current_tenant.id}/{filename}"

    return {"url": url, "filename": filename, "size": len(contents)}
