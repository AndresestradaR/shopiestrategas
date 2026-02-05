import os

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from app.api.admin.analytics import router as analytics_router
from app.api.admin.apps import router as apps_router
from app.api.admin.carts import router as carts_router
from app.api.admin.checkout import router as checkout_router
from app.api.admin.config import router as config_router
from app.api.admin.orders import router as orders_router
from app.api.admin.pages import router as pages_router
from app.api.admin.products import router as products_router
from app.api.auth import router as auth_router
from app.api.store.catalog import router as store_catalog_router
from app.api.store.checkout import router as store_checkout_router
from app.config import settings

app = FastAPI(title="MiniShop API", version="0.1.0")

cors_kwargs = {
    "allow_origins": settings.CORS_ORIGINS,
    "allow_credentials": True,
    "allow_methods": ["*"],
    "allow_headers": ["*"],
}
if settings.CORS_ALLOW_REGEX:
    cors_kwargs["allow_origin_regex"] = settings.CORS_ALLOW_REGEX

app.add_middleware(CORSMiddleware, **cors_kwargs)


app.include_router(auth_router)
app.include_router(products_router)
app.include_router(orders_router)
app.include_router(config_router)
app.include_router(pages_router)
app.include_router(checkout_router)
app.include_router(apps_router)
app.include_router(analytics_router)
app.include_router(carts_router)
app.include_router(store_catalog_router)
app.include_router(store_checkout_router)

# Mount uploads directory for serving static files
if os.path.isdir(settings.UPLOAD_DIR):
    app.mount("/uploads", StaticFiles(directory=settings.UPLOAD_DIR), name="uploads")


@app.get("/api/health")
async def health_check():
    return {"status": "ok"}
