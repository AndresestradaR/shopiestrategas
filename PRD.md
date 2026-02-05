# PRD.md — MiniShop Platform

> Ralph: Lee este archivo y PROGRESS.md. Implementa la siguiente tarea sin marcar ([ ]).
> Después de implementar, corre tests, haz commit, y marca como [x] en PROGRESS.md.
> Cuando TODAS las tareas estén [x], output: <promise>ALL_DONE</promise>

---

## FASE 1: Setup & Infraestructura

- [ ] **1.1** Crear `docker-compose.yml` con PostgreSQL 16 y Redis 7. Puertos: postgres 5432, redis 6379. DB name: minishop, user: minishop, password: minishop_dev
- [ ] **1.2** Crear `backend/requirements.txt` con: fastapi, uvicorn[standard], sqlalchemy[asyncio], asyncpg, alembic, pydantic[email], pydantic-settings, python-jose[cryptography], passlib[bcrypt], python-multipart, openpyxl, httpx, python-slugify, pytest, pytest-asyncio, httpx
- [ ] **1.3** Crear `backend/app/config.py` con Settings usando pydantic-settings. Variables: DATABASE_URL, SECRET_KEY, ACCESS_TOKEN_EXPIRE_MINUTES=30, REFRESH_TOKEN_EXPIRE_DAYS=7, UPLOAD_DIR=./uploads, CORS_ORIGINS
- [ ] **1.4** Crear `backend/app/database.py` con async engine, async sessionmaker, y función get_db como dependency de FastAPI. Incluir Base declarativa
- [ ] **1.5** Crear `backend/app/main.py` con FastAPI app, CORS middleware, y router includes. Incluir health check en GET /api/health
- [ ] **1.6** Configurar Alembic para migraciones async. Crear alembic.ini y migrations/env.py que lea DATABASE_URL de config

## FASE 2: Modelos de Base de Datos

- [ ] **2.1** Crear modelo `Tenant` en `backend/app/models/tenant.py` — id (UUID), email, password_hash, store_name, slug (unique), phone, country (default CO), plan (default free), is_active, dropi_email, dropi_token, created_at, updated_at
- [ ] **2.2** Crear modelo `StoreConfig` en `backend/app/models/store_config.py` — tenant_id (FK unique), logo_url, primary_color, secondary_color, accent_color, font_family, banner_image_url, banner_title, banner_subtitle, meta_pixel_id, tiktok_pixel_id, checkout_title, checkout_success_message, checkout_fields (JSONB), whatsapp_number, voice_enabled, currency_symbol, currency_code, products_per_row, show_compare_price, seo_title, seo_description, instagram_url, facebook_url, tiktok_url
- [ ] **2.3** Crear modelo `Product` en `backend/app/models/product.py` — id (UUID), tenant_id (FK), name, slug, description, short_description, price, compare_at_price, cost_price, dropi_product_id, sku, is_active, is_featured, stock, tags (ARRAY), sort_order. Unique(tenant_id, slug)
- [ ] **2.4** Crear modelo `ProductImage` en `backend/app/models/product.py` — id (UUID), product_id (FK CASCADE), tenant_id (FK), image_url, alt_text, sort_order, is_primary
- [ ] **2.5** Crear modelo `ProductVariant` en `backend/app/models/product.py` — id (UUID), product_id (FK CASCADE), tenant_id (FK), name, variant_type, variant_value, price_override, dropi_variation_id, sku, stock, is_active, sort_order
- [ ] **2.6** Crear modelo `Order` en `backend/app/models/order.py` — id (UUID), tenant_id (FK), order_number, customer_name, customer_surname, customer_phone, customer_email, customer_dni, address, city, state, neighborhood, zip_code, address_notes, subtotal, shipping_cost, discount, total, status (default PENDIENTE), payment_method (default CONTRAENTREGA), dropi_order_id, exported_at, utm_source, utm_medium, utm_campaign, notes, admin_notes, created_at, updated_at
- [ ] **2.7** Crear modelo `OrderItem` en `backend/app/models/order.py` — id (UUID), order_id (FK CASCADE), tenant_id (FK), product_id (FK SET NULL), variant_id (FK SET NULL), product_name, variant_name, quantity, unit_price, total_price, dropi_product_id, dropi_variation_id
- [ ] **2.8** Crear modelo `StorePage` en `backend/app/models/store_page.py` — id (UUID), tenant_id (FK), title, slug, content (TEXT), page_type, show_in_footer, is_published, sort_order. Unique(tenant_id, slug)
- [ ] **2.9** Crear modelo `AbandonedCart` en `backend/app/models/abandoned_cart.py` — id (UUID), tenant_id (FK), customer_name, customer_phone, customer_email, product_id (FK SET NULL), product_name, variant_name, quantity, total_value, status (default ABANDONED), last_step, ip_address, utm_source, created_at
- [ ] **2.10** Crear modelo `CheckoutOffer` en `backend/app/models/checkout_offer.py` — id (UUID), tenant_id (FK), product_id (FK CASCADE nullable), name, is_active, rules (JSONB), show_savings, show_per_unit
- [ ] **2.11** Crear modelo `Customer` en `backend/app/models/customer.py` — id (UUID), tenant_id (FK), name, phone, email, city, address, total_orders, total_spent, last_order_at, tags (ARRAY), notes. Unique(tenant_id, phone)
- [ ] **2.12** Crear modelo `StoreApp` en `backend/app/models/store_app.py` — id (UUID), tenant_id (FK), app_slug, is_active, config (JSONB). Unique(tenant_id, app_slug)
- [ ] **2.13** Crear modelo `Testimonial` en `backend/app/models/testimonial.py` — id (UUID), tenant_id (FK), customer_name, customer_city, customer_photo_url, rating (1-5), text, product_id (FK SET NULL), is_published, sort_order
- [ ] **2.14** Crear modelo `TenantDomain` en `backend/app/models/tenant.py` — id (UUID), tenant_id (FK), domain (unique), is_primary, is_verified, ssl_status, verification_token
- [ ] **2.15** Crear `backend/app/models/__init__.py` que importe todos los modelos. Generar migración inicial con Alembic y verificar que se puede aplicar contra la DB

