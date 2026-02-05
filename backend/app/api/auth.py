import uuid as uuid_mod

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_current_tenant, get_db
from app.models.store_config import StoreConfig
from app.models.store_page import StorePage
from app.models.tenant import Tenant
from app.schemas.tenant import TenantLogin, TenantRegister, TenantResponse, TokenRefresh, TokenResponse
from app.utils.security import create_access_token, create_refresh_token, decode_token, hash_password, verify_password
from app.utils.slugify import generate_unique_slug

router = APIRouter(prefix="/api/auth", tags=["auth"])

CURRENCY_MAP = {
    "CO": ("COP", "$"),
    "MX": ("MXN", "$"),
    "GT": ("GTQ", "Q"),
    "PE": ("PEN", "S/"),
    "EC": ("USD", "$"),
    "CL": ("CLP", "$"),
}

DEFAULT_PAGES = [
    {"title": "Política de envíos", "slug": "politica-envios", "content": "Contenido de política de envíos.", "sort_order": 0},
    {"title": "Política de devoluciones", "slug": "politica-devoluciones", "content": "Contenido de política de devoluciones.", "sort_order": 1},
    {"title": "Términos y condiciones", "slug": "terminos-condiciones", "content": "Contenido de términos y condiciones.", "sort_order": 2},
    {"title": "Política de privacidad", "slug": "politica-privacidad", "content": "Contenido de política de privacidad.", "sort_order": 3},
]


@router.post("/register", response_model=TokenResponse, status_code=status.HTTP_201_CREATED)
async def register(data: TenantRegister, db: AsyncSession = Depends(get_db)):
    existing = await db.execute(select(Tenant).where(Tenant.email == data.email))
    if existing.scalar_one_or_none():
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Email already registered")

    slug = await generate_unique_slug(data.store_name, Tenant, db)

    tenant = Tenant(
        email=data.email,
        password_hash=hash_password(data.password),
        store_name=data.store_name,
        slug=slug,
        country=data.country,
    )
    db.add(tenant)
    await db.flush()

    currency_code, currency_symbol = CURRENCY_MAP.get(data.country, ("COP", "$"))
    store_config = StoreConfig(
        tenant_id=tenant.id,
        currency_code=currency_code,
        currency_symbol=currency_symbol,
    )
    db.add(store_config)

    for page_data in DEFAULT_PAGES:
        page = StorePage(tenant_id=tenant.id, **page_data)
        db.add(page)

    access_token = create_access_token({"sub": str(tenant.id)})
    refresh_token = create_refresh_token({"sub": str(tenant.id)})
    return TokenResponse(access_token=access_token, refresh_token=refresh_token)


@router.post("/login", response_model=TokenResponse)
async def login(data: TenantLogin, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Tenant).where(Tenant.email == data.email))
    tenant = result.scalar_one_or_none()
    if tenant is None or not verify_password(data.password, tenant.password_hash):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid email or password")

    access_token = create_access_token({"sub": str(tenant.id)})
    refresh_token = create_refresh_token({"sub": str(tenant.id)})
    return TokenResponse(access_token=access_token, refresh_token=refresh_token)


@router.post("/refresh", response_model=TokenResponse)
async def refresh(data: TokenRefresh, db: AsyncSession = Depends(get_db)):
    payload = decode_token(data.refresh_token)
    if payload is None or payload.get("type") != "refresh":
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid refresh token")

    tenant_id = uuid_mod.UUID(payload.get("sub"))
    result = await db.execute(select(Tenant).where(Tenant.id == tenant_id))
    tenant = result.scalar_one_or_none()
    if tenant is None:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Tenant not found")

    access_token = create_access_token({"sub": str(tenant.id)})
    refresh_token = create_refresh_token({"sub": str(tenant.id)})
    return TokenResponse(access_token=access_token, refresh_token=refresh_token)


@router.get("/me", response_model=TenantResponse)
async def me(tenant: Tenant = Depends(get_current_tenant)):
    return tenant
