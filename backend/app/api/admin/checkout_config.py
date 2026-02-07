from fastapi import APIRouter, Depends, UploadFile
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_db, require_active_tenant
from app.models.checkout_config import CheckoutConfig
from app.models.tenant import Tenant
from app.schemas.checkout_config import CheckoutConfigResponse, CheckoutConfigUpdate
from app.services.image_upload import validate_and_save_image

router = APIRouter(prefix="/api/admin/checkout-config", tags=["admin-checkout-config"])

DEFAULT_BLOCKS = [
    {"type": "product_card", "position": 0, "enabled": True},
    {"type": "offers", "position": 1, "enabled": True},
    {"type": "variants", "position": 2, "enabled": True},
    {"type": "price_summary", "position": 3, "enabled": True},
    {"type": "field", "position": 4, "enabled": True, "field_key": "customer_first_name", "label": "Nombre", "placeholder": "Nombre", "required": True, "icon": "user"},
    {"type": "field", "position": 5, "enabled": True, "field_key": "customer_last_name", "label": "Apellido", "placeholder": "Apellido", "required": True, "icon": "user"},
    {"type": "field", "position": 6, "enabled": True, "field_key": "customer_phone", "label": "Telefono", "placeholder": "WhatsApp", "required": True, "icon": "phone", "input_type": "tel"},
    {"type": "field", "position": 7, "enabled": True, "field_key": "address", "label": "Direccion", "placeholder": "Calle carrera #casa", "required": True, "icon": "map-pin"},
    {"type": "field", "position": 8, "enabled": True, "field_key": "address_extra", "label": "Complemento direccion", "placeholder": "Barrio y punto de referencia", "required": False, "icon": "map-pin"},
    {"type": "field", "position": 9, "enabled": True, "field_key": "state", "label": "Departamento", "placeholder": "Departamento", "required": True, "icon": "map-pin"},
    {"type": "field", "position": 10, "enabled": True, "field_key": "city", "label": "Ciudad", "placeholder": "Ciudad", "required": True, "icon": "map-pin"},
    {"type": "field", "position": 11, "enabled": True, "field_key": "email", "label": "Correo electronico", "placeholder": "email@ejemplo.com", "required": False, "icon": "mail", "input_type": "email"},
    {"type": "field", "position": 12, "enabled": True, "field_key": "notes", "label": "Notas adicionales", "placeholder": "Indicaciones especiales para la entrega...", "required": False, "icon": "note", "input_type": "textarea"},
    {"type": "trust_badge", "position": 13, "enabled": True},
    {"type": "shipping_info", "position": 14, "enabled": True},
    {"type": "payment_method", "position": 15, "enabled": True},
    {"type": "submit_button", "position": 16, "enabled": True},
]


@router.get("", response_model=CheckoutConfigResponse)
async def get_checkout_config(
    db: AsyncSession = Depends(get_db),
    tenant: Tenant = Depends(require_active_tenant),
):
    result = await db.execute(
        select(CheckoutConfig).where(CheckoutConfig.tenant_id == tenant.id)
    )
    config = result.scalar_one_or_none()
    if not config:
        config = CheckoutConfig(tenant_id=tenant.id, form_blocks=DEFAULT_BLOCKS)
        db.add(config)
        await db.flush()
        await db.refresh(config)
    return config


@router.put("", response_model=CheckoutConfigResponse)
async def update_checkout_config(
    data: CheckoutConfigUpdate,
    db: AsyncSession = Depends(get_db),
    tenant: Tenant = Depends(require_active_tenant),
):
    result = await db.execute(
        select(CheckoutConfig).where(CheckoutConfig.tenant_id == tenant.id)
    )
    config = result.scalar_one_or_none()
    if not config:
        config = CheckoutConfig(tenant_id=tenant.id, form_blocks=DEFAULT_BLOCKS)
        db.add(config)
        await db.flush()

    for key, value in data.model_dump(exclude_unset=True).items():
        setattr(config, key, value)

    await db.flush()
    await db.refresh(config)
    return config


@router.post("/reset", response_model=CheckoutConfigResponse)
async def reset_checkout_config(
    db: AsyncSession = Depends(get_db),
    tenant: Tenant = Depends(require_active_tenant),
):
    result = await db.execute(
        select(CheckoutConfig).where(CheckoutConfig.tenant_id == tenant.id)
    )
    config = result.scalar_one_or_none()
    if not config:
        config = CheckoutConfig(tenant_id=tenant.id, form_blocks=DEFAULT_BLOCKS)
        db.add(config)
    else:
        config.form_blocks = DEFAULT_BLOCKS
        config.cta_text = "Completar pedido - {order_total}"
        config.cta_subtitle = None
        config.cta_animation = "none"
        config.cta_icon = None
        config.cta_sticky = True
        config.cta_sticky_position = "bottom"
        config.cta_bg_color = "#F59E0B"
        config.cta_text_color = "#FFFFFF"
        config.cta_font_size = 18
        config.cta_border_radius = 12
        config.cta_border_width = 0
        config.cta_border_color = "#000000"
        config.cta_shadow = "lg"
        config.cta_sticky_mobile = True
        config.form_bg_color = "#FFFFFF"
        config.form_text_color = "#1F2937"
        config.form_font_size = 14
        config.form_border_radius = 12
        config.form_border_width = 1
        config.form_border_color = "#E5E7EB"
        config.form_shadow = "sm"
        config.form_input_style = "outline"
        config.custom_fields = None
        config.form_title = "Datos de envio"
        config.success_message = "Tu pedido ha sido recibido con exito."
        config.shipping_text = "Envio gratis"
        config.payment_method_text = "Pago contraentrega"
        config.trust_badge_text = "Pago seguro contraentrega"
        config.show_product_image = True
        config.show_price_summary = True
        config.show_trust_badges = True
        config.show_shipping_method = True
        config.country = "CO"

    await db.flush()
    await db.refresh(config)
    return config


@router.post("/upload-image")
async def upload_checkout_image(
    file: UploadFile,
    db: AsyncSession = Depends(get_db),
    tenant: Tenant = Depends(require_active_tenant),
):
    image_url = await validate_and_save_image(file, tenant.id, subfolder="checkout")
    return {"url": image_url}
