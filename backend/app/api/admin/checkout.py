import uuid

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_db, require_active_tenant
from app.models.checkout_offer import CheckoutOffer
from app.models.tenant import Tenant
from app.schemas.store import CheckoutOfferCreate, CheckoutOfferResponse

router = APIRouter(prefix="/api/admin/checkout", tags=["admin-checkout"])


@router.get("/offers", response_model=list[CheckoutOfferResponse])
async def list_offers(
    db: AsyncSession = Depends(get_db),
    tenant: Tenant = Depends(require_active_tenant),
):
    result = await db.execute(
        select(CheckoutOffer).where(CheckoutOffer.tenant_id == tenant.id)
    )
    return result.scalars().all()


@router.post("/offers", response_model=CheckoutOfferResponse, status_code=status.HTTP_201_CREATED)
async def create_offer(
    data: CheckoutOfferCreate,
    db: AsyncSession = Depends(get_db),
    tenant: Tenant = Depends(require_active_tenant),
):
    offer = CheckoutOffer(tenant_id=tenant.id, **data.model_dump())
    db.add(offer)
    await db.flush()
    await db.refresh(offer)
    return offer


@router.put("/offers/{offer_id}", response_model=CheckoutOfferResponse)
async def update_offer(
    offer_id: uuid.UUID,
    data: CheckoutOfferCreate,
    db: AsyncSession = Depends(get_db),
    tenant: Tenant = Depends(require_active_tenant),
):
    result = await db.execute(
        select(CheckoutOffer).where(CheckoutOffer.id == offer_id, CheckoutOffer.tenant_id == tenant.id)
    )
    offer = result.scalar_one_or_none()
    if not offer:
        raise HTTPException(status_code=404, detail="Offer not found")

    for key, value in data.model_dump().items():
        setattr(offer, key, value)

    await db.flush()
    await db.refresh(offer)
    return offer


@router.delete("/offers/{offer_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_offer(
    offer_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    tenant: Tenant = Depends(require_active_tenant),
):
    result = await db.execute(
        select(CheckoutOffer).where(CheckoutOffer.id == offer_id, CheckoutOffer.tenant_id == tenant.id)
    )
    offer = result.scalar_one_or_none()
    if not offer:
        raise HTTPException(status_code=404, detail="Offer not found")
    await db.delete(offer)
