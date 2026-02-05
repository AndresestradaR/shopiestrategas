from fastapi import APIRouter, HTTPException
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload
from fastapi import Depends

from app.api.deps import get_db
from app.models.product import Product
from app.models.store_config import StoreConfig
from app.models.store_page import StorePage
from app.models.tenant import Tenant
from app.schemas.product import ProductResponse
from app.schemas.store import StoreConfigResponse, StorePageResponse

router = APIRouter(prefix="/api/store", tags=["store"])


async def get_tenant_by_slug(slug: str, db: AsyncSession) -> Tenant:
    result = await db.execute(select(Tenant).where(Tenant.slug == slug, Tenant.is_active == True))
    tenant = result.scalar_one_or_none()
    if not tenant:
        raise HTTPException(status_code=404, detail="Store not found")
    return tenant


@router.get("/{slug}/config", response_model=StoreConfigResponse)
async def get_store_config(slug: str, db: AsyncSession = Depends(get_db)):
    tenant = await get_tenant_by_slug(slug, db)
    result = await db.execute(select(StoreConfig).where(StoreConfig.tenant_id == tenant.id))
    config = result.scalar_one_or_none()
    if not config:
        raise HTTPException(status_code=404, detail="Store config not found")
    return config


@router.get("/{slug}/products", response_model=list[ProductResponse])
async def list_store_products(slug: str, db: AsyncSession = Depends(get_db)):
    tenant = await get_tenant_by_slug(slug, db)
    result = await db.execute(
        select(Product)
        .where(Product.tenant_id == tenant.id, Product.is_active == True)
        .options(selectinload(Product.images), selectinload(Product.variants))
        .order_by(Product.sort_order)
    )
    return result.scalars().all()


@router.get("/{slug}/products/{product_slug}", response_model=ProductResponse)
async def get_store_product(slug: str, product_slug: str, db: AsyncSession = Depends(get_db)):
    tenant = await get_tenant_by_slug(slug, db)
    result = await db.execute(
        select(Product)
        .where(Product.tenant_id == tenant.id, Product.slug == product_slug, Product.is_active == True)
        .options(selectinload(Product.images), selectinload(Product.variants))
    )
    product = result.scalar_one_or_none()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    return product


@router.get("/{slug}/pages/{page_slug}", response_model=StorePageResponse)
async def get_store_page(slug: str, page_slug: str, db: AsyncSession = Depends(get_db)):
    tenant = await get_tenant_by_slug(slug, db)
    result = await db.execute(
        select(StorePage)
        .where(StorePage.tenant_id == tenant.id, StorePage.slug == page_slug, StorePage.is_published == True)
    )
    page = result.scalar_one_or_none()
    if not page:
        raise HTTPException(status_code=404, detail="Page not found")
    return page
