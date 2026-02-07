import uuid
from datetime import datetime

from sqlalchemy import Boolean, DateTime, ForeignKey, String, func
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base


class Tenant(Base):
    __tablename__ = "tenants"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    email: Mapped[str] = mapped_column(String(255), unique=True, nullable=False)
    password_hash: Mapped[str] = mapped_column(String(255), nullable=False)
    store_name: Mapped[str] = mapped_column(String(255), nullable=False)
    slug: Mapped[str] = mapped_column(String(255), unique=True, nullable=False)
    phone: Mapped[str | None] = mapped_column(String(50))
    country: Mapped[str] = mapped_column(String(2), default="CO")
    plan: Mapped[str] = mapped_column(String(20), default="free")
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    dropi_email: Mapped[str | None] = mapped_column(String(255))
    dropi_token: Mapped[str | None] = mapped_column(String(500))
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    store_config = relationship("StoreConfig", back_populates="tenant", uselist=False)
    checkout_config = relationship("CheckoutConfig", back_populates="tenant", uselist=False)
    products = relationship("Product", back_populates="tenant")
    orders = relationship("Order", back_populates="tenant")
    pages = relationship("StorePage", back_populates="tenant")
    domains = relationship("TenantDomain", back_populates="tenant")


class TenantDomain(Base):
    __tablename__ = "tenant_domains"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    tenant_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("tenants.id"), nullable=False)
    domain: Mapped[str] = mapped_column(String(255), unique=True, nullable=False)
    is_primary: Mapped[bool] = mapped_column(Boolean, default=False)
    is_verified: Mapped[bool] = mapped_column(Boolean, default=False)
    ssl_status: Mapped[str | None] = mapped_column(String(50))
    verification_token: Mapped[str | None] = mapped_column(String(255))

    tenant = relationship("Tenant", back_populates="domains")
