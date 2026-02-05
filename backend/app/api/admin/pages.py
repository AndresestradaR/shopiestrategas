import uuid

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_db, require_active_tenant
from app.models.store_page import StorePage
from app.models.tenant import Tenant
from app.schemas.store import StorePageCreate, StorePageResponse, StorePageUpdate
from app.utils.slugify import generate_unique_slug

router = APIRouter(prefix="/api/admin/pages", tags=["admin-pages"])


@router.get("", response_model=list[StorePageResponse])
async def list_pages(
    db: AsyncSession = Depends(get_db),
    tenant: Tenant = Depends(require_active_tenant),
):
    result = await db.execute(
        select(StorePage)
        .where(StorePage.tenant_id == tenant.id)
        .order_by(StorePage.sort_order)
    )
    return result.scalars().all()


@router.post("", response_model=StorePageResponse, status_code=status.HTTP_201_CREATED)
async def create_page(
    data: StorePageCreate,
    db: AsyncSession = Depends(get_db),
    tenant: Tenant = Depends(require_active_tenant),
):
    slug = data.slug or await generate_unique_slug(data.title, StorePage, db, tenant_id=tenant.id)
    page = StorePage(tenant_id=tenant.id, slug=slug, **data.model_dump(exclude={"slug"}))
    db.add(page)
    await db.flush()
    await db.refresh(page)
    return page


@router.put("/{page_id}", response_model=StorePageResponse)
async def update_page(
    page_id: uuid.UUID,
    data: StorePageUpdate,
    db: AsyncSession = Depends(get_db),
    tenant: Tenant = Depends(require_active_tenant),
):
    result = await db.execute(
        select(StorePage).where(StorePage.id == page_id, StorePage.tenant_id == tenant.id)
    )
    page = result.scalar_one_or_none()
    if not page:
        raise HTTPException(status_code=404, detail="Page not found")

    for key, value in data.model_dump(exclude_unset=True).items():
        setattr(page, key, value)

    await db.flush()
    await db.refresh(page)
    return page


@router.delete("/{page_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_page(
    page_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    tenant: Tenant = Depends(require_active_tenant),
):
    result = await db.execute(
        select(StorePage).where(StorePage.id == page_id, StorePage.tenant_id == tenant.id)
    )
    page = result.scalar_one_or_none()
    if not page:
        raise HTTPException(status_code=404, detail="Page not found")
    await db.delete(page)
