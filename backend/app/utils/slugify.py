from slugify import slugify as _slugify
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession


async def generate_unique_slug(text: str, model_class, session: AsyncSession, tenant_id=None) -> str:
    base_slug = _slugify(text, max_length=200)
    slug = base_slug
    counter = 1

    while True:
        query = select(model_class.id).where(model_class.slug == slug)
        if tenant_id is not None and hasattr(model_class, "tenant_id"):
            query = query.where(model_class.tenant_id == tenant_id)
        result = await session.execute(query)
        if result.scalar_one_or_none() is None:
            return slug
        slug = f"{base_slug}-{counter}"
        counter += 1
