import uuid
from datetime import datetime

from pydantic import BaseModel


class StoreConfigResponse(BaseModel):
    tenant_id: uuid.UUID
    store_name: str | None = None
    logo_url: str | None = None
    primary_color: str
    secondary_color: str
    accent_color: str
    font_family: str
    banner_image_url: str | None = None
    banner_title: str | None = None
    banner_subtitle: str | None = None
    meta_pixel_id: str | None = None
    tiktok_pixel_id: str | None = None
    checkout_title: str
    checkout_success_message: str
    checkout_fields: dict | None = None
    whatsapp_number: str | None = None
    voice_enabled: bool
    currency_symbol: str
    currency_code: str
    products_per_row: int
    show_compare_price: bool
    seo_title: str | None = None
    seo_description: str | None = None
    instagram_url: str | None = None
    facebook_url: str | None = None
    tiktok_url: str | None = None
    gemini_api_key: str | None = None

    model_config = {"from_attributes": True}


class StoreConfigUpdate(BaseModel):
    logo_url: str | None = None
    primary_color: str | None = None
    secondary_color: str | None = None
    accent_color: str | None = None
    font_family: str | None = None
    banner_image_url: str | None = None
    banner_title: str | None = None
    banner_subtitle: str | None = None
    meta_pixel_id: str | None = None
    tiktok_pixel_id: str | None = None
    checkout_title: str | None = None
    checkout_success_message: str | None = None
    checkout_fields: dict | None = None
    whatsapp_number: str | None = None
    voice_enabled: bool | None = None
    currency_symbol: str | None = None
    currency_code: str | None = None
    products_per_row: int | None = None
    show_compare_price: bool | None = None
    seo_title: str | None = None
    seo_description: str | None = None
    instagram_url: str | None = None
    facebook_url: str | None = None
    tiktok_url: str | None = None
    gemini_api_key: str | None = None


class StorePageResponse(BaseModel):
    id: uuid.UUID
    title: str
    slug: str
    content: str | None = None
    page_type: str
    show_in_footer: bool
    is_published: bool
    sort_order: int

    model_config = {"from_attributes": True}


class StorePageCreate(BaseModel):
    title: str
    slug: str | None = None
    content: str | None = None
    page_type: str = "policy"
    show_in_footer: bool = True
    is_published: bool = True
    sort_order: int = 0


class StorePageUpdate(BaseModel):
    title: str | None = None
    content: str | None = None
    show_in_footer: bool | None = None
    is_published: bool | None = None
    sort_order: int | None = None


class QuantityOfferTierCreate(BaseModel):
    title: str = ""
    quantity: int = 1
    position: int = 0
    is_preselected: bool = False
    discount_type: str = "percentage"
    discount_value: float = 0
    label_text: str | None = None
    label_bg_color: str = "#F59E0B"
    label_text_color: str = "#FFFFFF"
    label_top_position: str = "left"
    label_inner_text: str | None = None
    label_inner_bg_color: str = "#6B7280"
    label_inner_text_color: str = "#FFFFFF"
    price_color: str = "#059669"
    hide_compare_price: bool = False
    image_url: str | None = None


class QuantityOfferTierResponse(BaseModel):
    id: uuid.UUID
    offer_id: uuid.UUID
    title: str
    quantity: int
    position: int
    is_preselected: bool
    discount_type: str
    discount_value: float
    label_text: str | None = None
    label_bg_color: str
    label_text_color: str
    label_top_position: str = "left"
    label_inner_text: str | None = None
    label_inner_bg_color: str = "#6B7280"
    label_inner_text_color: str = "#FFFFFF"
    price_color: str
    hide_compare_price: bool = False
    image_url: str | None = None

    model_config = {"from_attributes": True}


class QuantityOfferCreate(BaseModel):
    name: str
    is_active: bool = True
    priority: int = 0
    product_ids: list[str] | None = None
    bg_color: str = "#FFFFFF"
    border_color: str = "#E5E7EB"
    selected_border_color: str = "#4DBEA4"
    header_text: str = "Selecciona la cantidad"
    header_bg_color: str = "#F9FAFB"
    header_text_color: str = "#374151"
    hide_product_image: bool = False
    show_savings: bool = True
    show_per_unit: bool = True
    tiers: list[QuantityOfferTierCreate] = []


class QuantityOfferResponse(BaseModel):
    id: uuid.UUID
    tenant_id: uuid.UUID
    name: str
    is_active: bool
    priority: int
    product_ids: list | None = None
    bg_color: str
    border_color: str
    selected_border_color: str
    header_text: str
    header_bg_color: str
    header_text_color: str
    hide_product_image: bool
    show_savings: bool
    show_per_unit: bool
    impressions: int
    orders_count: int
    tiers: list[QuantityOfferTierResponse] = []
    created_at: datetime | None = None
    updated_at: datetime | None = None

    model_config = {"from_attributes": True}


