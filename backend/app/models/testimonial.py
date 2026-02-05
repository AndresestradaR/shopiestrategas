import uuid

from sqlalchemy import Boolean, ForeignKey, Integer, String, Text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column

from app.database import Base


class Testimonial(Base):
    __tablename__ = "testimonials"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    tenant_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("tenants.id"), nullable=False)
    customer_name: Mapped[str] = mapped_column(String(255), nullable=False)
    customer_city: Mapped[str | None] = mapped_column(String(255))
    customer_photo_url: Mapped[str | None] = mapped_column(String(500))
    rating: Mapped[int] = mapped_column(Integer, default=5)
    text: Mapped[str] = mapped_column(Text, nullable=False)
    product_id: Mapped[uuid.UUID | None] = mapped_column(UUID(as_uuid=True), ForeignKey("products.id", ondelete="SET NULL"))
    is_published: Mapped[bool] = mapped_column(Boolean, default=True)
    sort_order: Mapped[int] = mapped_column(Integer, default=0)
