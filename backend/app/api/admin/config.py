from fastapi import APIRouter, Depends, HTTPException, UploadFile
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_db, require_active_tenant
from app.models.store_config import StoreConfig
from app.models.tenant import Tenant
from app.schemas.store import StoreConfigResponse, StoreConfigUpdate
from app.services.image_upload import validate_and_save_image

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

    logo_url = await validate_and_save_image(file, tenant.id, subfolder="logos")

    config.logo_url = logo_url
    await db.flush()
    await db.refresh(config)
    return config
