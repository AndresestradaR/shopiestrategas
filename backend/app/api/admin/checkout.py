import uuid

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.api.deps import get_db, require_active_tenant
from app.models.checkout_offer import QuantityOffer, QuantityOfferTier
from app.models.tenant import Tenant
from app.schemas.store import QuantityOfferCreate, QuantityOfferResponse

router = APIRouter(prefix="/api/admin/checkout", tags=["admin-checkout"])


@router.get("/offers", response_model=list[QuantityOfferResponse])
async def list_offers(
    db: AsyncSession = Depends(get_db),
    tenant: Tenant = Depends(require_active_tenant),
):
    result = await db.execute(
        select(QuantityOffer)
        .where(QuantityOffer.tenant_id == tenant.id)
        .options(selectinload(QuantityOffer.tiers))
        .order_by(QuantityOffer.priority.desc(), QuantityOffer.created_at.desc())
    )
    return result.scalars().all()


@router.get("/offers/{offer_id}", response_model=QuantityOfferResponse)
async def get_offer(
    offer_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    tenant: Tenant = Depends(require_active_tenant),
):
    result = await db.execute(
        select(QuantityOffer)
        .where(QuantityOffer.id == offer_id, QuantityOffer.tenant_id == tenant.id)
        .options(selectinload(QuantityOffer.tiers))
    )
    offer = result.scalar_one_or_none()
    if not offer:
        raise HTTPException(status_code=404, detail="Offer not found")
    return offer


@router.post("/offers", response_model=QuantityOfferResponse, status_code=status.HTTP_201_CREATED)
async def create_offer(
    data: QuantityOfferCreate,
    db: AsyncSession = Depends(get_db),
    tenant: Tenant = Depends(require_active_tenant),
):
    offer_data = data.model_dump(exclude={"tiers"})
    offer = QuantityOffer(tenant_id=tenant.id, **offer_data)
    db.add(offer)
    await db.flush()

    for tier_data in data.tiers:
        tier = QuantityOfferTier(offer_id=offer.id, **tier_data.model_dump())
        db.add(tier)

    await db.flush()
    # Reload with tiers
    result = await db.execute(
        select(QuantityOffer)
        .where(QuantityOffer.id == offer.id)
        .options(selectinload(QuantityOffer.tiers))
    )
    return result.scalar_one()


@router.put("/offers/{offer_id}", response_model=QuantityOfferResponse)
async def update_offer(
    offer_id: uuid.UUID,
    data: QuantityOfferCreate,
    db: AsyncSession = Depends(get_db),
    tenant: Tenant = Depends(require_active_tenant),
):
    result = await db.execute(
        select(QuantityOffer)
        .where(QuantityOffer.id == offer_id, QuantityOffer.tenant_id == tenant.id)
        .options(selectinload(QuantityOffer.tiers))
    )
    offer = result.scalar_one_or_none()
    if not offer:
        raise HTTPException(status_code=404, detail="Offer not found")

    # Update offer fields
    offer_data = data.model_dump(exclude={"tiers"})
    for key, value in offer_data.items():
        setattr(offer, key, value)

    # Replace tiers: delete old, create new
    for old_tier in list(offer.tiers):
        await db.delete(old_tier)
    await db.flush()

    for tier_data in data.tiers:
        tier = QuantityOfferTier(offer_id=offer.id, **tier_data.model_dump())
        db.add(tier)

    await db.flush()
    # Reload
    result = await db.execute(
        select(QuantityOffer)
        .where(QuantityOffer.id == offer.id)
        .options(selectinload(QuantityOffer.tiers))
    )
    return result.scalar_one()


@router.patch("/offers/{offer_id}/toggle", response_model=QuantityOfferResponse)
async def toggle_offer(
    offer_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    tenant: Tenant = Depends(require_active_tenant),
):
    result = await db.execute(
        select(QuantityOffer)
        .where(QuantityOffer.id == offer_id, QuantityOffer.tenant_id == tenant.id)
        .options(selectinload(QuantityOffer.tiers))
    )
    offer = result.scalar_one_or_none()
    if not offer:
        raise HTTPException(status_code=404, detail="Offer not found")

    offer.is_active = not offer.is_active
    await db.flush()
    await db.refresh(offer)
    return offer


@router.patch("/offers/{offer_id}/priority")
async def change_priority(
    offer_id: uuid.UUID,
    direction: str,
    db: AsyncSession = Depends(get_db),
    tenant: Tenant = Depends(require_active_tenant),
):
    if direction not in ("up", "down"):
        raise HTTPException(status_code=400, detail="Direction must be 'up' or 'down'")

    result = await db.execute(
        select(QuantityOffer)
        .where(QuantityOffer.id == offer_id, QuantityOffer.tenant_id == tenant.id)
    )
    offer = result.scalar_one_or_none()
    if not offer:
        raise HTTPException(status_code=404, detail="Offer not found")

    if direction == "up":
        offer.priority = offer.priority + 1
    else:
        offer.priority = max(0, offer.priority - 1)

    await db.flush()
    return {"status": "ok", "priority": offer.priority}


@router.post("/offers/{offer_id}/duplicate", response_model=QuantityOfferResponse, status_code=status.HTTP_201_CREATED)
async def duplicate_offer(
    offer_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    tenant: Tenant = Depends(require_active_tenant),
):
    result = await db.execute(
        select(QuantityOffer)
        .where(QuantityOffer.id == offer_id, QuantityOffer.tenant_id == tenant.id)
        .options(selectinload(QuantityOffer.tiers))
    )
    offer = result.scalar_one_or_none()
    if not offer:
        raise HTTPException(status_code=404, detail="Offer not found")

    new_offer = QuantityOffer(
        tenant_id=tenant.id,
        name=f"{offer.name} (copia)",
        is_active=False,
        priority=offer.priority,
        product_ids=offer.product_ids,
        bg_color=offer.bg_color,
        border_color=offer.border_color,
        selected_border_color=offer.selected_border_color,
        header_text=offer.header_text,
        header_bg_color=offer.header_bg_color,
        header_text_color=offer.header_text_color,
        hide_product_image=offer.hide_product_image,
        show_savings=offer.show_savings,
        show_per_unit=offer.show_per_unit,
    )
    db.add(new_offer)
    await db.flush()

    for tier in offer.tiers:
        new_tier = QuantityOfferTier(
            offer_id=new_offer.id,
            title=tier.title,
            quantity=tier.quantity,
            position=tier.position,
            is_preselected=tier.is_preselected,
            discount_type=tier.discount_type,
            discount_value=float(tier.discount_value),
            label_text=tier.label_text,
            label_bg_color=tier.label_bg_color,
            label_text_color=tier.label_text_color,
            price_color=tier.price_color,
            image_url=tier.image_url,
        )
        db.add(new_tier)

    await db.flush()
    result = await db.execute(
        select(QuantityOffer)
        .where(QuantityOffer.id == new_offer.id)
        .options(selectinload(QuantityOffer.tiers))
    )
    return result.scalar_one()


@router.delete("/offers/{offer_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_offer(
    offer_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    tenant: Tenant = Depends(require_active_tenant),
):
    result = await db.execute(
        select(QuantityOffer).where(QuantityOffer.id == offer_id, QuantityOffer.tenant_id == tenant.id)
    )
    offer = result.scalar_one_or_none()
    if not offer:
        raise HTTPException(status_code=404, detail="Offer not found")
    await db.delete(offer)
