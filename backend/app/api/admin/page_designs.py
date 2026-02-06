import uuid
import re
from datetime import datetime

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.api.deps import get_db, require_active_tenant
from app.models.page_design import PageDesign
from app.models.product import Product
from app.models.tenant import Tenant

router = APIRouter(prefix="/api/admin/page-designs", tags=["page-designs"])


def _slugify(text: str) -> str:
    text = text.lower().strip()
    text = re.sub(r"[^\w\s-]", "", text)
    text = re.sub(r"[\s_]+", "-", text)
    return re.sub(r"-+", "-", text).strip("-")


class PageDesignCreate(BaseModel):
    page_type: str = "home"
    title: str = "Mi Landing"
    slug: str | None = None
    product_id: uuid.UUID | None = None


class PageDesignUpdate(BaseModel):
    title: str | None = None
    grapesjs_data: dict | None = None
    html_content: str | None = None
    css_content: str | None = None
    is_published: bool | None = None


class PageDesignResponse(BaseModel):
    id: uuid.UUID
    page_type: str
    title: str
    slug: str
    product_id: uuid.UUID | None = None
    product_name: str | None = None
    grapesjs_data: dict | None = None
    html_content: str | None = None
    css_content: str | None = None
    is_published: bool
    created_at: datetime | None = None
    model_config = {"from_attributes": True}


def _to_response(design: PageDesign) -> dict:
    return {
        "id": design.id,
        "page_type": design.page_type,
        "title": design.title,
        "slug": design.slug,
        "product_id": design.product_id,
        "product_name": design.product.name if design.product else None,
        "grapesjs_data": design.grapesjs_data,
        "html_content": design.html_content,
        "css_content": design.css_content,
        "is_published": design.is_published,
        "created_at": design.created_at,
    }


@router.get("", response_model=list[PageDesignResponse])
async def list_page_designs(
    page_type: str | None = None,
    db: AsyncSession = Depends(get_db),
    tenant: Tenant = Depends(require_active_tenant),
):
    query = (
        select(PageDesign)
        .options(selectinload(PageDesign.product))
        .where(PageDesign.tenant_id == tenant.id)
    )
    if page_type:
        query = query.where(PageDesign.page_type == page_type)
    query = query.order_by(PageDesign.sort_order)
    result = await db.execute(query)
    designs = result.scalars().all()
    return [_to_response(d) for d in designs]


@router.post("", response_model=PageDesignResponse, status_code=201)
async def create_page_design(
    data: PageDesignCreate,
    db: AsyncSession = Depends(get_db),
    tenant: Tenant = Depends(require_active_tenant),
):
    # Only one home page allowed
    if data.page_type == "home":
        existing = await db.execute(
            select(PageDesign).where(
                PageDesign.tenant_id == tenant.id,
                PageDesign.page_type == "home",
            )
        )
        if existing.scalar_one_or_none():
            raise HTTPException(400, "Ya existe una pagina de inicio. Editala en vez de crear otra.")

    # Validate product exists for product landings
    product = None
    if data.page_type == "product":
        if not data.product_id:
            raise HTTPException(400, "Debes seleccionar un producto para una landing de producto.")
        result = await db.execute(
            select(Product).where(Product.id == data.product_id, Product.tenant_id == tenant.id)
        )
        product = result.scalar_one_or_none()
        if not product:
            raise HTTPException(404, "Producto no encontrado.")

    # Auto-generate slug
    if data.slug:
        slug = _slugify(data.slug)
    elif data.page_type == "home":
        slug = "home"
    elif product:
        slug = f"landing-{product.slug}"
    else:
        slug = _slugify(data.title)

    # Ensure slug uniqueness for this tenant
    base_slug = slug
    counter = 1
    while True:
        dup = await db.execute(
            select(PageDesign.id).where(PageDesign.tenant_id == tenant.id, PageDesign.slug == slug)
        )
        if not dup.scalar_one_or_none():
            break
        counter += 1
        slug = f"{base_slug}-{counter}"

    design = PageDesign(
        tenant_id=tenant.id,
        page_type=data.page_type,
        title=data.title,
        slug=slug,
        product_id=data.product_id,
    )
    db.add(design)
    await db.flush()
    await db.refresh(design, attribute_names=["product"])
    return _to_response(design)


@router.get("/{design_id}", response_model=PageDesignResponse)
async def get_page_design(
    design_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    tenant: Tenant = Depends(require_active_tenant),
):
    result = await db.execute(
        select(PageDesign)
        .options(selectinload(PageDesign.product))
        .where(PageDesign.id == design_id, PageDesign.tenant_id == tenant.id)
    )
    design = result.scalar_one_or_none()
    if not design:
        raise HTTPException(404, "Page design not found")
    return _to_response(design)


@router.put("/{design_id}", response_model=PageDesignResponse)
async def update_page_design(
    design_id: uuid.UUID,
    data: PageDesignUpdate,
    db: AsyncSession = Depends(get_db),
    tenant: Tenant = Depends(require_active_tenant),
):
    result = await db.execute(
        select(PageDesign)
        .options(selectinload(PageDesign.product))
        .where(PageDesign.id == design_id, PageDesign.tenant_id == tenant.id)
    )
    design = result.scalar_one_or_none()
    if not design:
        raise HTTPException(404, "Page design not found")

    for key, value in data.model_dump(exclude_unset=True).items():
        setattr(design, key, value)

    await db.flush()
    await db.refresh(design, attribute_names=["product"])
    return _to_response(design)


@router.delete("/{design_id}", status_code=204)
async def delete_page_design(
    design_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    tenant: Tenant = Depends(require_active_tenant),
):
    result = await db.execute(
        select(PageDesign).where(PageDesign.id == design_id, PageDesign.tenant_id == tenant.id)
    )
    design = result.scalar_one_or_none()
    if not design:
        raise HTTPException(404, "Page design not found")
    await db.delete(design)
