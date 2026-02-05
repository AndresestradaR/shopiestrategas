import uuid

import pytest
import pytest_asyncio
from httpx import ASGITransport, AsyncClient
from sqlalchemy.ext.asyncio import AsyncSession

from app.main import app
from app.models.order import Order, OrderItem
from app.models.product import Product
from app.models.store_config import StoreConfig
from app.models.tenant import Tenant
from app.utils.security import create_access_token, hash_password


@pytest_asyncio.fixture
async def tenant_a(db_session: AsyncSession):
    tenant = Tenant(
        id=uuid.uuid4(),
        email="tenant_a@test.com",
        password_hash=hash_password("passA123"),
        store_name="Store A",
        slug="store-a",
        country="CO",
    )
    db_session.add(tenant)
    await db_session.commit()
    await db_session.refresh(tenant)
    return tenant


@pytest_asyncio.fixture
async def tenant_b(db_session: AsyncSession):
    tenant = Tenant(
        id=uuid.uuid4(),
        email="tenant_b@test.com",
        password_hash=hash_password("passB123"),
        store_name="Store B",
        slug="store-b",
        country="MX",
    )
    db_session.add(tenant)
    await db_session.commit()
    await db_session.refresh(tenant)
    return tenant


@pytest_asyncio.fixture
async def client_a(tenant_a: Tenant):
    token = create_access_token({"sub": str(tenant_a.id)})
    transport = ASGITransport(app=app)
    async with AsyncClient(
        transport=transport,
        base_url="http://test",
        headers={"Authorization": f"Bearer {token}"},
    ) as ac:
        yield ac


@pytest_asyncio.fixture
async def client_b(tenant_b: Tenant):
    token = create_access_token({"sub": str(tenant_b.id)})
    transport = ASGITransport(app=app)
    async with AsyncClient(
        transport=transport,
        base_url="http://test",
        headers={"Authorization": f"Bearer {token}"},
    ) as ac:
        yield ac


@pytest_asyncio.fixture
async def product_a(client_a: AsyncClient):
    """Create a product owned by tenant A."""
    response = await client_a.post("/api/admin/products", json={
        "name": "Producto Tenant A",
        "price": 50000,
        "description": "Belongs to tenant A",
    })
    assert response.status_code == 201
    return response.json()


@pytest_asyncio.fixture
async def product_b(client_b: AsyncClient):
    """Create a product owned by tenant B."""
    response = await client_b.post("/api/admin/products", json={
        "name": "Producto Tenant B",
        "price": 75000,
        "description": "Belongs to tenant B",
    })
    assert response.status_code == 201
    return response.json()


@pytest_asyncio.fixture
async def order_a(db_session: AsyncSession, tenant_a: Tenant, product_a: dict):
    """Create an order owned by tenant A."""
    order = Order(
        id=uuid.uuid4(),
        tenant_id=tenant_a.id,
        order_number="ORD-A-001",
        customer_name="Cliente A",
        customer_phone="3001234567",
        address="Calle 1 #2-3",
        city="Bogota",
        subtotal=50000,
        total=50000,
        status="PENDIENTE",
    )
    db_session.add(order)
    await db_session.flush()

    item = OrderItem(
        id=uuid.uuid4(),
        order_id=order.id,
        tenant_id=tenant_a.id,
        product_id=uuid.UUID(product_a["id"]),
        product_name=product_a["name"],
        quantity=1,
        unit_price=50000,
        total_price=50000,
    )
    db_session.add(item)
    await db_session.commit()
    await db_session.refresh(order)
    return order


@pytest_asyncio.fixture
async def order_b(db_session: AsyncSession, tenant_b: Tenant, product_b: dict):
    """Create an order owned by tenant B."""
    order = Order(
        id=uuid.uuid4(),
        tenant_id=tenant_b.id,
        order_number="ORD-B-001",
        customer_name="Cliente B",
        customer_phone="5551234567",
        address="Av. Reforma 100",
        city="CDMX",
        subtotal=75000,
        total=75000,
        status="PENDIENTE",
    )
    db_session.add(order)
    await db_session.flush()

    item = OrderItem(
        id=uuid.uuid4(),
        order_id=order.id,
        tenant_id=tenant_b.id,
        product_id=uuid.UUID(product_b["id"]),
        product_name=product_b["name"],
        quantity=1,
        unit_price=75000,
        total_price=75000,
    )
    db_session.add(item)
    await db_session.commit()
    await db_session.refresh(order)
    return order


# ---------------------------------------------------------------------------
# Product isolation tests
# ---------------------------------------------------------------------------


@pytest.mark.asyncio
async def test_tenant_a_cannot_list_tenant_b_products(
    client_a: AsyncClient, product_a: dict, product_b: dict
):
    """Tenant A's product list should only contain their own products."""
    response = await client_a.get("/api/admin/products")
    assert response.status_code == 200
    data = response.json()
    product_ids = [p["id"] for p in data["items"]]
    assert product_a["id"] in product_ids
    assert product_b["id"] not in product_ids


