"""Script to create all MiniShop tables in the database."""

import asyncio
import sys

from sqlalchemy import text
from sqlalchemy.ext.asyncio import create_async_engine

from app.database import Base
# Import all models so they register with Base.metadata
from app.models import (  # noqa: F401
    Tenant, TenantDomain, StoreConfig, Product, ProductImage, ProductVariant,
    Order, OrderItem, StorePage, AbandonedCart, CheckoutOffer, Customer,
    StoreApp, Testimonial, StoreVisit,
)
from app.config import settings


async def create_tables(drop_first=False):
    print("Connecting to database...")
    engine = create_async_engine(
        settings.DATABASE_URL,
        echo=True,
        connect_args={"statement_cache_size": 0, "prepared_statement_cache_size": 0},
    )
    async with engine.begin() as conn:
        # Create the minishop schema if it doesn't exist
        print("Creating schema 'minishop' if not exists...")
        await conn.execute(text("CREATE SCHEMA IF NOT EXISTS minishop"))

        if drop_first:
            print("Dropping all MiniShop tables...")
            await conn.run_sync(Base.metadata.drop_all)
            print("Tables dropped.")
        print("Creating all tables...")
        await conn.run_sync(Base.metadata.create_all)
        print("All tables created successfully!")
    await engine.dispose()


if __name__ == "__main__":
    drop = "--drop" in sys.argv
    if drop:
        print("WARNING: Will DROP all MiniShop tables first!")
    asyncio.run(create_tables(drop_first=drop))
