# PROGRESS.md — MiniShop Build Progress

> Este archivo es actualizado por Claude Code después de cada tarea completada.
> Ralph lee este archivo para saber qué ya está hecho y qué sigue.

## Estado actual: FASE 12 EN PROGRESO

### FASE 1: Setup & Infraestructura
- [x] 1.1 — docker-compose.yml (PostgreSQL + Redis)
- [x] 1.2 — requirements.txt
- [x] 1.3 — config.py (Settings)
- [x] 1.4 — database.py (async engine)
- [x] 1.5 — main.py (FastAPI app)
- [x] 1.6 — Alembic setup

### FASE 2: Modelos de Base de Datos
- [x] 2.1 — Modelo Tenant
- [x] 2.2 — Modelo StoreConfig
- [x] 2.3 — Modelo Product
- [x] 2.4 — Modelo ProductImage
- [x] 2.5 — Modelo ProductVariant
- [x] 2.6 — Modelo Order
- [x] 2.7 — Modelo OrderItem
- [x] 2.8 — Modelo StorePage
- [x] 2.9 — Modelo AbandonedCart
- [x] 2.10 — Modelo CheckoutOffer
- [x] 2.11 — Modelo Customer
- [x] 2.12 — Modelo StoreApp
- [x] 2.13 — Modelo Testimonial
- [x] 2.14 — Modelo TenantDomain
- [x] 2.15 — __init__.py + migración inicial

### FASE 3: Auth & Seguridad
- [x] 3.1 — security.py (JWT + bcrypt)
- [x] 3.2 — slugify.py
- [x] 3.3 — deps.py (dependencies)
- [x] 3.4 — auth endpoints
- [x] 3.5 — test conftest.py
- [x] 3.6 — test auth

### FASE 4: API Admin — Productos
- [x] 4.1 — Schemas producto
- [x] 4.2 — CRUD listar + crear
- [x] 4.3 — Detalle + actualizar + eliminar
- [x] 4.4 — Subir imagen
- [x] 4.5 — Eliminar imagen
- [x] 4.6 — CRUD variantes
- [x] 4.7 — Tests productos

### FASE 5: API Admin — Pedidos
- [x] 5.1 — Schemas pedidos
- [x] 5.2 — Listar + detalle
- [x] 5.3 — Cambiar estado
- [x] 5.4 — Servicio exportar Excel Dropi
- [x] 5.5 — Endpoint exportar Excel
- [x] 5.6 — Tests pedidos

### FASE 6: API Admin — Config, Páginas, Checkout
- [x] 6.1 — Config endpoints
- [x] 6.2 — Pages CRUD + defaults
- [x] 6.3 — Checkout offers CRUD
- [x] 6.4 — Apps endpoints
- [x] 6.5 — Analytics dashboard

### FASE 7: API Pública — Tienda & Checkout
- [x] 7.1 — Middleware tenant
- [x] 7.2 — Catálogo público
- [x] 7.3 — Checkout (crear pedido)
- [x] 7.4 — Captura carrito abandonado
- [x] 7.5 — Admin carritos
- [x] 7.6 — Tests checkout

### FASE 8: Frontend Admin — Setup & Layout
- [x] 8.1 — Vite + React + Tailwind
- [x] 8.2 — Dependencias npm
- [x] 8.3 — Axios client con JWT
- [x] 8.4 — BuilderLayout + Sidebar
- [x] 8.5 — Router + auth guard

### FASE 9: Frontend Admin — Páginas Core
- [x] 9.1 — Login + Register
- [x] 9.2 — Dashboard
- [x] 9.3 — Products list
- [x] 9.4 — Product edit (full form)
- [x] 9.5 — Orders list
- [x] 9.6 — Order detail
- [x] 9.7 — Abandoned carts
- [x] 9.8 — Customers

### FASE 10: Frontend Admin — Configuración
- [x] 10.1 — Checkout config
- [x] 10.2 — Policies editor
- [x] 10.3 — Apps marketplace
- [x] 10.4 — General settings
- [x] 10.5 — Domain config
- [x] 10.6 — Pixels config
- [x] 10.7 — Analytics dashboard

### FASE 11: Frontend Tienda Pública
- [x] 11.1 — Vite + React + Tailwind
- [x] 11.2 — useStore hook
- [x] 11.3 — Router
- [x] 11.4 — Home page
- [x] 11.5 — ProductCard
- [x] 11.6 — Product detail
- [x] 11.7 — Checkout form
- [x] 11.8 — QuantityOffers
- [x] 11.9 — Confirm page
- [x] 11.10 — Pixel Provider
- [x] 11.11 — WhatsApp button
- [x] 11.12 — Dynamic styles

### FASE 12: Integración & Polish
- [ ] 12.1 — Image upload service
- [ ] 12.2 — Excel export real
- [ ] 12.3 — Docker compose completo
- [ ] 12.4 — README.md
- [ ] 12.5 — Tenant isolation tests
- [ ] 12.6 — CORS config

---

## Log de cambios
<!-- Ralph agrega aquí cada tarea completada con timestamp -->
- [x] 1.1 — docker-compose.yml con PostgreSQL 16 y Redis 7 (2026-02-05)
- [x] 1.2 — backend/requirements.txt con todas las dependencias (2026-02-05)
- [x] 1.3 — config.py con Settings pydantic-settings (2026-02-05)
- [x] 1.4 — database.py con async engine, sessionmaker, Base, get_db (2026-02-05)
- [x] 1.5 — main.py con FastAPI app, CORS, health check (2026-02-05)
- [x] 1.6 — Alembic setup async con migrations/env.py (2026-02-05)
- [x] 2.1–2.15 — Todos los modelos de base de datos + __init__.py (2026-02-05)
- [x] 3.1–3.6 — Auth completo: security, slugify, deps, endpoints, tests (6/6 pass) (2026-02-05)
- [x] 4.1–4.7 — Products API: schemas, CRUD, images, variants, tests (6/6 pass) (2026-02-05)
- [x] 5.1–5.6 — Orders API: schemas, CRUD, status, Excel export, tests (4/4 pass) (2026-02-05)
- [x] 6.1–6.5 — Config, pages, checkout offers, apps, analytics endpoints (2026-02-05)
- [x] 7.1–7.6 — Public API: tenant middleware, catalog, checkout, cart capture, tests (4/4 pass) (2026-02-05)
- [x] 8.1–8.5 — Frontend admin: Vite+React+Tailwind, deps, Axios client, BuilderLayout, Router (2026-02-05)
- [x] 9.1–9.8 — Admin pages: Login, Register, Dashboard, Products, Orders, AbandonedCarts, Customers (2026-02-05)
- [x] 10.1–10.7 — Config pages: Checkout, Policies, Apps, Settings, Domain, Pixels, Analytics (2026-02-05)
- [x] 11.1–11.12 — Frontend store: Home, Product, Checkout, Confirm, PixelProvider, WhatsApp, Dynamic styles (2026-02-05)
