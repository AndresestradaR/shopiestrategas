from fastapi import APIRouter, Depends
from pydantic import BaseModel
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_db
from app.models.page_design import PageDesign
from app.models.tenant import Tenant

router = APIRouter(prefix="/api/store/{slug}/pages", tags=["store-pages"])


class PublicPageResponse(BaseModel):
    html_content: str | None = None
    css_content: str | None = None
    title: str
    model_config = {"from_attributes": True}


@router.get("/home", response_model=PublicPageResponse | None)
async def get_home_page(slug: str, db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(PageDesign)
        .join(Tenant, Tenant.id == PageDesign.tenant_id)
        .where(Tenant.slug == slug, PageDesign.page_type == "home", PageDesign.is_published == True)
    )
    return result.scalar_one_or_none()
