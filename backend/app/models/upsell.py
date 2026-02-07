import uuid
from datetime import datetime

from sqlalchemy import Boolean, DateTime, Float, ForeignKey, Integer, Numeric, String, Text, func
from sqlalchemy.dialects.postgresql import JSON, UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base


class UpsellConfig(Base):
    __tablename__ = "upsell_configs"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    tenant_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("tenants.id"), nullable=False, unique=True)
    upsell_type: Mapped[str] = mapped_column(String(20), default="post_purchase")
    max_upsells_per_order: Mapped[int] = mapped_column(Integer, default=2)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())


class Upsell(Base):
    __tablename__ = "upsells"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    tenant_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("tenants.id"), nullable=False)
    name: Mapped[str] = mapped_column(String(255), nullable=False, default="Nuevo upsell")
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    priority: Mapped[int] = mapped_column(Integer, default=0)

    # Trigger
    trigger_type: Mapped[str] = mapped_column(String(20), default="all")
    trigger_product_ids: Mapped[list | None] = mapped_column(JSON, default=list)

    # Upsell product
    upsell_product_id: Mapped[uuid.UUID | None] = mapped_column(UUID(as_uuid=True), ForeignKey("products.id", ondelete="SET NULL"))

    # Discount
    discount_type: Mapped[str] = mapped_column(String(20), default="none")
    discount_value: Mapped[float] = mapped_column(Numeric(12, 2), default=0)

    # Popup design — title & text
    title: Mapped[str] = mapped_column(String(500), default="Agregar {product_name} a tu pedido!")
    title_color: Mapped[str] = mapped_column(String(50), default="rgba(0,0,0,1)")
    subtitle: Mapped[str] = mapped_column(String(500), default="")
    product_title_override: Mapped[str | None] = mapped_column(String(255))
    product_description_override: Mapped[str | None] = mapped_column(Text)
    product_price_color: Mapped[str] = mapped_column(String(50), default="rgba(0,0,0,1)")

    # Display options
    show_quantity_selector: Mapped[bool] = mapped_column(Boolean, default=False)
    hide_close_icon: Mapped[bool] = mapped_column(Boolean, default=False)
    hide_variant_selector: Mapped[bool] = mapped_column(Boolean, default=False)

    # Countdown
    countdown_label: Mapped[str] = mapped_column(String(255), default="")
    countdown_hours: Mapped[int] = mapped_column(Integer, default=0)
    countdown_minutes: Mapped[int] = mapped_column(Integer, default=0)
    countdown_seconds: Mapped[int] = mapped_column(Integer, default=0)

    # Add button
    add_button_text: Mapped[str] = mapped_column(String(100), default="Agregar a tu pedido")
    add_button_animation: Mapped[str] = mapped_column(String(20), default="none")
    add_button_icon: Mapped[str | None] = mapped_column(String(50))
    add_button_bg_color: Mapped[str] = mapped_column(String(50), default="rgba(0,0,0,1)")
    add_button_text_color: Mapped[str] = mapped_column(String(50), default="rgba(255,255,255,1)")
    add_button_font_size: Mapped[int] = mapped_column(Integer, default=16)
    add_button_border_radius: Mapped[int] = mapped_column(Integer, default=8)
    add_button_border_width: Mapped[int] = mapped_column(Integer, default=0)
    add_button_border_color: Mapped[str] = mapped_column(String(50), default="rgba(0,0,0,1)")
    add_button_shadow: Mapped[float] = mapped_column(Float, default=0)

    # Decline button
    decline_button_text: Mapped[str] = mapped_column(String(100), default="No gracias, completar mi pedido")
    decline_button_bg_color: Mapped[str] = mapped_column(String(50), default="rgba(255,255,255,1)")
    decline_button_text_color: Mapped[str] = mapped_column(String(50), default="rgba(0,0,0,1)")
    decline_button_font_size: Mapped[int] = mapped_column(Integer, default=14)
    decline_button_border_radius: Mapped[int] = mapped_column(Integer, default=8)
    decline_button_border_width: Mapped[int] = mapped_column(Integer, default=1)
    decline_button_border_color: Mapped[str] = mapped_column(String(50), default="rgba(0,0,0,1)")
    decline_button_shadow: Mapped[float] = mapped_column(Float, default=0)

    # Stats
    impressions: Mapped[int] = mapped_column(Integer, default=0)
    accepted_count: Mapped[int] = mapped_column(Integer, default=0)

    # Timestamps
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    # Relationships
    upsell_product = relationship("Product", foreign_keys=[upsell_product_id])
