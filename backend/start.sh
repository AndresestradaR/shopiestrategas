#!/bin/sh
python -c "
from app.database import Base, engine
from app.models import *
import asyncio

async def create_tables():
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    print('Database tables ready')

asyncio.run(create_tables())
"
exec uvicorn app.main:app --host 0.0.0.0 --port 8000
