import uuid
from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.api.deps import get_db
from app.models.abandoned_cart import AbandonedCart
from app.models.checkout_offer import QuantityOffer, QuantityOfferTier
from app.models.customer import Customer
from app.models.order import Order, OrderItem
from app.models.product import Product
from app.models.tenant import Tenant
from app.models.upsell import Upsell, UpsellConfig

router = APIRouter(prefix="/api/store", tags=["store-checkout"])


class OrderItemCreate(BaseModel):
    product_id: uuid.UUID
    variant_id: uuid.UUID | None = None
    quantity: int = 1


class OrderCreate(BaseModel):
    customer_name: str
    customer_surname: str | None = None
    customer_phone: str
    customer_email: str | None = None
    customer_dni: str | None = None
    address: str
    city: str
    state: str | None = None
    neighborhood: str | None = None
    zip_code: str | None = None
    address_notes: str | None = None
    notes: str | None = None
    utm_source: str | None = None
    utm_medium: str | None = None
    utm_campaign: str | None = None
    items: list[OrderItemCreate]


class OrderCreatedResponse(BaseModel):
    order_id: uuid.UUID
    order_number: str


class CartCapture(BaseModel):
    session_id: str
    customer_name: str | None = None
    customer_phone: str | None = None
    customer_email: str | None = None
    product_id: uuid.UUID | None = None
    product_name: str | None = None
    variant_name: str | None = None
    quantity: int | None = None
    total_value: float | None = None
    last_step: str | None = None


async def _get_tenant_by_slug(slug: str, db: AsyncSession) -> Tenant:
    result = await db.execute(select(Tenant).where(Tenant.slug == slug, Tenant.is_active == True))
    tenant = result.scalar_one_or_none()
    if not tenant:
        raise HTTPException(status_code=404, detail="Store not found")
    return tenant


@router.post("/{slug}/order", response_model=OrderCreatedResponse)
async def create_order(slug: str, data: OrderCreate, db: AsyncSession = Depends(get_db)):
    tenant = await _get_tenant_by_slug(slug, db)

    if not data.items:
        raise HTTPException(status_code=400, detail="Order must have at least one item")

    # Validate products and calculate totals
    order_items = []
    subtotal = 0

    # Check for quantity offers
    offers_result = await db.execute(
        select(QuantityOffer)
        .where(QuantityOffer.tenant_id == tenant.id, QuantityOffer.is_active == True)
        .options(selectinload(QuantityOffer.tiers))
    )
    all_offers = offers_result.scalars().all()

    for item_data in data.items:
        result = await db.execute(
            select(Product)
            .where(Product.id == item_data.product_id, Product.tenant_id == tenant.id, Product.is_active == True)
            .options(selectinload(Product.variants))
        )
        product = result.scalar_one_or_none()
        if not product:
            raise HTTPException(status_code=400, detail=f"Product {item_data.product_id} not found or inactive")

        unit_price = float(product.price)
        variant_name = None

        if item_data.variant_id:
            variant = next((v for v in product.variants if v.id == item_data.variant_id), None)
            if variant and variant.price_override:
                unit_price = float(variant.price_override)
            if variant:
                variant_name = variant.name

        # Apply quantity offer tiers
        pid_str = str(product.id)
        matched_offer = None
        for qo in all_offers:
            pids = [str(p) for p in (qo.product_ids or [])]
            if pid_str in pids:
                matched_offer = qo
                break

        if matched_offer and matched_offer.tiers:
            # Find the matching tier by quantity
            matched_tier = None
            for tier in sorted(matched_offer.tiers, key=lambda t: t.quantity, reverse=True):
                if item_data.quantity >= tier.quantity:
                    matched_tier = tier
                    break
            if matched_tier and float(matched_tier.discount_value) > 0:
                if matched_tier.discount_type == "percentage":
                    unit_price = unit_price * (1 - float(matched_tier.discount_value) / 100)
                elif matched_tier.discount_type == "fixed":
                    unit_price = max(0, unit_price - float(matched_tier.discount_value))
            # Increment orders_count
            matched_offer.orders_count = (matched_offer.orders_count or 0) + 1

        total_price = unit_price * item_data.quantity
        subtotal += total_price

        order_items.append(OrderItem(
            tenant_id=tenant.id,
            product_id=product.id,
            variant_id=item_data.variant_id,
            product_name=product.name,
            variant_name=variant_name,
            quantity=item_data.quantity,
            unit_price=unit_price,
            total_price=total_price,
            dropi_product_id=product.dropi_product_id,
        ))

    # Generate order number
    count_result = await db.execute(
        select(func.count()).select_from(Order).where(Order.tenant_id == tenant.id)
    )
    count = (count_result.scalar() or 0) + 1
    order_number = f"ORD-{count:04d}"

    order = Order(
        tenant_id=tenant.id,
        order_number=order_number,
        customer_name=data.customer_name,
        customer_surname=data.customer_surname,
        customer_phone=data.customer_phone,
        customer_email=data.customer_email,
        customer_dni=data.customer_dni,
        address=data.address,
        city=data.city,
        state=data.state,
        neighborhood=data.neighborhood,
        zip_code=data.zip_code,
        address_notes=data.address_notes,
        subtotal=subtotal,
        total=subtotal,
        notes=data.notes,
        utm_source=data.utm_source,
        utm_medium=data.utm_medium,
        utm_campaign=data.utm_campaign,
    )
    db.add(order)
    await db.flush()

    for item in order_items:
        item.order_id = order.id
        db.add(item)

    # Update or create customer
    cust_result = await db.execute(
        select(Customer).where(Customer.tenant_id == tenant.id, Customer.phone == data.customer_phone)
    )
    customer = cust_result.scalar_one_or_none()
    if customer:
        customer.total_orders += 1
        customer.total_spent = float(customer.total_spent) + subtotal
        customer.last_order_at = datetime.now(timezone.utc)
        if data.customer_name:
            customer.name = data.customer_name
        if data.city:
            customer.city = data.city
    else:
        customer = Customer(
            tenant_id=tenant.id,
            name=data.customer_name,
            phone=data.customer_phone,
            email=data.customer_email,
            city=data.city,
            address=data.address,
            total_orders=1,
            total_spent=subtotal,
            last_order_at=datetime.now(timezone.utc),
        )
        db.add(customer)

    return OrderCreatedResponse(order_id=order.id, order_number=order_number)


