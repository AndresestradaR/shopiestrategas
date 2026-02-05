# MiniShop

SaaS multi-tenant dropshipping platform for LATAM. Tenants create their own online stores with cash-on-delivery (contraentrega) checkout. Orders are exported in Dropi-compatible Excel format or sent directly to the Dropi API.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Backend | FastAPI, SQLAlchemy (async), Alembic, PostgreSQL 16 |
| Frontend Admin | React 18, Vite, Tailwind CSS, TanStack Query |
| Frontend Store | React 18, Vite, Tailwind CSS |
| Auth | JWT (access + refresh tokens) |
| Cache | Redis 7 |
| Containerization | Docker, Docker Compose |

## Prerequisites

- **Docker** and **Docker Compose** (for containerized setup)
- **Python 3.11+** (for local backend development)
- **Node.js 20+** and **npm** (for local frontend development)
- **PostgreSQL 16** (if running locally without Docker)

## Quick Start with Docker Compose

```bash
# Clone the repository
git clone <repo-url> && cd shopiestrategas

# Start all services
docker compose up -d

# Run database migrations
docker compose exec backend alembic upgrade head
```

Services will be available at:

| Service | URL |
|---------|-----|
| Backend API | http://localhost:8000 |
| Admin Panel | http://localhost:3000 |
| Public Store | http://localhost:3001 |
| PostgreSQL | localhost:5432 |
| Redis | localhost:6379 |

## Development Setup

### Backend

```bash
cd backend

# Create virtual environment
python -m venv venv
source venv/bin/activate   # Linux/Mac
venv\Scripts\activate      # Windows

# Install dependencies
pip install -r requirements.txt

# Start PostgreSQL and Redis (if not running)
docker compose up postgres redis -d

# Run migrations
alembic upgrade head

# Start dev server
uvicorn app.main:app --reload --port 8000
```

### Frontend Admin

```bash
cd frontend-admin
npm install
npm run dev
# Runs on http://localhost:5173
```

### Frontend Store

```bash
cd frontend-store
npm install
npm run dev
# Runs on http://localhost:5174
```

### Running Tests

```bash
cd backend
pytest
```

## Project Structure

```
shopiestrategas/
├── backend/
│   ├── app/
│   │   ├── main.py              # FastAPI app + middleware
│   │   ├── config.py            # Settings (pydantic-settings)
│   │   ├── database.py          # SQLAlchemy async engine
│   │   ├── models/              # SQLAlchemy models
│   │   ├── schemas/             # Pydantic request/response schemas
│   │   ├── api/
│   │   │   ├── auth.py          # Register, Login, Refresh, Me
│   │   │   ├── deps.py          # Shared dependencies
│   │   │   ├── admin/           # Admin endpoints (products, orders, config, etc.)
│   │   │   └── store/           # Public store endpoints (catalog, checkout)
│   │   ├── services/            # Business logic (image upload, Dropi export)
│   │   └── utils/               # Security, slugify helpers
│   ├── migrations/              # Alembic migrations
│   ├── tests/                   # pytest test suite
│   ├── requirements.txt
│   └── Dockerfile
├── frontend-admin/              # Admin panel (React + Vite)
│   ├── src/
│   ├── Dockerfile
│   └── nginx.conf
├── frontend-store/              # Public storefront (React + Vite)
│   ├── src/
│   ├── Dockerfile
│   └── nginx.conf
├── docker-compose.yml
└── README.md
```

## Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `DATABASE_URL` | `postgresql+asyncpg://minishop:minishop_dev@localhost:5432/minishop` | PostgreSQL connection string |
| `SECRET_KEY` | `change-me-in-production` | JWT signing key |
| `ACCESS_TOKEN_EXPIRE_MINUTES` | `30` | Access token TTL |
| `REFRESH_TOKEN_EXPIRE_DAYS` | `7` | Refresh token TTL |
| `UPLOAD_DIR` | `./uploads` | Local file upload directory |
| `CORS_ORIGINS` | `["http://localhost:5173","http://localhost:5174"]` | Allowed CORS origins (JSON array) |
| `CORS_ALLOW_REGEX` | `None` | Regex for dynamic CORS origins (e.g. `https://.*\.minishop\.co`) |

## API Endpoints Summary

### Auth
- `POST /api/auth/register` -- Register a new tenant
- `POST /api/auth/login` -- Login and receive tokens
- `POST /api/auth/refresh` -- Refresh access token
- `GET /api/auth/me` -- Get current tenant info

### Admin - Products
- `GET /api/admin/products` -- List products (paginated, filterable)
- `POST /api/admin/products` -- Create product
- `GET /api/admin/products/{id}` -- Get product detail
- `PUT /api/admin/products/{id}` -- Update product
- `DELETE /api/admin/products/{id}` -- Delete product
- `POST /api/admin/products/{id}/images` -- Upload product image
- `DELETE /api/admin/products/{id}/images/{image_id}` -- Delete image
- `POST /api/admin/products/{id}/variants` -- Create variant
- `PUT /api/admin/products/{id}/variants/{variant_id}` -- Update variant
- `DELETE /api/admin/products/{id}/variants/{variant_id}` -- Delete variant

### Admin - Orders
- `GET /api/admin/orders` -- List orders (paginated, filterable)
- `GET /api/admin/orders/export` -- Export orders as Dropi Excel
- `GET /api/admin/orders/{id}` -- Get order detail
- `PUT /api/admin/orders/{id}` -- Update order notes
- `PUT /api/admin/orders/{id}/status` -- Update order status

### Admin - Store Config
- `GET /api/admin/config` -- Get store configuration
- `PUT /api/admin/config` -- Update store configuration
- `POST /api/admin/config/logo` -- Upload store logo

### Admin - Pages
- `GET /api/admin/pages` -- List store pages
- `POST /api/admin/pages` -- Create page
- `PUT /api/admin/pages/{id}` -- Update page
- `DELETE /api/admin/pages/{id}` -- Delete page

### Admin - Analytics
- `GET /api/admin/analytics/summary` -- Dashboard summary stats

### Store (Public)
- `GET /api/store/{slug}/config` -- Get store config
- `GET /api/store/{slug}/products` -- List active products
- `GET /api/store/{slug}/products/{product_slug}` -- Get product detail
- `POST /api/store/{slug}/checkout` -- Place an order

### Health
- `GET /api/health` -- Health check

## Supported Countries

Colombia (CO), Mexico (MX), Guatemala (GT), Peru (PE), Ecuador (EC), Chile (CL).

All stores use cash-on-delivery (contraentrega) as the payment method.
