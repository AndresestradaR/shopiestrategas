import os
import shutil
import uuid

from fastapi import APIRouter, Depends, HTTPException, UploadFile
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_db, require_active_tenant
from app.config import settings
from app.models.store_config import StoreConfig
from app.models.tenant import Tenant
from app.schemas.store import StoreConfigResponse, StoreConfigUpdate

router = APIRouter(prefix="/api/admin/config", tags=["admin-config"])


@router.get("", response_model=StoreConfigResponse)
async def get_config(
    db: AsyncSession = Depends(get_db),
    tenant: Tenant = Depends(require_active_tenant),
):
    result = await db.execute(select(StoreConfig).where(StoreConfig.tenant_id == tenant.id))
    config = result.scalar_one_or_none()
    if not config:
        raise HTTPException(status_code=404, detail="Store config not found")
    return config


@router.put("", response_model=StoreConfigResponse)
async def update_config(
    data: StoreConfigUpdate,
    db: AsyncSession = Depends(get_db),
    tenant: Tenant = Depends(require_active_tenant),
):
    result = await db.execute(select(StoreConfig).where(StoreConfig.tenant_id == tenant.id))
    config = result.scalar_one_or_none()
    if not config:
        raise HTTPException(status_code=404, detail="Store config not found")

    for key, value in data.model_dump(exclude_unset=True).items():
        setattr(config, key, value)

    await db.flush()
    await db.refresh(config)
    return config


@router.post("/logo", response_model=StoreConfigResponse)
async def upload_logo(
    file: UploadFile,
    db: AsyncSession = Depends(get_db),
    tenant: Tenant = Depends(require_active_tenant),
):
    result = await db.execute(select(StoreConfig).where(StoreConfig.tenant_id == tenant.id))
    config = result.scalar_one_or_none()
    if not config:
        raise HTTPException(status_code=404, detail="Store config not found")

    upload_dir = os.path.join(settings.UPLOAD_DIR, str(tenant.id))
    os.makedirs(upload_dir, exist_ok=True)

    ext = os.path.splitext(file.filename or "logo.png")[1]
    filename = f"logo-{uuid.uuid4()}{ext}"
    filepath = os.path.join(upload_dir, filename)

    with open(filepath, "wb") as f:
        shutil.copyfileobj(file.file, f)

    config.logo_url = f"/uploads/{tenant.id}/{filename}"
    await db.flush()
    await db.refresh(config)
    return config
