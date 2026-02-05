import uuid

import pytest
import pytest_asyncio
from httpx import ASGITransport, AsyncClient
from sqlalchemy.ext.asyncio import AsyncSession

from app.main import app
from app.models.product import Product
from app.models.store_config import StoreConfig
from app.models.tenant import Tenant
from app.utils.security import hash_password


@pytest_asyncio.fixture
async def store_tenant(db_session: AsyncSession):
    tenant = Tenant(
        id=uuid.uuid4(),
        email="store@test.com",
        password_hash=hash_password("pass123"),
        store_name="Tienda Checkout",
        slug="tienda-checkout",
        country="CO",
    )
    db_session.add(tenant)
    await db_session.flush()

    config = StoreConfig(tenant_id=tenant.id)
    db_session.add(config)

    product = Product(
        id=uuid.uuid4(),
        tenant_id=tenant.id,
        name="Zapatillas",
        slug="zapatillas",
        price=89900,
        is_active=True,
    )
    db_session.add(product)
    await db_session.commit()
    await db_session.refresh(tenant)
    await db_session.refresh(product)
    return tenant, product


@pytest.mark.asyncio
async def test_create_order(store_tenant):
    tenant, product = store_tenant
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        response = await client.post(f"/api/store/{tenant.slug}/order", json={
            "customer_name": "Juan Pérez",
            "customer_phone": "3001234567",
            "address": "Calle 123 #45-67",
            "city": "Bogotá",
            "items": [{"product_id": str(product.id), "quantity": 1}],
        })
    assert response.status_code == 200
    data = response.json()
    assert "order_id" in data
    assert data["order_number"].startswith("ORD-")


@pytest.mark.asyncio
async def test_order_missing_fields(store_tenant):
    tenant, product = store_tenant
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        response = await client.post(f"/api/store/{tenant.slug}/order", json={
            "customer_name": "Juan",
            "items": [],
        })
    assert response.status_code in (400, 422)


@pytest.mark.asyncio
async def test_capture_abandoned_cart(store_tenant):
    tenant, product = store_tenant
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        response = await client.post(f"/api/store/{tenant.slug}/cart/capture", json={
            "session_id": "abc-123",
            "customer_name": "María",
            "customer_phone": "3009876543",
            "last_step": "phone",
        })
    assert response.status_code == 200
    assert response.json()["status"] == "captured"


@pytest.mark.asyncio
async def test_store_catalog(store_tenant):
    tenant, product = store_tenant
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        response = await client.get(f"/api/store/{tenant.slug}/products")
    assert response.status_code == 200
    data = response.json()
    assert len(data) >= 1
    assert data[0]["name"] == "Zapatillas"
