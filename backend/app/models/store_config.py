import uuid

from sqlalchemy import JSON, ForeignKey, Integer, String
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base


class StoreConfig(Base):
    __tablename__ = "store_configs"

    tenant_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("tenants.id"), primary_key=True)
    logo_url: Mapped[str | None] = mapped_column(String(500))
    primary_color: Mapped[str] = mapped_column(String(7), default="#4DBEA4")
    secondary_color: Mapped[str] = mapped_column(String(7), default="#0D1717")
    accent_color: Mapped[str] = mapped_column(String(7), default="#FFD700")
    font_family: Mapped[str] = mapped_column(String(100), default="Inter")
    banner_image_url: Mapped[str | None] = mapped_column(String(500))
    banner_title: Mapped[str | None] = mapped_column(String(255))
    banner_subtitle: Mapped[str | None] = mapped_column(String(500))
    meta_pixel_id: Mapped[str | None] = mapped_column(String(100))
    tiktok_pixel_id: Mapped[str | None] = mapped_column(String(100))
    checkout_title: Mapped[str] = mapped_column(String(255), default="Finalizar pedido")
    checkout_success_message: Mapped[str] = mapped_column(String(500), default="Tu pedido ha sido recibido con éxito.")
    checkout_fields: Mapped[dict | None] = mapped_column(JSON)
    whatsapp_number: Mapped[str | None] = mapped_column(String(20))
    voice_enabled: Mapped[bool] = mapped_column(default=False)
    currency_symbol: Mapped[str] = mapped_column(String(5), default="$")
    currency_code: Mapped[str] = mapped_column(String(3), default="COP")
    products_per_row: Mapped[int] = mapped_column(Integer, default=3)
    show_compare_price: Mapped[bool] = mapped_column(default=True)
    seo_title: Mapped[str | None] = mapped_column(String(255))
    seo_description: Mapped[str | None] = mapped_column(String(500))
    instagram_url: Mapped[str | None] = mapped_column(String(500))
    facebook_url: Mapped[str | None] = mapped_column(String(500))
    tiktok_url: Mapped[str | None] = mapped_column(String(500))

    tenant = relationship("Tenant", back_populates="store_config")
