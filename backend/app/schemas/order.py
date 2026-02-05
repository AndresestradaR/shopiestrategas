import uuid
from datetime import datetime

from pydantic import BaseModel


class OrderItemResponse(BaseModel):
    id: uuid.UUID
    product_name: str
    variant_name: str | None = None
    quantity: int
    unit_price: float
    total_price: float
    dropi_product_id: str | None = None
    dropi_variation_id: str | None = None

    model_config = {"from_attributes": True}


class OrderResponse(BaseModel):
    id: uuid.UUID
    order_number: str
    customer_name: str
    customer_surname: str | None = None
    customer_phone: str
    customer_email: str | None = None
    city: str
    total: float
    status: str
    payment_method: str
    created_at: datetime

    model_config = {"from_attributes": True}


class OrderDetailResponse(BaseModel):
    id: uuid.UUID
    order_number: str
    customer_name: str
    customer_surname: str | None = None
    customer_phone: str
    customer_email: str | None = None
    customer_dni: str | None = None
    address: str
    city: str
    state: str | None = None
    neighborhood: str | None = None
    zip_code: str | None = None
    address_notes: str | None = None
    subtotal: float
    shipping_cost: float
    discount: float
    total: float
    status: str
    payment_method: str
    dropi_order_id: str | None = None
    exported_at: datetime | None = None
    utm_source: str | None = None
    utm_medium: str | None = None
    utm_campaign: str | None = None
    notes: str | None = None
    admin_notes: str | None = None
    items: list[OrderItemResponse] = []
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


class OrderListResponse(BaseModel):
    items: list[OrderResponse]
    total: int
    page: int
    per_page: int


class OrderUpdateStatus(BaseModel):
    status: str


class OrderUpdateNotes(BaseModel):
    admin_notes: str | None = None


class OrderExportFilters(BaseModel):
    status: str | None = None
    date_from: datetime | None = None
    date_to: datetime | None = None
