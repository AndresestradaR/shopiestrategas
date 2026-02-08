import uuid

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.api.deps import get_db, require_active_tenant
from app.models.product import Product, ProductImage
from app.models.tenant import Tenant
from app.models.upsell import Upsell, UpsellConfig
from app.schemas.store import (
    UpsellConfigResponse,
    UpsellConfigUpdate,
    UpsellCreate,
    UpsellResponse,
)

router = APIRouter(prefix="/api/admin/upsells", tags=["admin-upsells"])


# ── Config endpoints ────────────────────────────────────────────────

@router.get("/config", response_model=UpsellConfigResponse)
async def get_upsell_config(
    db: AsyncSession = Depends(get_db),
    tenant: Tenant = Depends(require_active_tenant),
):
    result = await db.execute(
        select(UpsellConfig).where(UpsellConfig.tenant_id == tenant.id)
    )
    config = result.scalar_one_or_none()
    if not config:
        config = UpsellConfig(tenant_id=tenant.id)
        db.add(config)
        await db.flush()
        await db.refresh(config)
    return config


@router.put("/config", response_model=UpsellConfigResponse)
async def update_upsell_config(
    data: UpsellConfigUpdate,
    db: AsyncSession = Depends(get_db),
    tenant: Tenant = Depends(require_active_tenant),
):
    result = await db.execute(
        select(UpsellConfig).where(UpsellConfig.tenant_id == tenant.id)
    )
    config = result.scalar_one_or_none()
    if not config:
        config = UpsellConfig(tenant_id=tenant.id)
        db.add(config)
        await db.flush()

    for key, value in data.model_dump(exclude_unset=True).items():
        setattr(config, key, value)

    await db.flush()
    await db.refresh(config)
    return config


# ── Helper: enrich upsell with product info ─────────────────────────

async def _enrich_product_info(upsell: Upsell, db: AsyncSession) -> dict:
    """Convert Upsell ORM to dict with upsell_product info."""
    data = {c.name: getattr(upsell, c.name) for c in upsell.__table__.columns}
    data["upsell_product"] = None

    if upsell.upsell_product_id:
        result = await db.execute(
            select(Product)
            .where(Product.id == upsell.upsell_product_id)
            .options(selectinload(Product.images))
        )
        product = result.scalar_one_or_none()
        if product:
            img = None
            if product.images:
                img = product.images[0].image_url
            data["upsell_product"] = {
                "id": product.id,
                "name": product.name,
                "price": float(product.price),
                "image_url": img,
            }
    return data


# ── CRUD endpoints ──────────────────────────────────────────────────

@router.get("", response_model=list[UpsellResponse])
async def list_upsells(
    db: AsyncSession = Depends(get_db),
    tenant: Tenant = Depends(require_active_tenant),
):
    result = await db.execute(
        select(Upsell)
        .where(Upsell.tenant_id == tenant.id)
        .order_by(Upsell.priority.desc(), Upsell.created_at.desc())
    )
    upsells = result.scalars().all()
    return [await _enrich_product_info(u, db) for u in upsells]


@router.get("/{upsell_id}", response_model=UpsellResponse)
async def get_upsell(
    upsell_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    tenant: Tenant = Depends(require_active_tenant),
):
    result = await db.execute(
        select(Upsell).where(Upsell.id == upsell_id, Upsell.tenant_id == tenant.id)
    )
    upsell = result.scalar_one_or_none()
    if not upsell:
        raise HTTPException(status_code=404, detail="Upsell not found")
    return await _enrich_product_info(upsell, db)


@router.post("", response_model=UpsellResponse, status_code=status.HTTP_201_CREATED)
async def create_upsell(
    data: UpsellCreate,
    db: AsyncSession = Depends(get_db),
    tenant: Tenant = Depends(require_active_tenant),
):
    upsell_data = data.model_dump()
    # Convert string product_id to UUID if present
    pid = upsell_data.pop("upsell_product_id", None)
    upsell = Upsell(
        tenant_id=tenant.id,
        upsell_product_id=uuid.UUID(pid) if pid else None,
        **upsell_data,
    )
    db.add(upsell)
    await db.flush()
    await db.refresh(upsell)
    return await _enrich_product_info(upsell, db)


@router.put("/{upsell_id}", response_model=UpsellResponse)
async def update_upsell(
    upsell_id: uuid.UUID,
    data: UpsellCreate,
    db: AsyncSession = Depends(get_db),
    tenant: Tenant = Depends(require_active_tenant),
):
    result = await db.execute(
        select(Upsell).where(Upsell.id == upsell_id, Upsell.tenant_id == tenant.id)
    )
    upsell = result.scalar_one_or_none()
    if not upsell:
        raise HTTPException(status_code=404, detail="Upsell not found")

    update_data = data.model_dump()
    pid = update_data.pop("upsell_product_id", None)
    upsell.upsell_product_id = uuid.UUID(pid) if pid else None

    for key, value in update_data.items():
        setattr(upsell, key, value)

    await db.flush()
    await db.refresh(upsell)
    return await _enrich_product_info(upsell, db)


@router.patch("/{upsell_id}/toggle", response_model=UpsellResponse)
async def toggle_upsell(
    upsell_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    tenant: Tenant = Depends(require_active_tenant),
):
    result = await db.execute(
        select(Upsell).where(Upsell.id == upsell_id, Upsell.tenant_id == tenant.id)
    )
    upsell = result.scalar_one_or_none()
    if not upsell:
        raise HTTPException(status_code=404, detail="Upsell not found")
    upsell.is_active = not upsell.is_active
    await db.flush()
    await db.refresh(upsell)
    return await _enrich_product_info(upsell, db)


@router.post("/{upsell_id}/duplicate", response_model=UpsellResponse, status_code=status.HTTP_201_CREATED)
async def duplicate_upsell(
    upsell_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    tenant: Tenant = Depends(require_active_tenant),
):
    result = await db.execute(
        select(Upsell).where(Upsell.id == upsell_id, Upsell.tenant_id == tenant.id)
    )
    upsell = result.scalar_one_or_none()
    if not upsell:
        raise HTTPException(status_code=404, detail="Upsell not found")

    # Copy all columns except id, timestamps, and stats
    skip = {"id", "created_at", "updated_at", "impressions", "accepted_count"}
    new_data = {c.name: getattr(upsell, c.name) for c in upsell.__table__.columns if c.name not in skip}
    new_data["name"] = f"{upsell.name} (copia)"
    new_data["is_active"] = False

    new_upsell = Upsell(**new_data)
    db.add(new_upsell)
    await db.flush()
    await db.refresh(new_upsell)
    return await _enrich_product_info(new_upsell, db)


@router.delete("/{upsell_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_upsell(
    upsell_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    tenant: Tenant = Depends(require_active_tenant),
):
    result = await db.execute(
        select(Upsell).where(Upsell.id == upsell_id, Upsell.tenant_id == tenant.id)
    )
    upsell = result.scalar_one_or_none()
    if not upsell:
        raise HTTPException(status_code=404, detail="Upsell not found")
    await db.delete(upsell)
