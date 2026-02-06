import uuid

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_db, require_active_tenant
from app.models.page_design import PageDesign
from app.models.tenant import Tenant

router = APIRouter(prefix="/api/admin/page-designs", tags=["page-designs"])


class PageDesignCreate(BaseModel):
    page_type: str = "home"
    title: str = "Mi Landing"
    slug: str = "home"


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
    grapesjs_data: dict | None = None
    html_content: str | None = None
    css_content: str | None = None
    is_published: bool
    model_config = {"from_attributes": True}


@router.get("", response_model=list[PageDesignResponse])
async def list_page_designs(
    page_type: str | None = None,
    db: AsyncSession = Depends(get_db),
    tenant: Tenant = Depends(require_active_tenant),
):
    query = select(PageDesign).where(PageDesign.tenant_id == tenant.id)
    if page_type:
        query = query.where(PageDesign.page_type == page_type)
    query = query.order_by(PageDesign.sort_order)
    result = await db.execute(query)
    return result.scalars().all()


@router.post("", response_model=PageDesignResponse, status_code=201)
async def create_page_design(
    data: PageDesignCreate,
    db: AsyncSession = Depends(get_db),
    tenant: Tenant = Depends(require_active_tenant),
):
    if data.page_type == "home":
        existing = await db.execute(
            select(PageDesign).where(
                PageDesign.tenant_id == tenant.id,
                PageDesign.page_type == "home",
            )
        )
        if existing.scalar_one_or_none():
            raise HTTPException(400, "Ya existe una pagina de inicio. Editala en vez de crear otra.")

    design = PageDesign(tenant_id=tenant.id, **data.model_dump())
    db.add(design)
    await db.flush()
    await db.refresh(design)
    return design


@router.get("/{design_id}", response_model=PageDesignResponse)
async def get_page_design(
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
    return design


@router.put("/{design_id}", response_model=PageDesignResponse)
async def update_page_design(
    design_id: uuid.UUID,
    data: PageDesignUpdate,
    db: AsyncSession = Depends(get_db),
    tenant: Tenant = Depends(require_active_tenant),
):
    result = await db.execute(
        select(PageDesign).where(PageDesign.id == design_id, PageDesign.tenant_id == tenant.id)
    )
    design = result.scalar_one_or_none()
    if not design:
        raise HTTPException(404, "Page design not found")

    for key, value in data.model_dump(exclude_unset=True).items():
        setattr(design, key, value)

    await db.flush()
    await db.refresh(design)
    return design


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
