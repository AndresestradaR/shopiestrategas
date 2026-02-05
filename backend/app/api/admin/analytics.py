from datetime import datetime, timedelta, timezone

from fastapi import APIRouter, Depends
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_db, require_active_tenant
from app.models.abandoned_cart import AbandonedCart
from app.models.order import Order
from app.models.tenant import Tenant
from app.schemas.store import DashboardResponse

router = APIRouter(prefix="/api/admin/analytics", tags=["admin-analytics"])


@router.get("/dashboard", response_model=DashboardResponse)
async def dashboard(
    db: AsyncSession = Depends(get_db),
    tenant: Tenant = Depends(require_active_tenant),
):
    now = datetime.now(timezone.utc)
    today_start = now.replace(hour=0, minute=0, second=0, microsecond=0)
    week_ago = now - timedelta(days=7)

    orders_today_result = await db.execute(
        select(func.count())
        .select_from(Order)
        .where(Order.tenant_id == tenant.id, Order.created_at >= today_start)
    )
    orders_today = orders_today_result.scalar() or 0

    sales_today_result = await db.execute(
        select(func.coalesce(func.sum(Order.total), 0))
        .where(Order.tenant_id == tenant.id, Order.created_at >= today_start)
    )
    sales_today = float(sales_today_result.scalar() or 0)

    carts_week_result = await db.execute(
        select(func.count())
        .select_from(AbandonedCart)
        .where(AbandonedCart.tenant_id == tenant.id, AbandonedCart.created_at >= week_ago)
    )
    abandoned_carts_week = carts_week_result.scalar() or 0

    total_orders_result = await db.execute(
        select(func.count())
        .select_from(Order)
        .where(Order.tenant_id == tenant.id, Order.created_at >= week_ago)
    )
    total_orders_week = total_orders_result.scalar() or 0

    total_carts_week = abandoned_carts_week + total_orders_week
    conversion_rate = (total_orders_week / total_carts_week * 100) if total_carts_week > 0 else 0

    return DashboardResponse(
        orders_today=orders_today,
        sales_today=sales_today,
        abandoned_carts_week=abandoned_carts_week,
        conversion_rate=round(conversion_rate, 1),
    )
