import uuid
from datetime import datetime

from fastapi import APIRouter, Depends, HTTPException, Query
from fastapi.responses import StreamingResponse
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.api.deps import get_db, require_active_tenant
from app.models.order import Order, OrderItem
from app.models.tenant import Tenant
from app.schemas.order import OrderDetailResponse, OrderListResponse, OrderResponse, OrderUpdateNotes, OrderUpdateStatus
from app.services.dropi_export import generate_dropi_excel

router = APIRouter(prefix="/api/admin/orders", tags=["admin-orders"])


@router.get("", response_model=OrderListResponse)
async def list_orders(
    status: str | None = None,
    date_from: datetime | None = None,
    date_to: datetime | None = None,
    search: str | None = None,
    page: int = Query(1, ge=1),
    per_page: int = Query(20, ge=1, le=100),
    db: AsyncSession = Depends(get_db),
    tenant: Tenant = Depends(require_active_tenant),
):
    query = select(Order).where(Order.tenant_id == tenant.id)
    count_query = select(func.count()).select_from(Order).where(Order.tenant_id == tenant.id)

    if status:
        query = query.where(Order.status == status)
        count_query = count_query.where(Order.status == status)
    if date_from:
        query = query.where(Order.created_at >= date_from)
        count_query = count_query.where(Order.created_at >= date_from)
    if date_to:
        query = query.where(Order.created_at <= date_to)
        count_query = count_query.where(Order.created_at <= date_to)
    if search:
        search_filter = (
            Order.customer_name.ilike(f"%{search}%")
            | Order.customer_phone.ilike(f"%{search}%")
            | Order.order_number.ilike(f"%{search}%")
        )
        query = query.where(search_filter)
        count_query = count_query.where(search_filter)

    total = (await db.execute(count_query)).scalar() or 0
    query = query.order_by(Order.created_at.desc()).offset((page - 1) * per_page).limit(per_page)
    result = await db.execute(query)
    orders = result.scalars().all()

    return OrderListResponse(items=orders, total=total, page=page, per_page=per_page)


@router.get("/export")
async def export_orders(
    status: str | None = None,
    date_from: datetime | None = None,
    date_to: datetime | None = None,
    db: AsyncSession = Depends(get_db),
    tenant: Tenant = Depends(require_active_tenant),
):
    query = select(Order).where(Order.tenant_id == tenant.id).options(selectinload(Order.items))
    if status:
        query = query.where(Order.status == status)
    if date_from:
        query = query.where(Order.created_at >= date_from)
    if date_to:
        query = query.where(Order.created_at <= date_to)

    query = query.order_by(Order.created_at.desc())
    result = await db.execute(query)
    orders = result.scalars().all()

    excel_buffer = generate_dropi_excel(orders)
    return StreamingResponse(
        excel_buffer,
        media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        headers={"Content-Disposition": "attachment; filename=pedidos_dropi.xlsx"},
    )


@router.get("/{order_id}", response_model=OrderDetailResponse)
async def get_order(
    order_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    tenant: Tenant = Depends(require_active_tenant),
):
    result = await db.execute(
        select(Order)
        .where(Order.id == order_id, Order.tenant_id == tenant.id)
        .options(selectinload(Order.items))
    )
    order = result.scalar_one_or_none()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    return order


@router.put("/{order_id}/status", response_model=OrderDetailResponse)
async def update_order_status(
    order_id: uuid.UUID,
    data: OrderUpdateStatus,
    db: AsyncSession = Depends(get_db),
    tenant: Tenant = Depends(require_active_tenant),
):
    result = await db.execute(
        select(Order)
        .where(Order.id == order_id, Order.tenant_id == tenant.id)
        .options(selectinload(Order.items))
    )
    order = result.scalar_one_or_none()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")

    order.status = data.status
    await db.flush()

    result2 = await db.execute(
        select(Order).where(Order.id == order_id).options(selectinload(Order.items))
    )
    return result2.scalar_one()


@router.put("/{order_id}", response_model=OrderDetailResponse)
async def update_order_notes(
    order_id: uuid.UUID,
    data: OrderUpdateNotes,
    db: AsyncSession = Depends(get_db),
    tenant: Tenant = Depends(require_active_tenant),
):
    result = await db.execute(
        select(Order)
        .where(Order.id == order_id, Order.tenant_id == tenant.id)
        .options(selectinload(Order.items))
    )
    order = result.scalar_one_or_none()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")

    order.admin_notes = data.admin_notes
    await db.flush()

    result2 = await db.execute(
        select(Order).where(Order.id == order_id).options(selectinload(Order.items))
    )
    return result2.scalar_one()
