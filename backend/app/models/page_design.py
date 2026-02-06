import uuid
from datetime import datetime, timezone

from sqlalchemy import JSON, Boolean, DateTime, ForeignKey, Integer, String, Text, UniqueConstraint
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base


class PageDesign(Base):
    __tablename__ = "page_designs"
    __table_args__ = (
        UniqueConstraint("tenant_id", "slug", name="uq_pagedesign_tenant_slug"),
    )

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    tenant_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("tenants.id"), nullable=False)
    product_id: Mapped[uuid.UUID | None] = mapped_column(UUID(as_uuid=True), ForeignKey("products.id", ondelete="SET NULL"), nullable=True)

    page_type: Mapped[str] = mapped_column(String(50), nullable=False, default="home")
    title: Mapped[str] = mapped_column(String(255), nullable=False, default="Mi Landing")
    slug: Mapped[str] = mapped_column(String(255), nullable=False, default="home")

    grapesjs_data: Mapped[dict | None] = mapped_column(JSON)

    html_content: Mapped[str | None] = mapped_column(Text)
    css_content: Mapped[str | None] = mapped_column(Text)

    is_published: Mapped[bool] = mapped_column(Boolean, default=False)
    sort_order: Mapped[int] = mapped_column(Integer, default=0)

    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

    tenant = relationship("Tenant")
    product = relationship("Product", foreign_keys=[product_id])
