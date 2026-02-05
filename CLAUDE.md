# CLAUDE.md — MiniShop by Estrategas IA

## Qué es este proyecto

MiniShop es una plataforma SaaS multi-tenant para crear tiendas de dropshipping en LATAM.
Los usuarios acceden desde estrategasia.com, crean su tienda, y el constructor se abre en una nueva pestaña
en `estrategasia.com/constructor/{slug}`. Las tiendas públicas viven en `{slug}.minishop.co` o dominio propio.

**Core:** Checkout de contraentrega (sin pasarelas de pago). Los pedidos se exportan en Excel formato Dropi
o se envían directo a la API de Dropi.

## Stack

- **Backend:** FastAPI (Python 3.11+), SQLAlchemy async, Alembic migrations, PostgreSQL 16
- **Frontend Admin (Builder):** React 18 + Vite + Tailwind CSS
- **Frontend Tienda (Público):** React 18 + Vite (SSR con vite-plugin-ssr o similar para SEO)
- **Base de datos:** PostgreSQL 16 con pgcrypto
- **Auth:** JWT (access + refresh tokens)
- **Storage:** Local filesystem para dev, Cloudflare R2 para producción
- **Tests:** pytest + httpx para backend, Vitest para frontend

## Estructura del proyecto

```
minishop/
├── CLAUDE.md                    ← Estás aquí
├── PRD.md                       ← Requisitos del producto
├── PROGRESS.md                  ← Tracking de progreso
│
├── backend/
│   ├── app/
│   │   ├── main.py              # FastAPI app + middleware
│   │   ├── config.py            # Settings con pydantic-settings
│   │   ├── database.py          # SQLAlchemy async engine + session
│   │   │
│   │   ├── middleware/
│   │   │   └── tenant.py        # Resolver tenant desde dominio/slug
│   │   │
│   │   ├── models/              # SQLAlchemy models
│   │   │   ├── __init__.py
│   │   │   ├── tenant.py
│   │   │   ├── product.py
│   │   │   ├── order.py
│   │   │   ├── store_config.py
│   │   │   ├── store_page.py
│   │   │   ├── abandoned_cart.py
│   │   │   ├── checkout_offer.py
│   │   │   ├── store_app.py
│   │   │   ├── testimonial.py
│   │   │   ├── customer.py
│   │   │   └── store_visit.py
│   │   │
│   │   ├── schemas/             # Pydantic schemas (request/response)
│   │   │   ├── __init__.py
│   │   │   ├── tenant.py
│   │   │   ├── product.py
│   │   │   ├── order.py
│   │   │   └── store.py
│   │   │
│   │   ├── api/
│   │   │   ├── __init__.py
│   │   │   ├── auth.py          # Register, Login, Refresh, Me
│   │   │   ├── deps.py          # Dependencies (get_db, get_current_tenant)
│   │   │   ├── admin/
│   │   │   │   ├── __init__.py
│   │   │   │   ├── products.py
│   │   │   │   ├── orders.py
│   │   │   │   ├── config.py
│   │   │   │   ├── pages.py
│   │   │   │   ├── checkout.py
│   │   │   │   ├── apps.py
│   │   │   │   └── analytics.py
│   │   │   └── store/
│   │   │       ├── __init__.py
│   │   │       ├── catalog.py   # Endpoints públicos
│   │   │       └── checkout.py  # Crear pedido
│   │   │
│   │   ├── services/
│   │   │   ├── __init__.py
│   │   │   ├── dropi_export.py  # Generar Excel formato Dropi
│   │   │   ├── image_upload.py  # Upload de imágenes
│   │   │   └── abandoned_cart.py # Lógica carritos abandonados
│   │   │
│   │   └── utils/
│   │       ├── __init__.py
│   │       ├── security.py      # JWT, password hashing
│   │       └── slugify.py       # Generar slugs
│   │
│   ├── migrations/              # Alembic
│   │   └── versions/
│   ├── alembic.ini
│   ├── tests/
│   │   ├── conftest.py          # Fixtures: test DB, test client, test tenant
│   │   ├── test_auth.py
│   │   ├── test_products.py
│   │   ├── test_orders.py
│   │   └── test_checkout.py
│   ├── requirements.txt
│   └── Dockerfile
│
├── frontend-admin/              # Builder (React + Vite)
│   ├── src/
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   ├── api/                 # Axios client + hooks
│   │   ├── pages/
│   │   │   ├── Dashboard.jsx
│   │   │   ├── Products.jsx
│   │   │   ├── ProductEdit.jsx
│   │   │   ├── Orders.jsx
│   │   │   ├── OrderDetail.jsx
│   │   │   ├── AbandonedCarts.jsx
│   │   │   ├── Customers.jsx
│   │   │   ├── Homepage.jsx     # Editor de secciones
│   │   │   ├── Checkout.jsx     # Config checkout + ofertas
│   │   │   ├── Policies.jsx
│   │   │   ├── Analytics.jsx
│   │   │   ├── Apps.jsx
│   │   │   ├── Settings.jsx
│   │   │   ├── Domain.jsx
│   │   │   └── Pixels.jsx
│   │   ├── components/
│   │   └── layouts/
│   │       └── BuilderLayout.jsx # Sidebar + content
│   ├── package.json
│   ├── vite.config.js
│   └── tailwind.config.js
│
├── frontend-store/              # Tienda pública
│   ├── src/
│   │   ├── App.jsx
│   │   ├── pages/
│   │   │   ├── Home.jsx
│   │   │   ├── Product.jsx
│   │   │   ├── Checkout.jsx
│   │   │   ├── Confirm.jsx
│   │   │   └── Page.jsx         # Políticas dinámicas
│   │   ├── components/
│   │   │   ├── ProductCard.jsx
│   │   │   ├── CheckoutForm.jsx
│   │   │   ├── QuantityOffers.jsx
│   │   │   ├── PixelProvider.jsx
│   │   │   ├── VoiceWidget.jsx
│   │   │   └── WhatsAppButton.jsx
│   │   └── hooks/
│   │       └── useStore.js      # Fetch store config + products
│   ├── package.json
│   └── vite.config.js
│
└── docker-compose.yml           # PostgreSQL + Redis para dev
```

