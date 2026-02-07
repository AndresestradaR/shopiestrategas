import uuid
from datetime import datetime

from sqlalchemy import JSON, Boolean, DateTime, ForeignKey, Integer, String, func
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base


class CheckoutConfig(Base):
    __tablename__ = "checkout_configs"

    tenant_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("tenants.id"), primary_key=True)

    # CTA button fields
    cta_text: Mapped[str] = mapped_column(String(255), default="Completar pedido - {order_total}")
    cta_subtitle: Mapped[str | None] = mapped_column(String(255))
    cta_animation: Mapped[str] = mapped_column(String(50), default="none")
    cta_icon: Mapped[str | None] = mapped_column(String(50))
    cta_sticky: Mapped[bool] = mapped_column(Boolean, default=True)
    cta_sticky_position: Mapped[str] = mapped_column(String(20), default="bottom")
    cta_bg_color: Mapped[str] = mapped_column(String(9), default="#F59E0B")
    cta_text_color: Mapped[str] = mapped_column(String(9), default="#FFFFFF")
    cta_font_size: Mapped[int] = mapped_column(Integer, default=18)
    cta_border_radius: Mapped[int] = mapped_column(Integer, default=12)
    cta_border_width: Mapped[int] = mapped_column(Integer, default=0)
    cta_border_color: Mapped[str] = mapped_column(String(9), default="#000000")
    cta_shadow: Mapped[str] = mapped_column(String(50), default="lg")
    cta_sticky_mobile: Mapped[bool] = mapped_column(Boolean, default=True)
    cta_subtitle_font_size: Mapped[int] = mapped_column(Integer, default=12)
    cta_font_family: Mapped[str] = mapped_column(String(100), default="Inter, sans-serif")

    # Form style fields
    form_bg_color: Mapped[str] = mapped_column(String(9), default="#FFFFFF")
    form_text_color: Mapped[str] = mapped_column(String(9), default="#1F2937")
    form_font_size: Mapped[int] = mapped_column(Integer, default=14)
    form_border_radius: Mapped[int] = mapped_column(Integer, default=12)
    form_border_width: Mapped[int] = mapped_column(Integer, default=1)
    form_border_color: Mapped[str] = mapped_column(String(9), default="#E5E7EB")
    form_shadow: Mapped[str] = mapped_column(String(50), default="sm")
    form_input_style: Mapped[str] = mapped_column(String(50), default="outline")
    form_font_family: Mapped[str] = mapped_column(String(100), default="Inter, sans-serif")

    # Blocks and custom fields (JSON)
    form_blocks: Mapped[dict | None] = mapped_column(JSON)
    custom_fields: Mapped[dict | None] = mapped_column(JSON)

    # Text fields
    form_title: Mapped[str] = mapped_column(String(255), default="Datos de envio")
    success_message: Mapped[str] = mapped_column(String(500), default="Tu pedido ha sido recibido con exito.")
    shipping_text: Mapped[str] = mapped_column(String(255), default="Envio gratis")
    payment_method_text: Mapped[str] = mapped_column(String(255), default="Pago contraentrega")
    trust_badge_text: Mapped[str] = mapped_column(String(255), default="Pago seguro contraentrega")

    # Toggle fields
    show_product_image: Mapped[bool] = mapped_column(Boolean, default=True)
    show_price_summary: Mapped[bool] = mapped_column(Boolean, default=True)
    show_trust_badges: Mapped[bool] = mapped_column(Boolean, default=True)
    show_shipping_method: Mapped[bool] = mapped_column(Boolean, default=True)

    # Country
    country: Mapped[str] = mapped_column(String(2), default="CO")

    # Timestamps
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    tenant = relationship("Tenant", back_populates="checkout_config")
