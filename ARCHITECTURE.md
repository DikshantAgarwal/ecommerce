# E-Commerce Architecture

## Table of Contents
1. [System Architecture](#1-system-architecture)
2. [Folder Structure](#2-folder-structure)
3. [Database Design](#3-database-design)
4. [Development Phases](#4-development-phases)
5. [Learning Roadmap](#5-learning-roadmap)
6. [Common Frontend Developer Mistakes](#6-common-frontend-developer-mistakes)
7. [Architectural Tradeoffs](#7-architectural-tradeoffs)

---

## 1. System Architecture

### High-Level Overview

```
┌─────────────────────────┐      ┌──────────────────────────┐
│     React SPA           │──────│   Django REST API        │
│     (Port 3000)         │ JWT  │   (Port 8000)            │
└─────────────────────────┘      └──────────┬───────────────┘
                                             │
                                    ┌────────┴────────┐
                                    │   PostgreSQL     │
                                    │   (Port 5432)    │
                                    └─────────────────┘
                                             │
                                    ┌────────┴────────┐
                                    │     Redis        │
                                    │   (Port 6379)    │
                                    └─────────────────┘
                                             │
                                    ┌────────┴────────┐
                                    │    Celery        │
                                    │  (Async Tasks)   │
                                    └─────────────────┘
```

### Why Django + DRF?

**Django** gives you for free:
- **ORM** - Database abstraction with migrations. You write Python, not SQL.
- **Admin panel** - CRUD UI for staff users, generated from your models. Saves weeks.
- **Authentication** - User model, sessions, permissions, groups - built-in.
- **Security** - CSRF, XSS, SQL injection, clickjacking protection out of the box.
- **Forms/validation** - Not directly relevant for API, but the validation patterns carry over to DRF serializers.
- **Testing client** - Built-in test framework with a fake browser for integration tests.

**DRF** adds:
- **Serializers** - Convert Django models to JSON (and back). Handle validation, nested writes.
- **Viewsets** - Class-based views that map to standard CRUD endpoints.
- **Routers** - Auto-generate URL patterns from viewsets.
- **Authentication classes** - JWT, session, token auth as pluggable classes.
- **Permission classes** - Per-endpoint authorization (is admin? is owner?).
- **Pagination, filtering, throttling** - All built-in.

### Why PostgreSQL over SQLite?

SQLite works fine for learning, but PostgreSQL:
- Handles concurrent writes properly (important for e-commerce)
- Has proper `Decimal` type (critical for money)
- Supports array fields, JSON fields, full-text search
- Is what you'd deploy to production
- The Django ORM abstracts most differences anyway

### Monorepo Rationale

Both frontend and backend in one repo. Simpler for a solo developer:
- Single `git clone` to get everything
- Easier CI/CD (one pipeline)
- Atomic commits across stack
- Split into separate repos later if needed (you won't need to)

---

## 2. Folder Structure

```
ecommerce/
├── ARCHITECTURE.md            # This file
├── README.md
├── .gitignore
├── .env.example
│
├── backend/
│   ├── config/                 # Django project configuration
│   │   ├── __init__.py
│   │   ├── settings/
│   │   │   ├── __init__.py
│   │   │   ├── base.py         # Shared settings (all environments)
│   │   │   ├── local.py        # Dev overrides (DEBUG=True, SQLite)
│   │   │   └── production.py   # Prod overrides (PostgreSQL, sentry)
│   │   ├── urls.py             # Root URL configuration
│   │   ├── wsgi.py             # WSGI entry point (Gunicorn)
│   │   └── asgi.py             # ASGI entry point (future WebSocket)
│   │
│   ├── apps/                   # All Django apps live here
│   │   ├── accounts/           # User model, auth, profiles, addresses
│   │   ├── products/           # Catalog, categories, inventory
│   │   ├── cart/               # Shopping cart (session + DB hybrid)
│   │   ├── orders/             # Order management, lifecycle
│   │   ├── payments/           # Stripe integration
│   │   ├── reviews/            # Product reviews and ratings
│   │   └── coupons/            # Discount codes, promotions
│   │
│   ├── static/                 # Static files (admin CSS, etc.)
│   ├── media/                  # User-uploaded files (product images)
│   ├── requirements/
│   │   ├── base.txt            # Shared dependencies
│   │   ├── local.txt           # Dev-only (extends base)
│   │   └── production.txt      # Prod-only (extends base)
│   │
│   ├── manage.py               # Django CLI entry point
│   └── .env.example            # Environment variable template
│
├── frontend/                   # React application (separate tooling)
│   ├── src/
│   ├── public/
│   ├── package.json
│   └── ...
│
└── docker/
    ├── Dockerfile
    ├── docker-compose.yml
    └── nginx/
        └── default.conf
```

### Why This Structure?

**`config/` vs `backend/` at root**
Many tutorials put settings at `backend/settings.py`. Wrapping in `config/` makes it clear this is project configuration, not business logic. The split settings file (`base.py` + `local.py` + `production.py`) follows the Two Scoops of Django pattern - the Django community standard.

**`apps/` subdirectory**
Django's default `python manage.py startapp` creates apps at the project root. Wrapping all apps under `apps/` keeps 7+ apps from cluttering the root. You register them as `apps.accounts` in INSTALLED_APPS.

**Each app is self-contained**
- Has its own `models.py`, `serializers.py`, `views.py`, `urls.py`, `tests/`
- Can theoretically be extracted into its own package later
- Forces you to think about boundaries between features

**Why these specific apps?**
- `accounts` isn't "users" because Django already has `django.contrib.auth`. We're extending it.
- `cart` is separate from `orders` because a cart is transient; an order is permanent.
- `payments` is separate because it involves third-party integration and idempotency concerns.

---

## 3. Database Design

### Entity Relationship Diagram

```
┌──────────────┐     ┌─────────────────┐     ┌──────────────────┐
│    User      │     │    Address       │     │    Profile       │
│──────────────│     │─────────────────│     │──────────────────│
│ id (UUID)    │1───>│ id               │     │ id               │
│ email        │     │ user_id (FK)     │<────│ user_id (FK)  1:1│
│ password     │     │ line_1           │     │ phone            │
│ full_name    │     │ city             │     │ avatar           │
│ is_active    │     │ state            │     │ birthday         │
│ is_staff     │     │ zip_code         │     └──────────────────┘
│ date_joined  │     │ country          │
└──────┬───────┘     │ is_default       │
       │             └─────────────────┘
       │
       │ 1
       │
       ▼
┌─────────────────────────────────────────────────────────────┐
│                         Order                               │
│─────────────────────────────────────────────────────────────│
│ id (UUID)         │ status (enum)     │ subtotal (Decimal)  │
│ user_id (FK)      │ shipping_total    │ tax_amount          │
│ shipping_address  │ discount_amount   │ total (Decimal)     │
│ billing_address   │ coupon_id (FK)    │ notes               │
│ paid_at           │ created_at        │ updated_at          │
└─────────┬───────────────────────────────────────────────────┘
          │ 1
          │
          ▼
┌──────────────────┐     ┌──────────────────┐
│   OrderItem      │     │   Payment        │
│──────────────────│     │──────────────────│
│ id               │     │ id               │
│ order_id (FK)    │     │ order_id (FK) 1:1│
│ product_id (FK)  │     │ stripe_pi_id     │
│ quantity         │     │ amount           │
│ unit_price       │     │ currency         │
│ total_price      │     │ status           │
└──────────────────┘     └──────────────────┘

┌──────────────────┐     ┌──────────────────┐
│   Category       │     │   Product        │
│──────────────────│     │──────────────────│
│ id               │     │ id (UUID)        │
│ name             │     │ category_id (FK) │
│ slug (unique)    │     │ name             │
│ parent_id (FK)   │     │ slug (unique)    │
│ description      │     │ description      │
│ is_active        │     │ price (Decimal)  │
└──────────────────┘     │ compare_at_price │
                         │ sku (unique)     │
                         │ inventory_qty    │
                         │ is_active        │
                         │ created_at      │
                         └────────┬─────────┘
                                  │ 1
                                  │
                    ┌─────────────┼──────────────┐
                    │             │              │
                    ▼             ▼              ▼
            ┌────────────┐ ┌───────────┐ ┌──────────┐
            │ProductImage│ │ Variant   │ │  Review  │
            │────────────│ │───────────│ │──────────│
            │ id         │ │ id        │ │ id       │
            │ product(FK)│ │product(FK)│ │product(FK)│
            │ image      │ │ name      │ │ user(FK) │
            │ is_primary │ │ sku       │ │ rating   │
            │ sort_order │ │ price     │ │ title    │
            └────────────┘ │ inventory │ │ body     │
                           │ is_active │ │ approved │
                           └───────────┘ └──────────┘

┌──────────────────┐     ┌──────────────────┐
│      Cart        │     │   CartItem       │
│──────────────────│     │──────────────────│
│ id               │     │ id               │
│ user_id (FK)     │     │ cart_id (FK)     │
│ session_id       │     │ product_id (FK)  │
│ created_at       │     │ variant_id (FK)  │
│ updated_at       │     │ quantity         │
└──────────────────┘     │ unit_price       │
                         └──────────────────┘

┌──────────────────┐
│     Coupon       │
│──────────────────│
│ id               │
│ code (unique)    │
│ type (%/fixed)   │
│ value (Decimal)  │
│ min_order_value  │
│ max_uses         │
│ used_count       │
│ is_active        │
│ valid_from       │
│ valid_to         │
└──────────────────┘
```

### Key Design Decisions

**UUID primary keys** (not auto-increment integers)
- **Why**: Sequential IDs leak information (order #1234 tells customers you have ~1234 orders). UUIDs are globally unique, make sharding easier later, and prevent IDOR attacks (guessing other users' order IDs).
- **Tradeoff**: UUIDs are larger (16 bytes vs 4 bytes) and slightly slower for index lookups. Worth it for security and future-proofing.
- **Implementation**: Use Django's `uuidfield` with `uuid.uuid4` as default. PostgreSQL handles UUIDs natively.

**Money as Decimal** (not Float)
- **Why**: Floating point cannot represent 0.01 exactly. Decimal stores exact base-10 values. Use `models.DecimalField(max_digits=10, decimal_places=2)`.
- **Never store money as float**. Not negotiable.

**Price snapshots on CartItem and OrderItem**
- **Why**: Product prices change. When a customer adds to cart or places an order, `unit_price` records the price *at that moment*. Otherwise, changing a product price would change past orders.
- This is called a "snapshot" pattern and is essential for any financial system.

**Cart uses both user FK and session_id**
- **Why**: Guest users (not logged in) need a cart too. Session ID ties cart to browser. When user logs in, we merge the guest cart into their user cart.
- Nullable user + nullable session_id. One is always set.

**Self-referencing Category (Adjacency List)**
- `parent = models.ForeignKey('self', null=True, blank=True)`
- Simple, no extra library needed. Good for 2-3 levels of categories.
- Alternative: django-mptt (Modified Preorder Tree Traversal) for deeper hierarchies or frequent siblings queries. Start simple.

**Review approval via is_approved flag**
- Don't delete spam reviews; soft-hide them. Gives you audit trail.
- Auto-approve for trusted users, queue for new users.

**Order status as choices, not states**
- Keep it simple: PENDING → CONFIRMED → PROCESSING → SHIPPED → DELIVERED → CANCELLED
- Don't over-engineer state machines on day one. A simple CharField with choices works.

---

## 4. Development Phases

### Phase 0: Foundation (Week 1)
- Set up Python, virtual environment, PostgreSQL
- `django-admin startproject` with our custom structure
- Split settings into base/local/production
- Django `python manage.py runserver` works
- No "business" code yet

### Phase 1: Accounts (Week 1-2)
- Custom User model (email as username, no username field)
- Registration endpoint (POST /api/auth/register/)
- Login endpoint (POST /api/auth/login/) returning JWT tokens
- Profile retrieval/update (GET/PATCH /api/auth/me/)
- Address CRUD (GET/POST/PUT/DELETE /api/addresses/)
- Admin customization (list display, search, filters)

### Phase 2: Products (Week 2-3)
- Category model + admin
- Product model + admin with image uploads
- Product image inline (multiple images per product)
- Read-only endpoint (GET /api/products/) with:
  - Filtering by category, price range
  - Searching by name/description
  - Pagination (20 per page)
  - Sorting by price, date, name
- Staff-only create/update/delete endpoints

### Phase 3: Cart (Week 3)
- Cart + CartItem models
- Add to cart (POST /api/cart/items/)
- View cart (GET /api/cart/)
- Update quantity (PATCH /api/cart/items/:id/)
- Remove item (DELETE /api/cart/items/:id/)
- Guest cart via session_id header
- Cart merge on login

### Phase 4: Checkout & Orders (Week 4)
- Create order from cart (POST /api/orders/)
- Order detail view (GET /api/orders/:id/)
- Order history (GET /api/orders/)
- Order status tracking
- Cancel order
- Shipping/billing address selection
- Stock decrement on order creation
- Transactional integrity (either everything succeeds or nothing does)

### Phase 5: Payments (Week 5-6)
- Stripe account setup (test mode)
- Stripe PaymentIntent creation on order
- Checkout page redirects to Stripe
- Webhook handler for payment success/failure
- Order status update on payment confirmation
- Payment failure handling

### Phase 6: Reviews (Week 6)
- Review model, serializer, viewset
- POST /api/products/:id/reviews/
- GET /api/products/:id/reviews/ (public)
- Average rating calculation (annotate on product queryset)
- Staff approval via admin

### Phase 7: Coupons (Week 7)
- Coupon model + admin
- Validation endpoint (POST /api/coupons/validate/)
- Coupon application during checkout
- Usage tracking (increment used_count)

### Phase 8: Docker & Deployment (Week 7-8)
- Dockerfile (multi-stage: Python + Gunicorn)
- docker-compose.yml (Django, PostgreSQL, Redis)
- Nginx reverse proxy + static/media serving
- Environment variable management
- Production checklist (SECRET_KEY, DEBUG=False, ALLOWED_HOSTS)

### Phase 9: Async Tasks with Redis + Celery (Week 8+)
- Redis + Celery setup
- Order confirmation email (async)
- Image thumbnail generation on upload (async)
- Cache product listings in Redis
- Rate limiting on auth endpoints

---

## 5. Learning Roadmap

### Before Phase 1 (Accounts)

| Topic | Why |
|-------|-----|
| Python basics | Classes, functions, decorators, context managers |
| Virtual environments | Isolate project dependencies |
| pip basics | Install/uninstall packages, requirements files |
| PostgreSQL basics | `psql`, create database, basic SQL (SELECT, INSERT) |
| HTTP methods | GET, POST, PUT, PATCH, DELETE - when to use each |
| REST principles | Resources, endpoints, statelessness |

### Before Phase 2 (Products)

| Topic | Why |
|-------|-----|
| Django models | Fields, relationships (FK, M2M, O2O), Meta class |
| Django migrations | `makemigrations`, `migrate`, `sqlmigrate` |
| Django admin | ModelAdmin, list_display, search_fields, inlines |
| DRF Serializers | ModelSerializer, field types, validation |
| DRF Views/Viewsets | APIView vs ViewSet vs ModelViewSet |
| DRF Routers | DefaultRouter, SimpleRouter |
| Django ORM | Querysets, filtering, annotations, aggregations |

### Before Phase 3 (Cart)

| Topic | Why |
|-------|-----|
| Sessions | How HTTP is stateless, session middleware |
| Request/response cycle | Middleware → URL → View → Serializer → Response |
| Nested serializers | Cart contains items, write operations |
| Transaction management | `atomic()` blocks |

### Before Phase 4 (Orders)

| Topic | Why |
|-------|-----|
| Database transactions | ACID, atomic operations, rollback |
| Order lifecycle | Why financial data needs immutability |
| Idempotency | Preventing duplicate orders |
| Stock management | SELECT FOR UPDATE, race conditions |

### Before Phase 5 (Payments)

| Topic | Why |
|-------|-----|
| Stripe API | PaymentIntent flow, test mode |
| Webhooks | Server-to-server callbacks, verification |
| PCI DSS basics | Never handle raw card data |
| End-to-end testing | Test the full order → payment → confirmation flow |

### Before Phase 8 (Docker)

| Topic | Why |
|-------|-----|
| Docker basics | Images, containers, Dockerfiles |
| Docker Compose | Multi-container orchestration |
| Nginx basics | Reverse proxy, static file serving |
| Gunicorn | WSGI server for production |
| 12 Factor App | Config, logging, processes |

---

## 6. Common Frontend Developer Mistakes

### 1. "Django is My Express/Node.js"

**Problem**: Coming from Express, you'll try to structure Django like a Node.js app - thin "routers" that call handler functions, manual request parsing, etc.

**Reality**: Django is "batteries included." When you define a model and register it with DRF's ModelViewSet, you get:
- List, create, retrieve, update, partial_update, destroy endpoints
- Auto-generated URL patterns
- Browsable API UI for testing
- Input validation from serializer fields
- Permission checking

**Rule**: Don't fight Django. If Django has a built-in way to do something, use it. The framework has 20 years of community experience baked in.

### 2. Putting Logic in Views Instead of Models

**Problem**:
```python
# Bad: logic in view
def create_order(request):
    cart = Cart.objects.get(user=request.user)
    total = sum(item.quantity * item.unit_price for item in cart.items.all())
    if total < 0:
        return Response({"error": "invalid"})
    order = Order.objects.create(user=request.user, total=total)
```

**Better**:
```python
# Model method
class Order(models.Model):
    def calculate_total(self):
        return sum(item.total_price for item in self.items.all())

# View delegates to model
def create_order(request):
    order = Order.objects.create(user=request.user)
    order.items.add(...)
    order.total = order.calculate_total()
    order.save()
```

**Why**: Testability. You can test `calculate_total()` without HTTP. Reusability: the admin panel, management commands, and future API versions all use the same logic.

### 3. N+1 Query Blindness

**Problem**: In React, data fetching is explicit. In Django, the ORM is lazy. This looks innocent:
```python
orders = Order.objects.all()
for order in orders:
    print(order.items.count())  # N+1: 1 query for orders + N queries for items
```

**Fix**: Always use `select_related` (for FK/O2O) and `prefetch_related` (for M2M/reverse):
```python
orders = Order.objects.prefetch_related('items').all()
```

**Practice**: Install `django-debug-toolbar` in development and watch the query count on every page.

### 4. One Giant "API" App

**Problem**: Everything in one app because it's "simpler."

**Reality**: Django apps are *pluggable* by design. A single `api` app with 20 models in `models.py` and 50 views in `views.py` is unmaintainable.

**Rule**: If you can describe an app with a single noun (`accounts`, `products`, `orders`), it should be a separate app. Django apps are not microservices; they're logical groupings.

### 5. Ignoring Database Design

**Problem**: Diving into code without designing tables. "I'll figure it out as I go."

**Reality**: Changing a database is expensive. Adding a field is easy. Changing relationships (one-to-many → many-to-many) requires migrations that lock tables.

**Fix**: Spend time on the entity relationship diagram (like the one in section 3) before writing any code. `python manage.py makemigrations` should be boring.

### 6. Bad Auth / Permission Practices

**Mistakes**:
- Rolling custom auth instead of using DRF's auth classes
- Using token auth when you need JWT (no expiration) or JWT when you need session (can't revoke)
- Not checking object-level permissions (user A can see user B's orders)
- Exposing password in error messages
- Not rate-limiting auth endpoints

**Rule**: Use `djangorestframework-simplejwt` for SPA auth. Use DRF's `permissions` classes (IsAuthenticated, IsAdminUser, custom). Never return the password field in serializers.

### 7. Not Testing

**Excuse**: "I'll add tests later." You won't. Tests fall to the bottom of every priority list.

**Reality**: Django's test framework is excellent and more approachable than frontend testing:
- No mocking needed for the database (test DB is created/destroyed per run)
- DRF's `APITestCase` makes HTTP-level testing trivial
- Factory Boy for test data
- Tests catch migration issues, permission errors, serialization bugs

**Practice**: Write tests alongside code. Test models (validations, methods), API endpoints (status codes, response shape, permissions), and edge cases (empty cart, out of stock, invalid coupon).

### 8. Error Handling Paralysis

**Problem**: Either no error handling (500s on any bad input) or overly complex generic error handlers.

**Solution**: DRF handles this well by default:
- Validation errors → 400 with field-level messages
- Permission denied → 403
- Not found → 404
- Method not allowed → 405

Use DRF's exception handler and customize once if needed. Don't wrap every view in try/except.

### 9. Settings File Mess

**Mistakes**:
- Hardcoding `SECRET_KEY`, `DATABASE_URL`, `STRIPE_KEY` in settings
- Committing secrets to git
- One flat `settings.py` with no environment separation
- Using `settings.py` `if DEBUG:` blocks for conditional config

**Fix**: Split settings (base/local/production). Use env vars. Keep a `.env.example` in git. Never commit `.env`.

### 10. Over-engineering Prematurely

**Mistakes**:
- Adding Celery + Redis in Phase 1 (for 0 users)
- Abstracting behind service/repository layers "for testability"
- Building microservices when you're a solo developer
- Caching everything before there's a performance problem

**Rule**: You are optimizing for learning, not scale. Add infrastructure *when you need it*, not because "production apps do this." Your app with 0 users does not need Redis, Celery, or Kubernetes.

---

## 7. Architectural Tradeoffs

| Decision | Choice | Alternative | Why This |
|----------|--------|-------------|----------|
| Primary Keys | UUID | Auto-increment | Security (no ID enumeration), future sharding |
| User model | Email as username | Username + email | Simpler UX, fewer fields |
| Cart storage | DB + session hybrid | Pure session | Persistence across logins/devices |
| Category tree | Adjacency list (parent FK) | MPTT, Treebeard | Simpler to implement, no extra dependency |
| Payments | Stripe | PayPal, Braintree | Best developer experience, good docs |
| Auth | JWT (SimpleJWT) | Session auth | Stateless, SPA-friendly |
| Product variants | Optional (future) | Required from day 1 | Start simple, add when needed |
| Multi-vendor | No (Phase 10+) | Yes from start | Massive complexity increase, unnecessary for learning |
| API docs | DRF-YASG / drf-spectacular | hand-written | Auto-generated OpenAPI spec from code |
| Testing | pytest + factory_boy | Django TestCase | More concise, better fixtures |
| Deployment | Docker + single VPS | Heroku, Railway | More learning value, vendor independence |

### When to Revisit These Decisions

- **UUID → integer**: If JOIN performance becomes a measurable problem (it won't for your scale)
- **Adjacency list → MPTT**: If you have 5+ levels of categories and the recursive queries are slow
- **Monorepo → separate repos**: If you hire separate frontend/backend teams
- **Single server → multiple services**: If you need to scale parts independently (likely never)
- **JWT → sessions**: If you need server-side token revocation (blacklisting JWT is possible but adds complexity)
