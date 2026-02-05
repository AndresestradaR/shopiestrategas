import uuid
from datetime import datetime

from sqlalchemy import DateTime, ForeignKey, Integer, Numeric, String, func
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column

from app.database import Base


class AbandonedCart(Base):
    __tablename__ = "abandoned_carts"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    tenant_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("tenants.id"), nullable=False)
    session_id: Mapped[str | None] = mapped_column(String(255))
    customer_name: Mapped[str | None] = mapped_column(String(255))
    customer_phone: Mapped[str | None] = mapped_column(String(50))
    customer_email: Mapped[str | None] = mapped_column(String(255))
    product_id: Mapped[uuid.UUID | None] = mapped_column(UUID(as_uuid=True), ForeignKey("products.id", ondelete="SET NULL"))
    product_name: Mapped[str | None] = mapped_column(String(255))
    variant_name: Mapped[str | None] = mapped_column(String(255))
    quantity: Mapped[int | None] = mapped_column(Integer)
    total_value: Mapped[float | None] = mapped_column(Numeric(12, 2))
    status: Mapped[str] = mapped_column(String(30), default="ABANDONED")
    last_step: Mapped[str | None] = mapped_column(String(50))
    ip_address: Mapped[str | None] = mapped_column(String(45))
    utm_source: Mapped[str | None] = mapped_column(String(255))
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
