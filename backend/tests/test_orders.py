import uuid

import pytest
import pytest_asyncio
from httpx import AsyncClient
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.order import Order, OrderItem
from app.models.tenant import Tenant


@pytest_asyncio.fixture
async def sample_order(db_session: AsyncSession, test_tenant: Tenant):
    order = Order(
        tenant_id=test_tenant.id,
        order_number="ORD-001",
        customer_name="Juan",
        customer_phone="3001234567",
        address="Calle 123",
        city="Bogotá",
        subtotal=89900,
        total=89900,
    )
    db_session.add(order)
    await db_session.flush()

    item = OrderItem(
        order_id=order.id,
        tenant_id=test_tenant.id,
        product_name="Producto Test",
        quantity=1,
        unit_price=89900,
        total_price=89900,
    )
    db_session.add(item)
    await db_session.commit()
    await db_session.refresh(order)
    return order


@pytest.mark.asyncio
async def test_list_orders(auth_client: AsyncClient, sample_order):
    response = await auth_client.get("/api/admin/orders")
    assert response.status_code == 200
    data = response.json()
    assert data["total"] >= 1


@pytest.mark.asyncio
async def test_get_order_detail(auth_client: AsyncClient, sample_order):
    response = await auth_client.get(f"/api/admin/orders/{sample_order.id}")
    assert response.status_code == 200
    data = response.json()
    assert data["order_number"] == "ORD-001"
    assert len(data["items"]) == 1


@pytest.mark.asyncio
async def test_update_order_status(auth_client: AsyncClient, sample_order):
    response = await auth_client.put(
        f"/api/admin/orders/{sample_order.id}/status",
        json={"status": "CONFIRMADO"},
    )
    assert response.status_code == 200
    assert response.json()["status"] == "CONFIRMADO"


@pytest.mark.asyncio
async def test_export_orders(auth_client: AsyncClient, sample_order):
    response = await auth_client.get("/api/admin/orders/export")
    assert response.status_code == 200
    assert "spreadsheetml" in response.headers["content-type"]
    assert len(response.content) > 0