class StoreAppResponse(BaseModel):
    id: uuid.UUID
    app_slug: str
    is_active: bool
    config: dict | None = None

    model_config = {"from_attributes": True}


class StoreAppUpdate(BaseModel):
    is_active: bool | None = None
    config: dict | None = None


class DashboardResponse(BaseModel):
    orders_today: int
    sales_today: float
    abandoned_carts_week: int
    conversion_rate: float


# ── Upsell schemas ──────────────────────────────────────────────────

class UpsellConfigUpdate(BaseModel):
    upsell_type: str | None = None
    max_upsells_per_order: int | None = None
    is_active: bool | None = None


class UpsellConfigResponse(BaseModel):
    id: uuid.UUID
    tenant_id: uuid.UUID
    upsell_type: str
    max_upsells_per_order: int
    is_active: bool
    created_at: datetime | None = None
    updated_at: datetime | None = None

    model_config = {"from_attributes": True}


class UpsellProductInfo(BaseModel):
    id: uuid.UUID
    name: str
    price: float
    image_url: str | None = None

    model_config = {"from_attributes": True}


class UpsellCreate(BaseModel):
    name: str = "Nuevo upsell"
    is_active: bool = True
    priority: int = 0
    trigger_type: str = "all"
    trigger_product_ids: list[str] | None = None
    upsell_product_id: str | None = None
    discount_type: str = "none"
    discount_value: float = 0
    title: str = "Agregar {product_name} a tu pedido!"
    title_color: str = "rgba(0,0,0,1)"
    subtitle: str = ""
    product_title_override: str | None = None
    product_description_override: str | None = None
    product_price_color: str = "rgba(0,0,0,1)"
    show_quantity_selector: bool = False
    hide_close_icon: bool = False
    hide_variant_selector: bool = False
    countdown_label: str = ""
    countdown_hours: int = 0
    countdown_minutes: int = 0
    countdown_seconds: int = 0
    add_button_text: str = "Agregar a tu pedido"
    add_button_animation: str = "none"
    add_button_icon: str | None = None
    add_button_bg_color: str = "rgba(0,0,0,1)"
    add_button_text_color: str = "rgba(255,255,255,1)"
    add_button_font_size: int = 16
    add_button_border_radius: int = 8
    add_button_border_width: int = 0
    add_button_border_color: str = "rgba(0,0,0,1)"
    add_button_shadow: float = 0
    decline_button_text: str = "No gracias, completar mi pedido"
    decline_button_bg_color: str = "rgba(255,255,255,1)"
    decline_button_text_color: str = "rgba(0,0,0,1)"
    decline_button_font_size: int = 14
    decline_button_border_radius: int = 8
    decline_button_border_width: int = 1
    decline_button_border_color: str = "rgba(0,0,0,1)"
    decline_button_shadow: float = 0


class UpsellResponse(BaseModel):
    id: uuid.UUID
    tenant_id: uuid.UUID
    name: str
    is_active: bool
    priority: int
    trigger_type: str
    trigger_product_ids: list | None = None
    upsell_product_id: uuid.UUID | None = None
    discount_type: str
    discount_value: float
    title: str
    title_color: str
    subtitle: str
    product_title_override: str | None = None
    product_description_override: str | None = None
    product_price_color: str
    show_quantity_selector: bool
    hide_close_icon: bool
    hide_variant_selector: bool
    countdown_label: str
    countdown_hours: int
    countdown_minutes: int
    countdown_seconds: int
    add_button_text: str
    add_button_animation: str
    add_button_icon: str | None = None
    add_button_bg_color: str
    add_button_text_color: str
    add_button_font_size: int
    add_button_border_radius: int
    add_button_border_width: int
    add_button_border_color: str
    add_button_shadow: float
    decline_button_text: str
    decline_button_bg_color: str
    decline_button_text_color: str
    decline_button_font_size: int
    decline_button_border_radius: int
    decline_button_border_width: int
    decline_button_border_color: str
    decline_button_shadow: float
    impressions: int
    accepted_count: int
    created_at: datetime | None = None
    updated_at: datetime | None = None
    # Product info (populated via join)
    upsell_product: UpsellProductInfo | None = None

    model_config = {"from_attributes": True}


class StoreUpsellResponse(BaseModel):
    """Upsell data returned to the public store."""
    config: UpsellConfigResponse
    upsells: list[UpsellResponse]

    model_config = {"from_attributes": True}
