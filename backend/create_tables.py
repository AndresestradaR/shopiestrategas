"""Script to create all MiniShop tables in the database."""

import asyncio
import sys

from sqlalchemy.ext.asyncio import create_async_engine

from app.database import Base
# Import all models so they register with Base.metadata
from app.models import (  # noqa: F401
    Tenant, TenantDomain, StoreConfig, Product, ProductImage, ProductVariant,
    Order, OrderItem, StorePage, AbandonedCart, CheckoutOffer, Customer,
    StoreApp, Testimonial, StoreVisit,
)
from app.config import settings


async def create_tables():
    print(f"Connecting to database...")
    engine = create_async_engine(
        settings.DATABASE_URL,
        echo=True,
        connect_args={"statement_cache_size": 0, "prepared_statement_cache_size": 0},
    )
    async with engine.begin() as conn:
        print("Creating all tables...")
        await conn.run_sync(Base.metadata.create_all)
        print("All tables created successfully!")
    await engine.dispose()


if __name__ == "__main__":
    asyncio.run(create_tables())
