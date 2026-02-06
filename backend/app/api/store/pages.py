from fastapi import APIRouter, Depends
from pydantic import BaseModel
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.api.deps import get_db
from app.models.page_design import PageDesign
from app.models.product import Product
from app.models.tenant import Tenant

router = APIRouter(prefix="/api/store/{slug}/pages", tags=["store-pages"])


class PublicPageResponse(BaseModel):
    html_content: str | None = None
    css_content: str | None = None
    title: str
    product_slug: str | None = None
    model_config = {"from_attributes": True}


def _to_public(design: PageDesign) -> dict:
    return {
        "html_content": design.html_content,
        "css_content": design.css_content,
        "title": design.title,
        "product_slug": design.product.slug if design.product else None,
    }


@router.get("/home", response_model=PublicPageResponse | None)
async def get_home_page(slug: str, db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(PageDesign)
        .options(selectinload(PageDesign.product))
        .join(Tenant, Tenant.id == PageDesign.tenant_id)
        .where(Tenant.slug == slug, PageDesign.page_type == "home", PageDesign.is_published == True)
    )
    design = result.scalar_one_or_none()
    if not design:
        return None
    return _to_public(design)


@router.get("/by-slug/{page_slug}", response_model=PublicPageResponse | None)
async def get_page_by_slug(slug: str, page_slug: str, db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(PageDesign)
        .options(selectinload(PageDesign.product))
        .join(Tenant, Tenant.id == PageDesign.tenant_id)
        .where(Tenant.slug == slug, PageDesign.slug == page_slug, PageDesign.is_published == True)
    )
    design = result.scalar_one_or_none()
    if not design:
        return None
    return _to_public(design)


@router.get("/by-product/{product_slug}", response_model=PublicPageResponse | None)
async def get_page_by_product(slug: str, product_slug: str, db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(PageDesign)
        .options(selectinload(PageDesign.product))
        .join(Tenant, Tenant.id == PageDesign.tenant_id)
        .join(Product, Product.id == PageDesign.product_id)
        .where(
            Tenant.slug == slug,
            Product.slug == product_slug,
            PageDesign.page_type == "product",
            PageDesign.is_published == True,
        )
        .order_by(PageDesign.sort_order)
        .limit(1)
    )
    design = result.scalar_one_or_none()
    if not design:
        return None
    return _to_public(design)
