# PROGRESS.md — MiniShop Build Progress

> Este archivo es actualizado por Claude Code después de cada tarea completada.
> Ralph lee este archivo para saber qué ya está hecho y qué sigue.

## Estado actual: FASE 2 EN PROGRESO

### FASE 1: Setup & Infraestructura
- [x] 1.1 — docker-compose.yml (PostgreSQL + Redis)
- [x] 1.2 — requirements.txt
- [x] 1.3 — config.py (Settings)
- [x] 1.4 — database.py (async engine)
- [x] 1.5 — main.py (FastAPI app)
- [x] 1.6 — Alembic setup

### FASE 2: Modelos de Base de Datos
- [ ] 2.1 — Modelo Tenant
- [ ] 2.2 — Modelo StoreConfig
- [ ] 2.3 — Modelo Product
- [ ] 2.4 — Modelo ProductImage
- [ ] 2.5 — Modelo ProductVariant
- [ ] 2.6 — Modelo Order
- [ ] 2.7 — Modelo OrderItem
- [ ] 2.8 — Modelo StorePage
- [ ] 2.9 — Modelo AbandonedCart
- [ ] 2.10 — Modelo CheckoutOffer
- [ ] 2.11 — Modelo Customer
- [ ] 2.12 — Modelo StoreApp
- [ ] 2.13 — Modelo Testimonial
- [ ] 2.14 — Modelo TenantDomain
- [ ] 2.15 — __init__.py + migración inicial

### FASE 3: Auth & Seguridad
- [ ] 3.1 — security.py (JWT + bcrypt)
- [ ] 3.2 — slugify.py
- [ ] 3.3 — deps.py (dependencies)
- [ ] 3.4 — auth endpoints
- [ ] 3.5 — test conftest.py
- [ ] 3.6 — test auth

### FASE 4: API Admin — Productos
- [ ] 4.1 — Schemas producto
- [ ] 4.2 — CRUD listar + crear
- [ ] 4.3 — Detalle + actualizar + eliminar
- [ ] 4.4 — Subir imagen
- [ ] 4.5 — Eliminar imagen
- [ ] 4.6 — CRUD variantes
- [ ] 4.7 — Tests productos

### FASE 5: API Admin — Pedidos
- [ ] 5.1 — Schemas pedidos
- [ ] 5.2 — Listar + detalle
- [ ] 5.3 — Cambiar estado
- [ ] 5.4 — Servicio exportar Excel Dropi
- [ ] 5.5 — Endpoint exportar Excel
- [ ] 5.6 — Tests pedidos

### FASE 6: API Admin — Config, Páginas, Checkout
- [ ] 6.1 — Config endpoints
- [ ] 6.2 — Pages CRUD + defaults
- [ ] 6.3 — Checkout offers CRUD
- [ ] 6.4 — Apps endpoints
- [ ] 6.5 — Analytics dashboard

### FASE 7: API Pública — Tienda & Checkout
- [ ] 7.1 — Middleware tenant
- [ ] 7.2 — Catálogo público
- [ ] 7.3 — Checkout (crear pedido)
- [ ] 7.4 — Captura carrito abandonado
- [ ] 7.5 — Admin carritos
- [ ] 7.6 — Tests checkout

### FASE 8: Frontend Admin — Setup & Layout
- [ ] 8.1 — Vite + React + Tailwind
- [ ] 8.2 — Dependencias npm
- [ ] 8.3 — Axios client con JWT
- [ ] 8.4 — BuilderLayout + Sidebar
- [ ] 8.5 — Router + auth guard

### FASE 9: Frontend Admin — Páginas Core
- [ ] 9.1 — Login + Register
- [ ] 9.2 — Dashboard
- [ ] 9.3 — Products list
- [ ] 9.4 — Product edit (full form)
- [ ] 9.5 — Orders list
- [ ] 9.6 — Order detail
- [ ] 9.7 — Abandoned carts
- [ ] 9.8 — Customers

### FASE 10: Frontend Admin — Configuración
- [ ] 10.1 — Checkout config
- [ ] 10.2 — Policies editor
- [ ] 10.3 — Apps marketplace
- [ ] 10.4 — General settings
- [ ] 10.5 — Domain config
- [ ] 10.6 — Pixels config
- [ ] 10.7 — Analytics dashboard

### FASE 11: Frontend Tienda Pública
- [ ] 11.1 — Vite + React + Tailwind
- [ ] 11.2 — useStore hook
- [ ] 11.3 — Router
- [ ] 11.4 — Home page
- [ ] 11.5 — ProductCard
- [ ] 11.6 — Product detail
- [ ] 11.7 — Checkout form
- [ ] 11.8 — QuantityOffers
- [ ] 11.9 — Confirm page
- [ ] 11.10 — Pixel Provider
- [ ] 11.11 — WhatsApp button
- [ ] 11.12 — Dynamic styles

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
