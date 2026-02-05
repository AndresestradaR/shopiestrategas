import uuid
from datetime import datetime

from pydantic import BaseModel


class ProductImageResponse(BaseModel):
    id: uuid.UUID
    image_url: str
    alt_text: str | None = None
    sort_order: int = 0
    is_primary: bool = False

    model_config = {"from_attributes": True}


class ProductVariantCreate(BaseModel):
    name: str
    variant_type: str | None = None
    variant_value: str | None = None
    price_override: float | None = None
    dropi_variation_id: str | None = None
    sku: str | None = None
    stock: int | None = None
    is_active: bool = True
    sort_order: int = 0


class ProductVariantResponse(BaseModel):
    id: uuid.UUID
    name: str
    variant_type: str | None = None
    variant_value: str | None = None
    price_override: float | None = None
    dropi_variation_id: str | None = None
    sku: str | None = None
    stock: int | None = None
    is_active: bool
    sort_order: int

    model_config = {"from_attributes": True}


class ProductCreate(BaseModel):
    name: str
    description: str | None = None
    short_description: str | None = None
    price: float
    compare_at_price: float | None = None
    cost_price: float | None = None
    dropi_product_id: str | None = None
    sku: str | None = None
    is_active: bool = True
    is_featured: bool = False
    stock: int | None = None
    tags: list[str] | None = None
    sort_order: int = 0


class ProductUpdate(BaseModel):
    name: str | None = None
    description: str | None = None
    short_description: str | None = None
    price: float | None = None
    compare_at_price: float | None = None
    cost_price: float | None = None
    dropi_product_id: str | None = None
    sku: str | None = None
    is_active: bool | None = None
    is_featured: bool | None = None
    stock: int | None = None
    tags: list[str] | None = None
    sort_order: int | None = None


class ProductResponse(BaseModel):
    id: uuid.UUID
    name: str
    slug: str
    description: str | None = None
    short_description: str | None = None
    price: float
    compare_at_price: float | None = None
    cost_price: float | None = None
    dropi_product_id: str | None = None
    sku: str | None = None
    is_active: bool
    is_featured: bool
    stock: int | None = None
    tags: list[str] | None = None
    sort_order: int
    images: list[ProductImageResponse] = []
    variants: list[ProductVariantResponse] = []
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


class ProductListResponse(BaseModel):
    items: list[ProductResponse]
    total: int
    page: int
    per_page: int
