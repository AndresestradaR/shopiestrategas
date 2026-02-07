import uuid
from datetime import datetime

from sqlalchemy import Boolean, DateTime, ForeignKey, Integer, Numeric, String, func
from sqlalchemy.dialects.postgresql import JSON, UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base


class QuantityOffer(Base):
    __tablename__ = "quantity_offers"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    tenant_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("tenants.id"), nullable=False)
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    priority: Mapped[int] = mapped_column(Integer, default=0)
    product_ids: Mapped[list | None] = mapped_column(JSON, default=list)

    # Design
    bg_color: Mapped[str] = mapped_column(String(9), default="#FFFFFF")
    border_color: Mapped[str] = mapped_column(String(9), default="#E5E7EB")
    selected_border_color: Mapped[str] = mapped_column(String(9), default="#4DBEA4")
    header_text: Mapped[str] = mapped_column(String(255), default="Selecciona la cantidad")
    header_bg_color: Mapped[str] = mapped_column(String(9), default="#F9FAFB")
    header_text_color: Mapped[str] = mapped_column(String(9), default="#374151")
    hide_product_image: Mapped[bool] = mapped_column(Boolean, default=False)
    show_savings: Mapped[bool] = mapped_column(Boolean, default=True)
    show_per_unit: Mapped[bool] = mapped_column(Boolean, default=True)

    # Stats
    impressions: Mapped[int] = mapped_column(Integer, default=0)
    orders_count: Mapped[int] = mapped_column(Integer, default=0)

    # Timestamps
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    tiers = relationship("QuantityOfferTier", back_populates="offer", cascade="all, delete-orphan", order_by="QuantityOfferTier.position")


class QuantityOfferTier(Base):
    __tablename__ = "quantity_offer_tiers"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    offer_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("quantity_offers.id", ondelete="CASCADE"), nullable=False)
    title: Mapped[str] = mapped_column(String(255), default="")
    quantity: Mapped[int] = mapped_column(Integer, nullable=False, default=1)
    position: Mapped[int] = mapped_column(Integer, default=0)
    is_preselected: Mapped[bool] = mapped_column(Boolean, default=False)
    discount_type: Mapped[str] = mapped_column(String(20), default="percentage")
    discount_value: Mapped[float] = mapped_column(Numeric(12, 2), default=0)
    label_text: Mapped[str | None] = mapped_column(String(100))
    label_bg_color: Mapped[str] = mapped_column(String(9), default="#F59E0B")
    label_text_color: Mapped[str] = mapped_column(String(9), default="#FFFFFF")
    price_color: Mapped[str] = mapped_column(String(9), default="#059669")
    image_url: Mapped[str | None] = mapped_column(String(500))

    offer = relationship("QuantityOffer", back_populates="tiers")