## Convenciones

### Backend (Python)
- Usar async/await en todas las rutas y queries
- SQLAlchemy 2.0 style (select(), session.execute())
- Pydantic v2 para schemas
- Todas las tablas tienen `tenant_id` — NUNCA devolver datos de otro tenant
- Passwords: bcrypt via passlib
- JWT: python-jose con HS256
- Tests: pytest-asyncio, httpx.AsyncClient
- Imports absolutos: `from app.models.product import Product`

### Frontend (React)
- Functional components con hooks
- Tailwind CSS para estilos (NO CSS modules, NO styled-components)
- React Router v6 para routing
- Axios para API calls con interceptors para JWT
- Estado: React Query (TanStack Query) para server state
- Forms: react-hook-form

### Git
- Conventional commits: `feat:`, `fix:`, `test:`, `refactor:`, `docs:`
- Un commit por feature/tarea implementada
- Branch: `main` para desarrollo

### Prioridades
1. Que funcione (correctitud)
2. Que tenga tests
3. Que sea legible
4. Performance (después)

## Países y Monedas

| País | Código | Moneda | Símbolo | Dropi URL |
|------|--------|--------|---------|-----------|
| Colombia | CO | COP | $ | api.dropi.co |
| México | MX | MXN | $ | api.dropi.mx |
| Guatemala | GT | GTQ | Q | api.dropi.gt |
| Perú | PE | PEN | S/ | api.dropi.pe |
| Ecuador | EC | USD | $ | api.dropi.ec |
| Chile | CL | CLP | $ | api.dropi.cl |

## Formato Excel Dropi (para exportación de pedidos)

| Col | Campo | Descripción |
|-----|-------|-------------|
| A | Nombre | customer_name |
| B | Apellido | customer_surname |
| C | Teléfono | customer_phone |
| D | Dirección | address |
| E | Ciudad | city |
| F | Departamento | state |
| G | Email | customer_email |
| H | Cédula | customer_dni |
| I | Notas | notes |
| J | Producto | product_name del order_item |
| K | Cantidad | quantity del order_item |
| L | Precio Total | total_price del order_item |
| M | ID Producto Dropi | dropi_product_id |
| N | ID Variación | dropi_variation_id |

## Ofertas por cantidad (checkout)

El checkout soporta reglas de precio por cantidad estilo Releasit:
```json
[
  {"quantity": 1, "price": 89900, "label": null},
  {"quantity": 2, "price": 79900, "label": "Más popular", "is_highlighted": true},
  {"quantity": 3, "price": 69900, "label": "Mejor oferta"}
]
```

## Carritos abandonados

El checkout captura datos progresivamente con `onBlur`:
1. `customer_name` → se guarda
2. `customer_phone` → se guarda
3. `customer_email` → se guarda
4. Si no hace submit → queda como `status: ABANDONED`

Se necesita un endpoint `POST /api/store/{slug}/cart/capture` que recibe campos parciales.

## Pixel Events

| Acción | Meta Event | TikTok Event |
|--------|-----------|--------------|
| Cualquier página | PageView | page |
| Ver producto | ViewContent | ViewContent |
| Abrir checkout | InitiateCheckout | InitiateCheckout |
| Submit pedido | Lead + Purchase | SubmitForm + CompletePayment |

## Notas importantes

- TODO es contraentrega. No hay pasarelas de pago.
- Solo idioma español.
- Los precios se formatean según el país (COP: $89.900, MXN: $1,299).
- El middleware de tenant resuelve por subdominio ({slug}.minishop.co) o dominio custom.
- Siempre validar que el tenant está activo antes de servir la tienda.
- Las imágenes de productos se suben a /uploads/{tenant_id}/products/ en dev.
