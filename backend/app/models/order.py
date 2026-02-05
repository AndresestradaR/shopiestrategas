import uuid
from datetime import datetime

from sqlalchemy import DateTime, ForeignKey, Integer, Numeric, String, Text, func
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base


class Order(Base):
    __tablename__ = "orders"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    tenant_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("tenants.id"), nullable=False)
    order_number: Mapped[str] = mapped_column(String(50), nullable=False)
    customer_name: Mapped[str] = mapped_column(String(255), nullable=False)
    customer_surname: Mapped[str | None] = mapped_column(String(255))
    customer_phone: Mapped[str] = mapped_column(String(50), nullable=False)
    customer_email: Mapped[str | None] = mapped_column(String(255))
    customer_dni: Mapped[str | None] = mapped_column(String(50))
    address: Mapped[str] = mapped_column(String(500), nullable=False)
    city: Mapped[str] = mapped_column(String(255), nullable=False)
    state: Mapped[str | None] = mapped_column(String(255))
    neighborhood: Mapped[str | None] = mapped_column(String(255))
    zip_code: Mapped[str | None] = mapped_column(String(20))
    address_notes: Mapped[str | None] = mapped_column(Text)
    subtotal: Mapped[float] = mapped_column(Numeric(12, 2), nullable=False)
    shipping_cost: Mapped[float] = mapped_column(Numeric(12, 2), default=0)
    discount: Mapped[float] = mapped_column(Numeric(12, 2), default=0)
    total: Mapped[float] = mapped_column(Numeric(12, 2), nullable=False)
    status: Mapped[str] = mapped_column(String(30), default="PENDIENTE")
    payment_method: Mapped[str] = mapped_column(String(30), default="CONTRAENTREGA")
    dropi_order_id: Mapped[str | None] = mapped_column(String(100))
    exported_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))
    utm_source: Mapped[str | None] = mapped_column(String(255))
    utm_medium: Mapped[str | None] = mapped_column(String(255))
    utm_campaign: Mapped[str | None] = mapped_column(String(255))
    notes: Mapped[str | None] = mapped_column(Text)
    admin_notes: Mapped[str | None] = mapped_column(Text)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    tenant = relationship("Tenant", back_populates="orders")
    items = relationship("OrderItem", back_populates="order", cascade="all, delete-orphan")


class OrderItem(Base):
    __tablename__ = "order_items"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    order_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("orders.id", ondelete="CASCADE"), nullable=False)
    tenant_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("tenants.id"), nullable=False)
    product_id: Mapped[uuid.UUID | None] = mapped_column(UUID(as_uuid=True), ForeignKey("products.id", ondelete="SET NULL"))
    variant_id: Mapped[uuid.UUID | None] = mapped_column(UUID(as_uuid=True), ForeignKey("product_variants.id", ondelete="SET NULL"))
    product_name: Mapped[str] = mapped_column(String(255), nullable=False)
    variant_name: Mapped[str | None] = mapped_column(String(255))
    quantity: Mapped[int] = mapped_column(Integer, nullable=False)
    unit_price: Mapped[float] = mapped_column(Numeric(12, 2), nullable=False)
    total_price: Mapped[float] = mapped_column(Numeric(12, 2), nullable=False)
    dropi_product_id: Mapped[str | None] = mapped_column(String(100))
    dropi_variation_id: Mapped[str | None] = mapped_column(String(100))

    order = relationship("Order", back_populates="items")
