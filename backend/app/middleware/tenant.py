from starlette.middleware.base import BaseHTTPMiddleware
from starlette.requests import Request
from sqlalchemy import select

from app.database import async_session
from app.models.tenant import Tenant, TenantDomain


class TenantMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        tenant_id = None

        # Dev: resolve from header
        store_slug = request.headers.get("X-Store-Slug")
        if store_slug:
            async with async_session() as session:
                result = await session.execute(
                    select(Tenant.id).where(Tenant.slug == store_slug, Tenant.is_active == True)
                )
                row = result.scalar_one_or_none()
                if row:
                    tenant_id = row

        # Production: resolve from Host header
        if not tenant_id:
            host = request.headers.get("host", "")
            hostname = host.split(":")[0]

            if hostname.endswith(".minishop.co"):
                slug = hostname.replace(".minishop.co", "")
                async with async_session() as session:
                    result = await session.execute(
                        select(Tenant.id).where(Tenant.slug == slug, Tenant.is_active == True)
                    )
                    row = result.scalar_one_or_none()
                    if row:
                        tenant_id = row
            else:
                async with async_session() as session:
                    result = await session.execute(
                        select(TenantDomain.tenant_id).where(
                            TenantDomain.domain == hostname,
                            TenantDomain.is_verified == True,
                        )
                    )
                    row = result.scalar_one_or_none()
                    if row:
                        tenant_id = row

        request.state.tenant_id = tenant_id
        response = await call_next(request)
        return response