@pytest.mark.asyncio
async def test_tenant_b_cannot_list_tenant_a_products(
    client_b: AsyncClient, product_a: dict, product_b: dict
):
    """Tenant B's product list should only contain their own products."""
    response = await client_b.get("/api/admin/products")
    assert response.status_code == 200
    data = response.json()
    product_ids = [p["id"] for p in data["items"]]
    assert product_b["id"] in product_ids
    assert product_a["id"] not in product_ids


@pytest.mark.asyncio
async def test_tenant_a_cannot_view_tenant_b_product(
    client_a: AsyncClient, product_b: dict
):
    """Tenant A should get 404 when trying to view tenant B's product."""
    response = await client_a.get(f"/api/admin/products/{product_b['id']}")
    assert response.status_code == 404


@pytest.mark.asyncio
async def test_tenant_a_cannot_update_tenant_b_product(
    client_a: AsyncClient, product_b: dict
):
    """Tenant A should get 404 when trying to update tenant B's product."""
    response = await client_a.put(
        f"/api/admin/products/{product_b['id']}",
        json={"name": "Hacked Product"},
    )
    assert response.status_code == 404


@pytest.mark.asyncio
async def test_tenant_a_cannot_delete_tenant_b_product(
    client_a: AsyncClient, product_b: dict
):
    """Tenant A should get 404 when trying to delete tenant B's product."""
    response = await client_a.delete(f"/api/admin/products/{product_b['id']}")
    assert response.status_code == 404


@pytest.mark.asyncio
async def test_tenant_b_cannot_view_tenant_a_product(
    client_b: AsyncClient, product_a: dict
):
    """Tenant B should get 404 when trying to view tenant A's product."""
    response = await client_b.get(f"/api/admin/products/{product_a['id']}")
    assert response.status_code == 404


@pytest.mark.asyncio
async def test_tenant_b_cannot_update_tenant_a_product(
    client_b: AsyncClient, product_a: dict
):
    """Tenant B should get 404 when trying to update tenant A's product."""
    response = await client_b.put(
        f"/api/admin/products/{product_a['id']}",
        json={"name": "Hacked Product"},
    )
    assert response.status_code == 404


@pytest.mark.asyncio
async def test_tenant_b_cannot_delete_tenant_a_product(
    client_b: AsyncClient, product_a: dict
):
    """Tenant B should get 404 when trying to delete tenant A's product."""
    response = await client_b.delete(f"/api/admin/products/{product_a['id']}")
    assert response.status_code == 404


# ---------------------------------------------------------------------------
# Order isolation tests
# ---------------------------------------------------------------------------


@pytest.mark.asyncio
async def test_tenant_a_cannot_list_tenant_b_orders(
    client_a: AsyncClient, order_a: Order, order_b: Order
):
    """Tenant A's order list should only contain their own orders."""
    response = await client_a.get("/api/admin/orders")
    assert response.status_code == 200
    data = response.json()
    order_ids = [o["id"] for o in data["items"]]
    assert str(order_a.id) in order_ids
    assert str(order_b.id) not in order_ids


@pytest.mark.asyncio
async def test_tenant_b_cannot_list_tenant_a_orders(
    client_b: AsyncClient, order_a: Order, order_b: Order
):
    """Tenant B's order list should only contain their own orders."""
    response = await client_b.get("/api/admin/orders")
    assert response.status_code == 200
    data = response.json()
    order_ids = [o["id"] for o in data["items"]]
    assert str(order_b.id) in order_ids
    assert str(order_a.id) not in order_ids


@pytest.mark.asyncio
async def test_tenant_a_cannot_view_tenant_b_order(
    client_a: AsyncClient, order_b: Order
):
    """Tenant A should get 404 when trying to view tenant B's order."""
    response = await client_a.get(f"/api/admin/orders/{order_b.id}")
    assert response.status_code == 404


@pytest.mark.asyncio
async def test_tenant_b_cannot_view_tenant_a_order(
    client_b: AsyncClient, order_a: Order
):
    """Tenant B should get 404 when trying to view tenant A's order."""
    response = await client_b.get(f"/api/admin/orders/{order_a.id}")
    assert response.status_code == 404


@pytest.mark.asyncio
async def test_tenant_a_cannot_update_tenant_b_order_status(
    client_a: AsyncClient, order_b: Order
):
    """Tenant A should get 404 when trying to update tenant B's order status."""
    response = await client_a.put(
        f"/api/admin/orders/{order_b.id}/status",
        json={"status": "ENVIADO"},
    )
    assert response.status_code == 404


@pytest.mark.asyncio
async def test_tenant_b_cannot_update_tenant_a_order_status(
    client_b: AsyncClient, order_a: Order
):
    """Tenant B should get 404 when trying to update tenant A's order status."""
    response = await client_b.put(
        f"/api/admin/orders/{order_a.id}/status",
        json={"status": "ENVIADO"},
    )
    assert response.status_code == 404
