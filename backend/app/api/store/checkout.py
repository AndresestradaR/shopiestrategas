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