@router.post("/{slug}/cart/capture")
async def capture_cart(slug: str, data: CartCapture, db: AsyncSession = Depends(get_db)):
    tenant = await _get_tenant_by_slug(slug, db)

    result = await db.execute(
        select(AbandonedCart).where(
            AbandonedCart.tenant_id == tenant.id,
            AbandonedCart.session_id == data.session_id,
        )
    )
    cart = result.scalar_one_or_none()

    if cart:
        for key, value in data.model_dump(exclude={"session_id"}, exclude_none=True).items():
            setattr(cart, key, value)
    else:
        cart = AbandonedCart(
            tenant_id=tenant.id,
            session_id=data.session_id,
            **data.model_dump(exclude={"session_id"}, exclude_none=True),
        )
        db.add(cart)

    return {"status": "captured"}


# ── Upsell endpoints ────────────────────────────────────────────────


@router.get("/{slug}/upsells/{product_id}")
async def get_upsells_for_product(
    slug: str,
    product_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
):
    tenant = await _get_tenant_by_slug(slug, db)

    # Get config
    cfg_result = await db.execute(
        select(UpsellConfig).where(UpsellConfig.tenant_id == tenant.id)
    )
    config = cfg_result.scalar_one_or_none()
    if not config or not config.is_active:
        return {"config": None, "upsells": []}

    # Get active upsells
    result = await db.execute(
        select(Upsell)
        .where(Upsell.tenant_id == tenant.id, Upsell.is_active == True)
        .order_by(Upsell.priority.desc(), Upsell.created_at.desc())
    )
    all_upsells = result.scalars().all()

    # Filter by trigger
    pid_str = str(product_id)
    matched = []
    for u in all_upsells:
        if not u.upsell_product_id:
            continue
        if u.trigger_type == "all":
            matched.append(u)
        elif u.trigger_type == "specific":
            pids = [str(p) for p in (u.trigger_product_ids or [])]
            if pid_str in pids:
                matched.append(u)

    # Limit to max
    matched = matched[: config.max_upsells_per_order]

    # Enrich with product info
    enriched = []
    for u in matched:
        data = {c.name: getattr(u, c.name) for c in u.__table__.columns}
        data["upsell_product"] = None
        if u.upsell_product_id:
            p_result = await db.execute(
                select(Product)
                .where(Product.id == u.upsell_product_id, Product.is_active == True)
                .options(selectinload(Product.images), selectinload(Product.variants))
            )
            product = p_result.scalar_one_or_none()
            if product:
                img = product.images[0].image_url if product.images else None
                variants = [
                    {"id": v.id, "name": v.name, "price_override": float(v.price_override) if v.price_override else None}
                    for v in (product.variants or [])
                ]
                data["upsell_product"] = {
                    "id": product.id,
                    "name": product.name,
                    "price": float(product.price),
                    "description": product.description,
                    "image_url": img,
                    "variants": variants,
                }
                enriched.append(data)

    config_data = {c.name: getattr(config, c.name) for c in config.__table__.columns}
    return {"config": config_data, "upsells": enriched}