## FASE 3: Auth & Seguridad

- [ ] **3.1** Crear `backend/app/utils/security.py` con funciones: hash_password, verify_password (bcrypt), create_access_token, create_refresh_token, decode_token (python-jose HS256)
- [ ] **3.2** Crear `backend/app/utils/slugify.py` con función que genere slugs únicos a partir de strings (usando python-slugify). Si el slug ya existe, agregar sufijo numérico
- [ ] **3.3** Crear `backend/app/api/deps.py` con dependencies: get_db (async session), get_current_tenant (decodifica JWT y retorna tenant), require_active_tenant (verifica is_active)
- [ ] **3.4** Crear `backend/app/api/auth.py` con endpoints: POST /api/auth/register (crea tenant + store_config + páginas default), POST /api/auth/login (retorna access + refresh token), POST /api/auth/refresh, GET /api/auth/me
- [ ] **3.5** Crear test `backend/tests/conftest.py` con fixtures: async test client, test database (SQLite async o PostgreSQL test), test tenant fixture, authenticated client fixture
- [ ] **3.6** Crear test `backend/tests/test_auth.py` — test register, test login, test login wrong password, test me endpoint, test refresh token

## FASE 4: API Admin — Productos

- [ ] **4.1** Crear Pydantic schemas en `backend/app/schemas/product.py`: ProductCreate, ProductUpdate, ProductResponse, ProductListResponse, ProductImageResponse, ProductVariantCreate, ProductVariantResponse
- [ ] **4.2** Crear `backend/app/api/admin/products.py` con: GET /api/admin/products (listar con filtros: is_active, search, pagination), POST /api/admin/products (crear producto con slug auto-generado)
- [ ] **4.3** Agregar endpoints: GET /api/admin/products/{id} (detalle con imágenes y variantes), PUT /api/admin/products/{id} (actualizar), DELETE /api/admin/products/{id} (soft delete o hard delete)
- [ ] **4.4** Agregar endpoint POST /api/admin/products/{id}/images — subir imagen (multipart/form-data), guardar en UPLOAD_DIR/{tenant_id}/products/, crear registro en product_images
- [ ] **4.5** Agregar endpoint DELETE /api/admin/products/{id}/images/{image_id} — eliminar imagen del filesystem y de la DB
- [ ] **4.6** Agregar endpoints de variantes: POST /api/admin/products/{id}/variants (crear), PUT /api/admin/products/{id}/variants/{variant_id} (actualizar), DELETE /api/admin/products/{id}/variants/{variant_id} (eliminar)
- [ ] **4.7** Crear test `backend/tests/test_products.py` — test crear producto, test listar, test actualizar, test eliminar, test subir imagen, test crear variante

