import uuid

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.api.deps import get_db, require_active_tenant
from app.models.product import Product, ProductImage
from app.models.tenant import Tenant
from app.models.upsell_tick import UpsellTick
from app.schemas.store import UpsellTickCreate, UpsellTickResponse

router = APIRouter(prefix="/api/admin/upsell-ticks", tags=["admin-upsell-ticks"])


async def _enrich_tick_product_info(tick: UpsellTick, db: AsyncSession) -> dict:
    """Convert UpsellTick ORM to dict with linked_product info."""
    data = {c.name: getattr(tick, c.name) for c in tick.__table__.columns}
    data["linked_product"] = None

    if tick.link_product and tick.linked_product_id:
        result = await db.execute(
            select(Product)
            .where(Product.id == tick.linked_product_id)
            .options(selectinload(Product.images))
        )
        product = result.scalar_one_or_none()
        if product:
            img = None
            if product.images:
                img = product.images[0].image_url
            data["linked_product"] = {
                "id": product.id,
                "name": product.name,
                "price": float(product.price),
                "image_url": img,
            }
    return data


@router.get("", response_model=list[UpsellTickResponse])
async def list_upsell_ticks(
    db: AsyncSession = Depends(get_db),
    tenant: Tenant = Depends(require_active_tenant),
):
    result = await db.execute(
        select(UpsellTick)
        .where(UpsellTick.tenant_id == tenant.id)
        .order_by(UpsellTick.priority.desc(), UpsellTick.created_at.desc())
    )
    ticks = result.scalars().all()
    return [await _enrich_tick_product_info(t, db) for t in ticks]


@router.get("/{tick_id}", response_model=UpsellTickResponse)
async def get_upsell_tick(
    tick_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    tenant: Tenant = Depends(require_active_tenant),
):
    result = await db.execute(
        select(UpsellTick).where(UpsellTick.id == tick_id, UpsellTick.tenant_id == tenant.id)
    )
    tick = result.scalar_one_or_none()
    if not tick:
        raise HTTPException(status_code=404, detail="Upsell tick not found")
    return await _enrich_tick_product_info(tick, db)


@router.post("", response_model=UpsellTickResponse, status_code=status.HTTP_201_CREATED)
async def create_upsell_tick(
    data: UpsellTickCreate,
    db: AsyncSession = Depends(get_db),
    tenant: Tenant = Depends(require_active_tenant),
):
    tick_data = data.model_dump()
    pid = tick_data.pop("linked_product_id", None)
    tick = UpsellTick(
        tenant_id=tenant.id,
        linked_product_id=uuid.UUID(pid) if pid else None,
        **tick_data,
    )
    db.add(tick)
    await db.flush()
    await db.refresh(tick)
    return await _enrich_tick_product_info(tick, db)


@router.put("/{tick_id}", response_model=UpsellTickResponse)
async def update_upsell_tick(
    tick_id: uuid.UUID,
    data: UpsellTickCreate,
    db: AsyncSession = Depends(get_db),
    tenant: Tenant = Depends(require_active_tenant),
):
    result = await db.execute(
        select(UpsellTick).where(UpsellTick.id == tick_id, UpsellTick.tenant_id == tenant.id)
    )
    tick = result.scalar_one_or_none()
    if not tick:
        raise HTTPException(status_code=404, detail="Upsell tick not found")

    update_data = data.model_dump()
    pid = update_data.pop("linked_product_id", None)
    tick.linked_product_id = uuid.UUID(pid) if pid else None

    for key, value in update_data.items():
        setattr(tick, key, value)

    await db.flush()
    await db.refresh(tick)
    return await _enrich_tick_product_info(tick, db)


@router.patch("/{tick_id}/toggle", response_model=UpsellTickResponse)
async def toggle_upsell_tick(
    tick_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    tenant: Tenant = Depends(require_active_tenant),
):
    result = await db.execute(
        select(UpsellTick).where(UpsellTick.id == tick_id, UpsellTick.tenant_id == tenant.id)
    )
    tick = result.scalar_one_or_none()
    if not tick:
        raise HTTPException(status_code=404, detail="Upsell tick not found")
    tick.is_active = not tick.is_active
    await db.flush()
    await db.refresh(tick)
    return await _enrich_tick_product_info(tick, db)


@router.post("/{tick_id}/duplicate", response_model=UpsellTickResponse, status_code=status.HTTP_201_CREATED)
async def duplicate_upsell_tick(
    tick_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    tenant: Tenant = Depends(require_active_tenant),
):
    result = await db.execute(
        select(UpsellTick).where(UpsellTick.id == tick_id, UpsellTick.tenant_id == tenant.id)
    )
    tick = result.scalar_one_or_none()
    if not tick:
        raise HTTPException(status_code=404, detail="Upsell tick not found")

    skip = {"id", "created_at", "updated_at", "impressions", "accepted_count"}
    new_data = {c.name: getattr(tick, c.name) for c in tick.__table__.columns if c.name not in skip}
    new_data["name"] = f"{tick.name} (copia)"
    new_data["is_active"] = False

    new_tick = UpsellTick(**new_data)
    db.add(new_tick)
    await db.flush()
    await db.refresh(new_tick)
    return await _enrich_tick_product_info(new_tick, db)


@router.delete("/{tick_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_upsell_tick(
    tick_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    tenant: Tenant = Depends(require_active_tenant),
):
    result = await db.execute(
        select(UpsellTick).where(UpsellTick.id == tick_id, UpsellTick.tenant_id == tenant.id)
    )
    tick = result.scalar_one_or_none()
    if not tick:
        raise HTTPException(status_code=404, detail="Upsell tick not found")
    await db.delete(tick)
