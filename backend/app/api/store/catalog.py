from fastapi import APIRouter, HTTPException
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload
from fastapi import Depends
import uuid as _uuid_mod

from app.api.deps import get_db
from app.models.checkout_config import CheckoutConfig
from app.models.checkout_offer import QuantityOffer
from app.models.product import Product
from app.models.store_config import StoreConfig
from app.models.store_page import StorePage
from app.models.tenant import Tenant
from app.schemas.checkout_config import CheckoutConfigResponse
from app.schemas.product import ProductResponse
from app.schemas.store import StoreConfigResponse, StorePageResponse, QuantityOfferResponse

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
    # Build response with store_name from tenant
    data = {c.key: getattr(config, c.key) for c in StoreConfig.__table__.columns}
    data["store_name"] = tenant.store_name
    return data


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


@router.get("/{slug}/checkout-config", response_model=CheckoutConfigResponse | None)
async def get_store_checkout_config(slug: str, db: AsyncSession = Depends(get_db)):
    tenant = await get_tenant_by_slug(slug, db)
    result = await db.execute(
        select(CheckoutConfig).where(CheckoutConfig.tenant_id == tenant.id)
    )
    config = result.scalar_one_or_none()
    return config


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


@router.get("/{slug}/quantity-offers/{product_id}", response_model=QuantityOfferResponse | None)
async def get_quantity_offer_for_product(
    slug: str, product_id: str, db: AsyncSession = Depends(get_db)
):
    tenant = await get_tenant_by_slug(slug, db)
    # Find the highest-priority active offer whose product_ids includes this product
    result = await db.execute(
        select(QuantityOffer)
        .where(QuantityOffer.tenant_id == tenant.id, QuantityOffer.is_active == True)
        .options(selectinload(QuantityOffer.tiers))
        .order_by(QuantityOffer.priority.desc())
    )
    offers = result.scalars().all()
    for offer in offers:
        pids = offer.product_ids or []
        if product_id in pids or str(product_id) in [str(p) for p in pids]:
            return offer
    return None


@router.post("/{slug}/quantity-offers/{offer_id}/impression")
async def register_impression(
    slug: str, offer_id: str, db: AsyncSession = Depends(get_db)
):
    tenant = await get_tenant_by_slug(slug, db)
    result = await db.execute(
        select(QuantityOffer).where(
            QuantityOffer.id == _uuid_mod.UUID(offer_id),
            QuantityOffer.tenant_id == tenant.id,
        )
    )
    offer = result.scalar_one_or_none()
    if offer:
        offer.impressions = (offer.impressions or 0) + 1
    return {"status": "ok"}