## FASE 5: API Admin — Pedidos

- [ ] **5.1** Crear Pydantic schemas en `backend/app/schemas/order.py`: OrderResponse, OrderDetailResponse, OrderListResponse, OrderUpdateStatus, OrderExportFilters
- [ ] **5.2** Crear `backend/app/api/admin/orders.py` con: GET /api/admin/orders (listar con filtros: status, fecha desde/hasta, search, pagination), GET /api/admin/orders/{id} (detalle con items)
- [ ] **5.3** Agregar endpoints: PUT /api/admin/orders/{id}/status (cambiar estado), PUT /api/admin/orders/{id} (actualizar admin_notes)
- [ ] **5.4** Crear `backend/app/services/dropi_export.py` — función que recibe lista de orders y genera archivo Excel (.xlsx) con el formato Dropi (columnas A-N). Usar openpyxl
- [ ] **5.5** Agregar endpoint GET /api/admin/orders/export — descarga Excel filtrado por status y fecha. Content-Type: application/vnd.openxmlformats-officedocument.spreadsheetml.sheet
- [ ] **5.6** Crear test `backend/tests/test_orders.py` — test listar pedidos, test cambiar estado, test exportar Excel (verificar headers del archivo)

## FASE 6: API Admin — Config, Páginas, Checkout

- [ ] **6.1** Crear `backend/app/api/admin/config.py` con: GET /api/admin/config (obtener store_config), PUT /api/admin/config (actualizar), POST /api/admin/config/logo (subir logo)
- [ ] **6.2** Crear `backend/app/api/admin/pages.py` con CRUD completo de store_pages: listar, crear, actualizar, eliminar. Al registrar tenant, crear 4 páginas default: politica-envios, politica-devoluciones, terminos-condiciones, politica-privacidad
- [ ] **6.3** Crear `backend/app/api/admin/checkout.py` con: GET /api/admin/checkout/offers (listar ofertas por cantidad), POST /api/admin/checkout/offers (crear), PUT /api/admin/checkout/offers/{id} (actualizar rules JSONB), DELETE /api/admin/checkout/offers/{id}
- [ ] **6.4** Crear `backend/app/api/admin/apps.py` con: GET /api/admin/apps (listar todas las apps disponibles con estado activo/inactivo), PUT /api/admin/apps/{slug} (activar/desactivar y actualizar config JSONB)
- [ ] **6.5** Crear `backend/app/api/admin/analytics.py` con: GET /api/admin/analytics/dashboard (pedidos hoy, ventas hoy, carritos abandonados semana, conversión). Queries simples sobre orders y abandoned_carts

## FASE 7: API Pública — Tienda & Checkout

- [ ] **7.1** Crear `backend/app/middleware/tenant.py` — middleware que resuelve tenant desde el header X-Store-Slug (para dev) o desde el Host header (subdominio/dominio custom). Inyecta tenant_id en request.state
- [ ] **7.2** Crear `backend/app/api/store/catalog.py` con: GET /api/store/{slug}/config (config pública: nombre, colores, logo, pixels, redes), GET /api/store/{slug}/products (productos activos con imágenes), GET /api/store/{slug}/products/{product_slug} (detalle producto), GET /api/store/{slug}/pages/{page_slug} (página estática)
- [ ] **7.3** Crear `backend/app/api/store/checkout.py` con: POST /api/store/{slug}/order (crear pedido contraentrega). Recibe: customer_name, customer_phone, address, city, + items. Valida productos existen y están activos. Calcula totales. Aplica ofertas por cantidad si las hay. Crea order + order_items. Actualiza/crea customer. Retorna order_id y número
- [ ] **7.4** Agregar endpoint POST /api/store/{slug}/cart/capture — captura progresiva de carritos abandonados. Recibe campos parciales (name, phone, email, product_id). Usa session_id para identificar el carrito. Crea o actualiza abandoned_cart
- [ ] **7.5** Crear `backend/app/api/admin/carts.py` con: GET /api/admin/carts (listar carritos abandonados con filtros), PUT /api/admin/carts/{id}/status (marcar como CONTACTED/RECOVERED)
- [ ] **7.6** Crear test `backend/tests/test_checkout.py` — test crear pedido, test validación campos requeridos, test ofertas por cantidad, test captura carrito abandonado

