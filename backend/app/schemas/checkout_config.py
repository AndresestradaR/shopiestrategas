import uuid
from datetime import datetime

from pydantic import BaseModel


class CheckoutConfigResponse(BaseModel):
    tenant_id: uuid.UUID
    cta_text: str
    cta_subtitle: str | None = None
    cta_animation: str
    cta_icon: str | None = None
    cta_sticky: bool
    cta_sticky_position: str
    cta_bg_color: str
    cta_text_color: str
    cta_font_size: int
    cta_border_radius: int
    cta_border_width: int
    cta_border_color: str
    cta_shadow: str
    cta_sticky_mobile: bool
    cta_subtitle_font_size: int
    cta_font_family: str
    form_bg_color: str
    form_text_color: str
    form_font_size: int
    form_border_radius: int
    form_border_width: int
    form_border_color: str
    form_shadow: str
    form_input_style: str
    form_font_family: str
    form_blocks: list | None = None
    custom_fields: list | None = None
    form_title: str
    success_message: str
    shipping_text: str
    payment_method_text: str
    trust_badge_text: str
    show_product_image: bool
    show_price_summary: bool
    show_trust_badges: bool
    show_shipping_method: bool
    country: str
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


class CheckoutConfigUpdate(BaseModel):
    cta_text: str | None = None
    cta_subtitle: str | None = None
    cta_animation: str | None = None
    cta_icon: str | None = None
    cta_sticky: bool | None = None
    cta_sticky_position: str | None = None
    cta_bg_color: str | None = None
    cta_text_color: str | None = None
    cta_font_size: int | None = None
    cta_border_radius: int | None = None
    cta_border_width: int | None = None
    cta_border_color: str | None = None
    cta_shadow: str | None = None
    cta_sticky_mobile: bool | None = None
    cta_subtitle_font_size: int | None = None
    cta_font_family: str | None = None
    form_bg_color: str | None = None
    form_text_color: str | None = None
    form_font_size: int | None = None
    form_border_radius: int | None = None
    form_border_width: int | None = None
    form_border_color: str | None = None
    form_shadow: str | None = None
    form_input_style: str | None = None
    form_font_family: str | None = None
    form_blocks: list | None = None
    custom_fields: list | None = None
    form_title: str | None = None
    success_message: str | None = None
    shipping_text: str | None = None
    payment_method_text: str | None = None
    trust_badge_text: str | None = None
    show_product_image: bool | None = None
    show_price_summary: bool | None = None
    show_trust_badges: bool | None = None
    show_shipping_method: bool | None = None
    country: str | None = None
