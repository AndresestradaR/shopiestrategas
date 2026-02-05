import uuid

from fastapi import APIRouter, Depends, HTTPException, Query
from pydantic import BaseModel
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_db, require_active_tenant
from app.models.abandoned_cart import AbandonedCart
from app.models.tenant import Tenant

router = APIRouter(prefix="/api/admin/carts", tags=["admin-carts"])


class AbandonedCartResponse(BaseModel):
    id: uuid.UUID
    customer_name: str | None = None
    customer_phone: str | None = None
    customer_email: str | None = None
    product_name: str | None = None
    variant_name: str | None = None
    quantity: int | None = None
    total_value: float | None = None
    status: str
    last_step: str | None = None
    created_at: str | None = None

    model_config = {"from_attributes": True}


class CartListResponse(BaseModel):
    items: list[AbandonedCartResponse]
    total: int
    page: int
    per_page: int


class CartStatusUpdate(BaseModel):
    status: str


@router.get("", response_model=CartListResponse)
async def list_carts(
    status: str | None = None,
    page: int = Query(1, ge=1),
    per_page: int = Query(20, ge=1, le=100),
    db: AsyncSession = Depends(get_db),
    tenant: Tenant = Depends(require_active_tenant),
):
    query = select(AbandonedCart).where(AbandonedCart.tenant_id == tenant.id)
    count_query = select(func.count()).select_from(AbandonedCart).where(AbandonedCart.tenant_id == tenant.id)

    if status:
        query = query.where(AbandonedCart.status == status)
        count_query = count_query.where(AbandonedCart.status == status)

    total = (await db.execute(count_query)).scalar() or 0
    query = query.order_by(AbandonedCart.created_at.desc()).offset((page - 1) * per_page).limit(per_page)
    result = await db.execute(query)
    carts = result.scalars().all()

    return CartListResponse(items=carts, total=total, page=page, per_page=per_page)


@router.put("/{cart_id}/status", response_model=AbandonedCartResponse)
async def update_cart_status(
    cart_id: uuid.UUID,
    data: CartStatusUpdate,
    db: AsyncSession = Depends(get_db),
    tenant: Tenant = Depends(require_active_tenant),
):
    result = await db.execute(
        select(AbandonedCart).where(AbandonedCart.id == cart_id, AbandonedCart.tenant_id == tenant.id)
    )
    cart = result.scalar_one_or_none()
    if not cart:
        raise HTTPException(status_code=404, detail="Cart not found")

    cart.status = data.status
    await db.flush()
    await db.refresh(cart)
    return cart
