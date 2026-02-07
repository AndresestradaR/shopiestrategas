import uuid

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
    created_at: str | None = None
    updated_at: str | None = None

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
