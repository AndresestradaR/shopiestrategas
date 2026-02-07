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
from app.api.admin.media import router as media_router
from app.api.admin.page_designs import router as page_designs_router
from app.api.admin.checkout_config import router as checkout_config_router
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

    # Auto-migrations (each in its own connection, wrapped in try-except so server always starts)
    try:
        async with engine.begin() as conn:
            # add product_id to page_designs if missing
            result = await conn.execute(text(
                "SELECT column_name FROM information_schema.columns "
                "WHERE table_schema = 'minishop' AND table_name = 'page_designs' AND column_name = 'product_id'"
            ))
            if not result.fetchone():
                await conn.execute(text(
                    "ALTER TABLE minishop.page_designs "
                    "ADD COLUMN product_id UUID REFERENCES minishop.products(id) ON DELETE SET NULL"
                ))
                await conn.execute(text(
                    "ALTER TABLE minishop.page_designs "
                    "DROP CONSTRAINT IF EXISTS uq_pagedesign_tenant_type_slug"
                ))
                await conn.execute(text(
                    "DO $$ BEGIN "
                    "IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'uq_pagedesign_tenant_slug') THEN "
                    "ALTER TABLE minishop.page_designs "
                    "ADD CONSTRAINT uq_pagedesign_tenant_slug UNIQUE (tenant_id, slug); "
                    "END IF; END $$"
                ))
    except Exception as e:
        print(f"[migrate] page_designs: {e}")

    try:
        async with engine.begin() as conn:
            # add cta_subtitle_font_size and cta_font_family to checkout_configs
            result = await conn.execute(text(
                "SELECT column_name FROM information_schema.columns "
                "WHERE table_schema = 'minishop' AND table_name = 'checkout_configs' AND column_name = 'cta_subtitle_font_size'"
            ))
            if not result.fetchone():
                await conn.execute(text(
                    "ALTER TABLE minishop.checkout_configs "
                    "ADD COLUMN cta_subtitle_font_size INTEGER DEFAULT 12"
                ))
                await conn.execute(text(
                    "ALTER TABLE minishop.checkout_configs "
                    "ADD COLUMN cta_font_family VARCHAR(100) DEFAULT 'Inter, sans-serif'"
                ))
    except Exception as e:
        print(f"[migrate] cta_subtitle_font_size: {e}")

    try:
        async with engine.begin() as conn:
            # add form_font_family to checkout_configs
            result = await conn.execute(text(
                "SELECT column_name FROM information_schema.columns "
                "WHERE table_schema = 'minishop' AND table_name = 'checkout_configs' AND column_name = 'form_font_family'"
            ))
            if not result.fetchone():
                await conn.execute(text(
                    "ALTER TABLE minishop.checkout_configs "
                    "ADD COLUMN form_font_family VARCHAR(100) DEFAULT 'Inter, sans-serif'"
                ))
    except Exception as e:
        print(f"[migrate] form_font_family: {e}")

    try:
        async with engine.begin() as conn:
            # drop old checkout_offers table (replaced by quantity_offers + quantity_offer_tiers)
            await conn.execute(text("DROP TABLE IF EXISTS minishop.checkout_offers CASCADE"))
            # create_all ensures new tables exist
            await conn.run_sync(Base.metadata.create_all)
    except Exception as e:
        print(f"[migrate] checkout_offers->quantity_offers: {e}")

    try:
        async with engine.begin() as conn:
            # add hide_compare_price to quantity_offer_tiers + widen color columns for rgba
            result = await conn.execute(text(
                "SELECT column_name FROM information_schema.columns "
                "WHERE table_schema = 'minishop' AND table_name = 'quantity_offer_tiers' AND column_name = 'hide_compare_price'"
            ))
            if not result.fetchone():
                await conn.execute(text(
                    "ALTER TABLE minishop.quantity_offer_tiers "
                    "ADD COLUMN hide_compare_price BOOLEAN DEFAULT FALSE"
                ))
            # widen color columns from varchar(9) to varchar(50) for rgba support
            for col in ('label_bg_color', 'label_text_color', 'price_color'):
                await conn.execute(text(
                    f"ALTER TABLE minishop.quantity_offer_tiers "
                    f"ALTER COLUMN {col} TYPE VARCHAR(50)"
                ))
    except Exception as e:
        print(f"[migrate] quantity_offer_tiers hide_compare_price: {e}")

    try:
        async with engine.begin() as conn:
            # add label_top_position, label_inner_* to quantity_offer_tiers
            result = await conn.execute(text(
                "SELECT column_name FROM information_schema.columns "
                "WHERE table_schema = 'minishop' AND table_name = 'quantity_offer_tiers' AND column_name = 'label_top_position'"
            ))
            if not result.fetchone():
                await conn.execute(text(
                    "ALTER TABLE minishop.quantity_offer_tiers "
                    "ADD COLUMN label_top_position VARCHAR(10) DEFAULT 'left'"
                ))
                await conn.execute(text(
                    "ALTER TABLE minishop.quantity_offer_tiers "
                    "ADD COLUMN label_inner_text VARCHAR(100)"
                ))
                await conn.execute(text(
                    "ALTER TABLE minishop.quantity_offer_tiers "
                    "ADD COLUMN label_inner_bg_color VARCHAR(50) DEFAULT '#6B7280'"
                ))
                await conn.execute(text(
                    "ALTER TABLE minishop.quantity_offer_tiers "
                    "ADD COLUMN label_inner_text_color VARCHAR(50) DEFAULT '#FFFFFF'"
                ))
    except Exception as e:
        print(f"[migrate] quantity_offer_tiers inner_label: {e}")

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
app.include_router(media_router)
app.include_router(page_designs_router)
app.include_router(store_pages_router)
app.include_router(checkout_config_router)

# Mount uploads directory for local dev (when R2 is not configured, images are served from disk)
from app.services.storage import is_r2_configured  # noqa: E402

if not is_r2_configured():
    os.makedirs(settings.UPLOAD_DIR, exist_ok=True)
    app.mount("/uploads", StaticFiles(directory=settings.UPLOAD_DIR), name="uploads")
    app.mount("/api/uploads", StaticFiles(directory=settings.UPLOAD_DIR), name="uploads-api")


@app.get("/api/health")
async def health_check():
    return {"status": "ok"}
