from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.admin.orders import router as orders_router
from app.api.admin.products import router as products_router
from app.api.auth import router as auth_router
from app.config import settings

app = FastAPI(title="MiniShop API", version="0.1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


app.include_router(auth_router)
app.include_router(products_router)
app.include_router(orders_router)


@app.get("/api/health")
async def health_check():
    return {"status": "ok"}
