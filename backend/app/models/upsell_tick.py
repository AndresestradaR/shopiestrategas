import uuid
from datetime import datetime

from sqlalchemy import Boolean, DateTime, Float, ForeignKey, Integer, Numeric, String, Text, func
from sqlalchemy.dialects.postgresql import JSON, UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base


class UpsellTick(Base):
    __tablename__ = "upsell_ticks"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    tenant_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("tenants.id"), nullable=False)
    name: Mapped[str] = mapped_column(String(255), nullable=False, default="Nuevo upsell")
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    priority: Mapped[int] = mapped_column(Integer, default=0)

    # Trigger: para qué productos aparece este upsell
    trigger_type: Mapped[str] = mapped_column(String(20), default="all")  # "all" | "specific"
    trigger_product_ids: Mapped[list | None] = mapped_column(JSON, default=list)

    # Producto vinculado (opcional)
    link_product: Mapped[bool] = mapped_column(Boolean, default=False)
    linked_product_id: Mapped[uuid.UUID | None] = mapped_column(
        UUID(as_uuid=True), ForeignKey("products.id", ondelete="SET NULL")
    )

    # Personalización
    upsell_title: Mapped[str] = mapped_column(String(255), default="Nombre Oferta")
    upsell_price: Mapped[float] = mapped_column(Numeric(12, 2), default=0)
    checkbox_text: Mapped[str] = mapped_column(String(500), default="Agrega {title} por solo {price}")
    description_text: Mapped[str] = mapped_column(Text, default="")
    preselected: Mapped[bool] = mapped_column(Boolean, default=False)
    image_url: Mapped[str | None] = mapped_column(String(500))

    # Colores de texto
    text_color: Mapped[str] = mapped_column(String(50), default="rgba(0,0,0,1)")
    description_color: Mapped[str] = mapped_column(String(50), default="rgba(89,89,89,1)")

    # Estilo de la caja/card
    bg_color: Mapped[str] = mapped_column(String(50), default="rgba(217,235,246,1)")
    border_style: Mapped[str] = mapped_column(String(20), default="solid")
    border_width: Mapped[int] = mapped_column(Integer, default=1)
    border_color: Mapped[str] = mapped_column(String(50), default="rgba(0,116,191,1)")
    border_radius: Mapped[int] = mapped_column(Integer, default=8)

    # Stats
    impressions: Mapped[int] = mapped_column(Integer, default=0)
    accepted_count: Mapped[int] = mapped_column(Integer, default=0)

    # Timestamps
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    # Relationships
    linked_product_rel = relationship("Product", foreign_keys=[linked_product_id])