class UpsellItemCreate(BaseModel):
    product_id: uuid.UUID
    variant_id: uuid.UUID | None = None
    quantity: int = 1
    upsell_id: uuid.UUID


@router.post("/{slug}/order/{order_id}/upsell-item")
async def add_upsell_item(
    slug: str,
    order_id: uuid.UUID,
    data: UpsellItemCreate,
    db: AsyncSession = Depends(get_db),
):
    tenant = await _get_tenant_by_slug(slug, db)

    # Get order
    order_result = await db.execute(
        select(Order).where(Order.id == order_id, Order.tenant_id == tenant.id)
    )
    order = order_result.scalar_one_or_none()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")

    # Get product
    p_result = await db.execute(
        select(Product)
        .where(Product.id == data.product_id, Product.tenant_id == tenant.id, Product.is_active == True)
        .options(selectinload(Product.variants))
    )
    product = p_result.scalar_one_or_none()
    if not product:
        raise HTTPException(status_code=400, detail="Product not found")

    unit_price = float(product.price)
    variant_name = None
    if data.variant_id:
        variant = next((v for v in product.variants if v.id == data.variant_id), None)
        if variant and variant.price_override:
            unit_price = float(variant.price_override)
        if variant:
            variant_name = variant.name

    # Apply upsell discount
    upsell_result = await db.execute(
        select(Upsell).where(Upsell.id == data.upsell_id, Upsell.tenant_id == tenant.id)
    )
    upsell = upsell_result.scalar_one_or_none()
    if upsell:
        if upsell.discount_type == "percentage" and float(upsell.discount_value) > 0:
            unit_price = unit_price * (1 - float(upsell.discount_value) / 100)
        elif upsell.discount_type == "fixed" and float(upsell.discount_value) > 0:
            unit_price = max(0, unit_price - float(upsell.discount_value))
        upsell.accepted_count = (upsell.accepted_count or 0) + 1

    total_price = unit_price * data.quantity

    item = OrderItem(
        order_id=order.id,
        tenant_id=tenant.id,
        product_id=product.id,
        variant_id=data.variant_id,
        product_name=product.name,
        variant_name=variant_name,
        quantity=data.quantity,
        unit_price=unit_price,
        total_price=total_price,
        dropi_product_id=product.dropi_product_id,
    )
    db.add(item)

    # Update order total
    order.subtotal = float(order.subtotal) + total_price
    order.total = float(order.total) + total_price

    await db.flush()

    return {"status": "ok", "item_total": total_price, "new_order_total": float(order.total)}


@router.post("/{slug}/upsells/{upsell_id}/impression")
async def register_upsell_impression(
    slug: str,
    upsell_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
):
    tenant = await _get_tenant_by_slug(slug, db)
    result = await db.execute(
        select(Upsell).where(Upsell.id == upsell_id, Upsell.tenant_id == tenant.id)
    )
    upsell = result.scalar_one_or_none()
    if upsell:
        upsell.impressions = (upsell.impressions or 0) + 1
    return {"status": "ok"}
