import os
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from sqlalchemy import text

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
from app.api.admin.page_designs import router as page_designs_router
from app.api.store.pages import router as store_pages_router
from app.config import settings
from app.database import Base, engine
# Import all models so they register with Base.metadata
import app.models  # noqa: F401


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Create schema and tables on startup
    async with engine.begin() as conn:
        await conn.execute(text("CREATE SCHEMA IF NOT EXISTS minishop"))
        await conn.run_sync(Base.metadata.create_all)
    yield


app = FastAPI(title="MiniShop API", version="0.1.0", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)


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
app.include_router(page_designs_router)
app.include_router(store_pages_router)

# Mount uploads directory for serving static files
os.makedirs(settings.UPLOAD_DIR, exist_ok=True)
app.mount("/uploads", StaticFiles(directory=settings.UPLOAD_DIR), name="uploads")


@app.get("/api/health")
async def health_check():
    return {"status": "ok"}
