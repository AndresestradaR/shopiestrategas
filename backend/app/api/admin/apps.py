from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_db, require_active_tenant
from app.models.store_app import StoreApp
from app.models.tenant import Tenant
from app.schemas.store import StoreAppResponse, StoreAppUpdate

router = APIRouter(prefix="/api/admin/apps", tags=["admin-apps"])

AVAILABLE_APPS = [
    {"app_slug": "whatsapp-button", "name": "Botón de WhatsApp", "description": "Botón flotante de WhatsApp"},
    {"app_slug": "voice-widget", "name": "Widget de Voz", "description": "Agrega un widget de voz a tu tienda"},
    {"app_slug": "countdown-timer", "name": "Temporizador", "description": "Timer de urgencia en el checkout"},
    {"app_slug": "stock-counter", "name": "Contador de Stock", "description": "Muestra stock limitado"},
    {"app_slug": "testimonials", "name": "Testimonios", "description": "Sección de testimonios de clientes"},
]


@router.get("", response_model=list[StoreAppResponse])
async def list_apps(
    db: AsyncSession = Depends(get_db),
    tenant: Tenant = Depends(require_active_tenant),
):
    result = await db.execute(select(StoreApp).where(StoreApp.tenant_id == tenant.id))
    existing = {app.app_slug: app for app in result.scalars().all()}

    apps = []
    for app_def in AVAILABLE_APPS:
        if app_def["app_slug"] in existing:
            apps.append(existing[app_def["app_slug"]])
        else:
            app = StoreApp(tenant_id=tenant.id, app_slug=app_def["app_slug"], is_active=False)
            db.add(app)
            await db.flush()
            await db.refresh(app)
            apps.append(app)

    return apps


@router.put("/{app_slug}", response_model=StoreAppResponse)
async def update_app(
    app_slug: str,
    data: StoreAppUpdate,
    db: AsyncSession = Depends(get_db),
    tenant: Tenant = Depends(require_active_tenant),
):
    result = await db.execute(
        select(StoreApp).where(StoreApp.app_slug == app_slug, StoreApp.tenant_id == tenant.id)
    )
    app = result.scalar_one_or_none()
    if not app:
        app = StoreApp(tenant_id=tenant.id, app_slug=app_slug)
        db.add(app)

    for key, value in data.model_dump(exclude_unset=True).items():
        setattr(app, key, value)

    await db.flush()
    await db.refresh(app)
    return app
