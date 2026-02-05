import pytest
from httpx import AsyncClient


@pytest.mark.asyncio
async def test_create_product(auth_client: AsyncClient):
    response = await auth_client.post("/api/admin/products", json={
        "name": "Producto Test",
        "price": 89900,
        "description": "Un producto de prueba",
    })
    assert response.status_code == 201
    data = response.json()
    assert data["name"] == "Producto Test"
    assert data["slug"] == "producto-test"
    assert float(data["price"]) == 89900.0


@pytest.mark.asyncio
async def test_list_products(auth_client: AsyncClient):
    await auth_client.post("/api/admin/products", json={"name": "Prod 1", "price": 10000})
    await auth_client.post("/api/admin/products", json={"name": "Prod 2", "price": 20000})
    response = await auth_client.get("/api/admin/products")
    assert response.status_code == 200
    data = response.json()
    assert data["total"] >= 2
    assert len(data["items"]) >= 2


@pytest.mark.asyncio
async def test_update_product(auth_client: AsyncClient):
    create = await auth_client.post("/api/admin/products", json={"name": "Original", "price": 5000})
    product_id = create.json()["id"]
    response = await auth_client.put(f"/api/admin/products/{product_id}", json={"price": 7000})
    assert response.status_code == 200
    assert float(response.json()["price"]) == 7000.0


@pytest.mark.asyncio
async def test_delete_product(auth_client: AsyncClient):
    create = await auth_client.post("/api/admin/products", json={"name": "To Delete", "price": 1000})
    product_id = create.json()["id"]
    response = await auth_client.delete(f"/api/admin/products/{product_id}")
    assert response.status_code == 204

    get = await auth_client.get(f"/api/admin/products/{product_id}")
    assert get.status_code == 404


@pytest.mark.asyncio
async def test_create_variant(auth_client: AsyncClient):
    create = await auth_client.post("/api/admin/products", json={"name": "With Variant", "price": 30000})
    product_id = create.json()["id"]
    response = await auth_client.post(f"/api/admin/products/{product_id}/variants", json={
        "name": "Talla M",
        "variant_type": "size",
        "variant_value": "M",
    })
    assert response.status_code == 201
    assert response.json()["name"] == "Talla M"


@pytest.mark.asyncio
async def test_unauthorized_access(client: AsyncClient):
    response = await client.get("/api/admin/products")
    assert response.status_code in (401, 403)