## FASE 8: Frontend Admin — Setup & Layout

- [ ] **8.1** Inicializar frontend-admin con Vite + React + Tailwind CSS. Configurar vite.config.js con proxy a localhost:8000 para /api
- [ ] **8.2** Instalar dependencias: react-router-dom, axios, @tanstack/react-query, react-hook-form, react-hot-toast, lucide-react (iconos), @dnd-kit/core (drag and drop)
- [ ] **8.3** Crear `src/api/client.js` — instancia de Axios con baseURL /api, interceptor que agrega JWT del localStorage, interceptor que redirige a login si 401
- [ ] **8.4** Crear `src/layouts/BuilderLayout.jsx` — layout con sidebar (240px) + content area. Sidebar con todos los items de navegación organizados por secciones. Estilo dark (#0D1717 background, #4DBEA4 accent). Botón "Ver mi tienda" y "Volver a Estrategas IA" en el bottom
- [ ] **8.5** Crear `src/App.jsx` con React Router: rutas para login, register, y todas las páginas del builder bajo layout compartido. Proteger rutas con auth check

## FASE 9: Frontend Admin — Páginas Core

- [ ] **9.1** Crear `src/pages/Login.jsx` y `src/pages/Register.jsx` — formularios de auth con react-hook-form. Al registrar, pedir: email, password, nombre tienda, país. Dark theme
- [ ] **9.2** Crear `src/pages/Dashboard.jsx` — KPIs (pedidos hoy, ventas, carritos, conversión), gráfica de ventas 7 días (recharts o simple CSS), últimos pedidos, top productos
- [ ] **9.3** Crear `src/pages/Products.jsx` — tabla de productos con imagen thumbnail, nombre, precio, stock, estado. Filtros: todos/activos/borrador. Búsqueda. Botón "Agregar producto"
- [ ] **9.4** Crear `src/pages/ProductEdit.jsx` — formulario completo: info básica, drag-and-drop de imágenes, precios, variantes (tabla editable), conexión Dropi (IDs), SEO, estado. Funciona para crear y editar
- [ ] **9.5** Crear `src/pages/Orders.jsx` — tabla de pedidos con #, fecha, cliente, teléfono, ciudad, producto, total, estado (badges de color). Filtros por estado y fecha. Botones: "Exportar Excel Dropi" y "Enviar a Dropi". Checkboxes para bulk actions
- [ ] **9.6** Crear `src/pages/OrderDetail.jsx` — detalle completo del pedido: info cliente, productos con imagen, timeline de estados, notas internas, botón "WhatsApp al cliente"
- [ ] **9.7** Crear `src/pages/AbandonedCarts.jsx` — tabla con fecha, nombre, teléfono, email, producto, valor, barra de progreso del checkout, botón WhatsApp. KPIs arriba: total semana, con teléfono, valor perdido
- [ ] **9.8** Crear `src/pages/Customers.jsx` — tabla de clientes con nombre, teléfono, ciudad, total pedidos, total gastado, último pedido

## FASE 10: Frontend Admin — Configuración

- [ ] **10.1** Crear `src/pages/Checkout.jsx` — config campos del formulario (toggles on/off), ofertas por cantidad (tabla editable con reglas), personalización (título, texto botón, color, mensaje éxito, toggles de timer y stock)
- [ ] **10.2** Crear `src/pages/Policies.jsx` — lista de páginas con editor de texto (textarea o editor markdown básico). CRUD completo
- [ ] **10.3** Crear `src/pages/Apps.jsx` — grid de apps disponibles con tarjetas: icono, nombre, descripción, plan, botón activar/desactivar. Al activar, expandir panel de configuración de la app
- [ ] **10.4** Crear `src/pages/Settings.jsx` — formulario: nombre tienda, slug, email, WhatsApp, país (select), moneda (auto según país), zona horaria
- [ ] **10.5** Crear `src/pages/Domain.jsx` — mostrar subdominio actual, formulario para agregar dominio custom con instrucciones DNS, botón verificar
- [ ] **10.6** Crear `src/pages/Pixels.jsx` — formularios para Meta Pixel ID, TikTok Pixel ID, Google Analytics ID, textarea para script custom
- [ ] **10.7** Crear `src/pages/Analytics.jsx` — dashboard con selector de rango de fecha, KPIs, gráfica de ventas por día, top productos, top ciudades, top fuentes de tráfico

## FASE 11: Frontend Tienda Pública

- [ ] **11.1** Inicializar frontend-store con Vite + React + Tailwind CSS. Configurar para recibir slug como variable de entorno o desde la URL
- [ ] **11.2** Crear `src/hooks/useStore.js` — hook que fetch config y productos de la tienda. Cachear con React Query
- [ ] **11.3** Crear `src/App.jsx` con rutas: / (home), /producto/{slug} (detalle), /checkout/{product_slug} (formulario), /confirmacion/{order_id}, /p/{page_slug} (páginas)
- [ ] **11.4** Crear `src/pages/Home.jsx` — header con logo, banner hero, grid de productos (ProductCard), trust badges, footer con links a políticas y redes. Todo dinámico desde store_config
- [ ] **11.5** Crear `src/components/ProductCard.jsx` — imagen, nombre, precio, precio tachado, badge de descuento, botón "Pedir Ahora"
- [ ] **11.6** Crear `src/pages/Product.jsx` — galería de imágenes, nombre, precios, descripción, selector de variantes, badges (envío, contraentrega, stock), botón grande "Pedir Ahora" que lleva al checkout
- [ ] **11.7** Crear `src/pages/Checkout.jsx` — formulario de pedido (campos dinámicos desde config). Incluir QuantityOffers si hay ofertas configuradas. Captura progresiva con onBlur que llama a /cart/capture. Submit crea el pedido
- [ ] **11.8** Crear `src/components/QuantityOffers.jsx` — selector visual de cantidad con precios escalonados, badge "Más popular", mostrar ahorro por unidad
- [ ] **11.9** Crear `src/pages/Confirm.jsx` — confirmación de pedido con resumen, número de pedido, mensaje de éxito de store_config
- [ ] **11.10** Crear `src/components/PixelProvider.jsx` — componente que inyecta scripts de Meta Pixel y TikTok Pixel basado en store_config. Disparar eventos PageView, ViewContent, InitiateCheckout, Purchase
- [ ] **11.11** Crear `src/components/WhatsAppButton.jsx` — botón flotante de WhatsApp con link a wa.me/{number}
- [ ] **11.12** Aplicar estilos dinámicos desde store_config: colores (primary, secondary, accent), font_family. Usar CSS variables que se setean desde la config

## FASE 12: Integración & Polish

- [ ] **12.1** Crear `backend/app/services/image_upload.py` — servicio para subir imágenes: validar tipo (jpg, png, webp), resize a max 1200px, guardar en UPLOAD_DIR, retornar URL. Servir estáticos desde FastAPI en dev
- [ ] **12.2** Agregar endpoint GET /api/admin/orders/export con generación real de Excel usando openpyxl y formato Dropi exacto. Incluir todos los campos del formato
- [ ] **12.3** Crear `docker-compose.yml` completo con: postgres, redis, backend (con Dockerfile), frontend-admin, frontend-store. Volúmenes para uploads y datos de postgres
- [ ] **12.4** Crear README.md con instrucciones de setup local: prerequisitos, docker-compose up, crear primer tenant, acceder al builder
- [ ] **12.5** Revisar que TODOS los endpoints admin filtran por tenant_id. Nunca se debe poder acceder a datos de otro tenant. Agregar test específico para esto
- [ ] **12.6** Revisar CORS, que el frontend pueda acceder al backend sin problemas. Configurar origins permitidos
