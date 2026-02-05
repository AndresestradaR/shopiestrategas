import pytest
from httpx import AsyncClient


@pytest.mark.asyncio
async def test_register(client: AsyncClient):
    response = await client.post("/api/auth/register", json={
        "email": "new@test.com",
        "password": "password123",
        "store_name": "Mi Tienda",
        "country": "CO",
    })
    assert response.status_code == 201
    data = response.json()
    assert "access_token" in data
    assert "refresh_token" in data
    assert data["token_type"] == "bearer"


@pytest.mark.asyncio
async def test_register_duplicate_email(client: AsyncClient):
    await client.post("/api/auth/register", json={
        "email": "dup@test.com",
        "password": "password123",
        "store_name": "Tienda 1",
    })
    response = await client.post("/api/auth/register", json={
        "email": "dup@test.com",
        "password": "password123",
        "store_name": "Tienda 2",
    })
    assert response.status_code == 400


@pytest.mark.asyncio
async def test_login(client: AsyncClient):
    await client.post("/api/auth/register", json={
        "email": "login@test.com",
        "password": "mypassword",
        "store_name": "Login Store",
    })
    response = await client.post("/api/auth/login", json={
        "email": "login@test.com",
        "password": "mypassword",
    })
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data


@pytest.mark.asyncio
async def test_login_wrong_password(client: AsyncClient):
    await client.post("/api/auth/register", json={
        "email": "wrong@test.com",
        "password": "correct",
        "store_name": "Wrong Pass Store",
    })
    response = await client.post("/api/auth/login", json={
        "email": "wrong@test.com",
        "password": "incorrect",
    })
    assert response.status_code == 401


@pytest.mark.asyncio
async def test_me_endpoint(auth_client: AsyncClient):
    response = await auth_client.get("/api/auth/me")
    assert response.status_code == 200
    data = response.json()
    assert data["email"] == "test@test.com"
    assert data["store_name"] == "Test Store"


@pytest.mark.asyncio
async def test_refresh_token(client: AsyncClient):
    reg = await client.post("/api/auth/register", json={
        "email": "refresh@test.com",
        "password": "password123",
        "store_name": "Refresh Store",
    })
    refresh_token = reg.json()["refresh_token"]
    response = await client.post("/api/auth/refresh", json={
        "refresh_token": refresh_token,
    })
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
