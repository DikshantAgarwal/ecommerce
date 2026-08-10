# Changelog

> **All notable changes to the KuHu Apparels project will be documented here.**

---

## Version History

| Version | Date | Summary |
|---|---|---|
| [v1.5.0](#150---2026-08-10) | 2026-08-10 | Real-product catalog (4 themes), Cloudinary images, full production deployment |
| [v1.4.0](#140---2026-08-10) | 2026-08-10 | Variants, homepage, listing filters, checkout flow (orders backend + pages) |
| [v1.3.0](#130---2026-07-18) | 2026-07-18 | Cart backend + frontend, guest support, merge, Add to Cart buttons |
| [v1.2.0](#120---2026-07-18) | 2026-07-18 | Google OAuth full auth flow, JWT, frontend integration |
| [v1.1.0](#110---2026-07-07) | 2026-07-07 | Product detail page, reusable components, slug routing, Bruno testing |
| [v1.0.0](#100---2026-07-05) | 2026-07-05 | Initial documentation, ADRs, UI bible, deployment guide |

---

<a name="100---2026-07-05"></a>
## [1.0.0] — 2026-07-05

### Added

- **Documentation**
  - Project documentation structure (`docs/`) created.
  - Project context, vision, roadmap documented.
  - Architecture Decision Records (ADRs) for all major technical decisions.
  - UI Design Bible with complete design system specification.
  - API conventions and standards documented.
  - Deployment guide for local and production environments.
  - Launch checklist for MVP verification.

### Previous Work (Prior to Documentation)

#### Backend

- **Foundation** (Phase 0)
  - Django project scaffolded with split settings (`base.py`, `local.py`, `production.py`).
  - PostgreSQL configured via environment variables.
  - WSGI and ASGI entry points configured.

- **Accounts** (Phase 1 — Partial)
  - Custom `User` model (UUID PK, email-as-username, no username field, `full_name`).
  - Custom `UserManager`.
  - User registered in Django admin with custom display.

- **Products** (Phase 2 — Mostly Complete)
  - `Category` model (name, slug, is_active, description, timestamps).
  - `Product` model (name, slug, description, price, stock_quantity, FK to Category, timestamps).
  - `CategorySerializer` and `ProductSerializer` with validation.
  - `ProductListAPIView` with category filter, search, ordering, pagination.
  - `ProductDetailAPIView`, `CategoryListAPIView`, `CategoryDetailAPIView`.
  - URL routing for all product endpoints.
  - Admin registration for both models.

#### Frontend

- **Scaffold**
  - React 19 + TypeScript + Vite project initialized.
  - Tailwind CSS v4 configured.
  - React Router 7 with basic route structure.
  - TanStack Query v5 configured.
  - Zustand store for UI state.
  - Axios client configured with base URL.

- **Pages**
  - Home page with product list (loading, error, empty states).

- **Services & Types**
  - `Product` and `ProductsResponse` TypeScript interfaces.
  - `getProducts()` API service function.
  - `useProducts()` React Query hook.

### Key Decisions in v1.0

- **Social-Only Login:** MVP uses Google OAuth as the sole authentication method — no manual email/password registration or login. This reduces security surface area and speeds up onboarding. Manual login deferred to post-MVP.
- **django-allauth** chosen as the social auth library for its maturity, community, and extensibility.

### Project Status at v1.0

| Area | Status |
|---|---|
| Project Configuration | ✅ Complete |
| Architecture Documentation | ✅ Complete |
| UI Design Bible | ✅ Complete |
| Deployment Guide | ✅ Complete |
| Accounts Backend | ⏳ 30% Complete |
| Products Backend | ✅ ~70% Complete |
| Cart Backend | ❌ Not Started |
| Orders Backend | ❌ Not Started |
| Payments Backend | ❌ Not Started |
| Reviews Backend | ❌ Not Started |
| Coupons Backend | ❌ Not Started |
| Frontend Pages | ⏳ 10% Complete |
| Tests | ❌ Not Started |
| CI/CD | ❌ Not Started |
| Docker | ❌ Not Started |

---

<a name="150---2026-08-10"></a>
## [1.5.0] — 2026-08-10

### Added

- **Real-Product Catalog**
  - 4 live themes: Gods & Mythology, Premium, Alcohol, Motivation & Quotes (Men + Women).
  - Seeded 31 products / 232 variants from 58 real design files via idempotent `seed_catalog` command.
  - `Product.is_active` flag + migration; views filter to active products only; old catalog deactivated.

- **Cloudinary Image Hosting (ADR-009)**
  - `cloudinary` + `django-cloudinary-storage` wired through `STORAGES['default']` (env-driven, `PREFIX=''`).
  - `sync_cloudinary` command uploaded 263 product/variant images as extension-less public_ids; all URLs verified 200.
  - Cloudinary-aware seeding so production stores asset-matching names.

- **Production Deployment**
  - Backend on Railway serving the new catalog (migrate + seed against prod Postgres).
  - Frontend on Vercel with root directory set to `frontend` and the 4-theme `PopularThemes` + mobile snap slider.

### Changed

- **Settings** — Cloudinary storage via `STORAGES` dict (fixes Django 5 `DEFAULT_FILE_STORAGE`/`STORAGES` conflict); CORS now tolerates trailing slashes; staticfiles backend preserved.
- **.gitignore** — `backend/media/new-images/` source folder tracked so production can seed.
- **PopularThemes** — rebuilt around the 4 live themes with a mobile snap-scroll slider.

### Project Status at v1.5.0

| Area | Status |
|---|---|
| Products backend (variants) | ✅ |
| Catalog with real images | ✅ |
| Cart | ✅ |
| Orders / Checkout | ✅ |
| Production deployment (Railway + Vercel) | ✅ |
| Payments (Razorpay) | ⏳ In progress |
| Order emails | ⏳ Pending |
| Image lens/magnifier + UI polish | ⏳ Pending |

---

<a name="140---2026-08-10"></a>
## [1.4.0] — 2026-08-10

### Added

- **Product Variants**
  - `ProductVariant` model (color, size, stock_quantity, price override) with migrations, slug-based image naming.
  - Product detail page color/size selector with image swap.
  - Cart refactored to variant-based items (`CartItem.variant` FK, stock validated at variant level).
  - Order items reference variants; variant price falls back to product price.

- **Homepage (Phase 2)**
  - `HeroBanner`, `PopularThemes`, and "All Products" sections.
  - Homepage cleanup and theme filtering across listing.

- **Product Listing (Phase 3)**
  - `FilterSidebar` (desktop), `SortSelect`, `MobileFilterDrawer`, `ActiveFilterPills`.
  - Category/search/sort filters compose and reset to page 1 on change.

- **Checkout Flow (Phase 4)**
  - Orders backend — `Order` + `OrderItem` models, `POST /api/orders/` creates an order from the cart with stock validation + decrement inside `transaction.atomic`, `GET /api/orders/:id/` (ownership-scoped).
  - `Checkout` page (order summary, place-order button), `OrderConfirmation` page (order items, status, total).
  - `useOrder`, `useCreateOrder` hooks and `order.service`; `/orders/:id/confirmation` route.
  - Checkout / confirmation prepare the flow for Rivers — Razorpay payment integration is next.
  - 52 frontend tests + 47 backend tests passing (variant-aware cart tests added).

### Changed

- **Cart** — items now store a `ProductVariant` reference instead of a raw product; stock validation moved to variant level.
- **Production settings** — `x-session-id` allowed in CORS headers; DRF restricted to JSON renderer (fixes production browser 500).
- **Deployment** — `vercel.json` added with SPA rewrites and security headers; frontend TS build errors fixed; Railway backend production-ready.

### Project Status at v1.4.0

| Area | Status |
|---|---|
| Project Configuration | ✅ Complete |
| Architecture Documentation | ✅ Complete |
| UI Design Bible | ✅ Complete |
| Deployment Guide | ✅ Complete |
| Accounts Backend | ✅ Complete |
| Products Backend | ✅ ~95% Complete |
| Cart Backend | ✅ Complete |
| Cart Frontend | ✅ Complete |
| Orders Backend | ✅ Complete |
| Checkout Frontend | ✅ Complete |
| Variants (Full Stack) | ✅ Complete |
| Payments Backend | ❌ Not Started |
| Reviews Backend | ❌ Not Started |
| Coupons Backend | ❌ Not Started |
| Frontend Pages | ⏳ ~70% Complete |
| Component Architecture | ✅ Established |
| Authentication (Google OAuth) | ✅ Complete |
| Tests | ✅ 52 frontend + 47 backend |
| CI/CD | ❌ Not Started |
| Docker | ✅ Complete |

---
## [1.3.0] — 2026-07-18

### Added

- **Cart Backend**
  - `Cart` model (UUID PK, OneToOne to User, session_id for guests) and `CartItem` model (FK to Cart, FK to Product, quantity, unique_together).
  - `GET /api/cart/` — view current cart (creates one if not exists). Works for authenticated users and guest users with `X-Session-Id`.
  - `POST /api/cart/items/` — add item with stock validation; increments quantity if item already in cart.
  - `PATCH /api/cart/items/{id}/` — update item quantity with stock check.
  - `DELETE /api/cart/items/{id}/` — remove item from cart.
  - `POST /api/cart/merge/` — merge guest cart into user cart on login (combines quantities for duplicate products, deletes guest cart).
  - Admin registration for both models.
  - 27 backend tests covering CRUD, guest support, stock validation, merge, cross-cart isolation, and error cases.

- **Cart Frontend**
  - `CartIcon` component — header cart icon with item count badge (shows "99+" for >99 items, hidden when empty).
  - `AddToCartButton` component — React Query mutation, "Adding..." pending state.
  - `Cart` page — loading skeletons, error state, empty state with shopping CTA, item rows with +/- quantity controls, remove button, line-item subtotal, cart total, disabled checkout button with "coming soon" label.
  - `ProductCard` — updated with Add to Cart button on every listing card (stops link navigation).
  - `ProductDetail` — Add to Cart button below product description.
  - React Query hooks: `useCart()`, `useAddToCart()`, `useUpdateCartItem()`, `useRemoveCartItem()` — all invalidate `['cart']` on success.
  - 16 frontend tests covering service, CartIcon badge, AddToCartButton click, and Cart page states.

### Changed

- **Frontend — API Client**
  - Auto-generates a UUID guest session ID on first load, persisted in localStorage.
  - Attaches `X-Session-Id` header to all requests for guest cart support.
  - Session ID is cleared on logout so a fresh one is created.

- **Backend — CORS**
  - `X-Session-Id` added to `CORS_ALLOW_HEADERS` in local settings.

- **Frontend — Tailwind Theme**
  - Added `@theme` block with `primary` color palette (`#1B4332`–`#D8F3DC`), `accent` colors, and `font-heading` font family. Fixes all invisible `bg-primary-*` / `text-primary-*` classes.

- **Frontend — Auth Store**
  - Logout now also clears the guest session ID from localStorage.

### Project Status at v1.3.0

| Area | Status |
|---|---|
| Project Configuration | ✅ Complete |
| Architecture Documentation | ✅ Complete |
| UI Design Bible | ✅ Complete |
| Deployment Guide | ✅ Complete |
| Accounts Backend | ✅ Complete |
| Products Backend | ✅ ~90% Complete |
| Cart Backend | ✅ Complete |
| Cart Frontend | ✅ Complete |
| Orders Backend | ❌ Not Started |
| Payments Backend | ❌ Not Started |
| Reviews Backend | ❌ Not Started |
| Coupons Backend | ❌ Not Started |
| Frontend Pages | ⏳ ~55% Complete |
| Component Architecture | ✅ Established |
| Authentication (Google OAuth) | ✅ Complete |
| Tests | ✅ Backend + Frontend auth + cart tests |
| CI/CD | ❌ Not Started |
| Docker | ❌ Not Started |

---

<a name="120---2026-07-18"></a>
## [1.2.0] — 2026-07-18

### Added

- **Authentication — Google OAuth Backend**
  - `django-allauth` installed and configured with Google provider (SCOPE, PKCE, site ID).
  - `POST /api/auth/google/` — accepts Google ID token, verifies signature via `google-auth` library, creates or logs in user.
  - JWT access token (15 min lifetime) and refresh token (7 day lifetime) returned on successful authentication.
  - `POST /api/auth/token/refresh/` — SimpleJWT token refresh endpoint.
  - `GET /api/auth/me/` — protected profile endpoint returning user email, full_name, avatar.
  - `PATCH /api/auth/me/` — update full_name and avatar fields.
  - `User.avatar` field added to model for Google profile picture.

- **Authentication — Frontend Integration**
  - `GoogleSignInButton` component — loads Google Identity Services (GIS) library dynamically, renders Sign In With Google button, handles credential response with loading/error states.
  - `auth.service.ts` — `googleLogin()`, `refreshToken()`, `getProfile()`, `updateProfile()` API functions.
  - `auth.store.ts` — Zustand store with localStorage persistence for tokens and user data.
  - `ProtectedRoute` component — redirects unauthenticated users to `/login`.
  - `Login` page — presents Google Sign-In button to unauthenticated users.
  - `api/client.ts` — Axios interceptor attaches Bearer token; handles 401 with automatic token refresh and request queue to prevent race conditions.
  - `RootLayout` — updated with Google Sign-In integration and design-bible-aligned colors.
  - Barrel exports for all new components via `components/index.ts`.

### Changed

- **Backend — Accounts**
  - Google OAuth configuration added to settings (allauth providers, SimpleJWT, DRF auth classes).
  - User model migration: `avatar` URL field added.
  - URL routing: `/api/auth/google/`, `/api/auth/token/refresh/`, `/api/auth/me/` endpoints registered.

- **Frontend — Architecture**
  - Circular dependency broken: Axios interceptor inlines the refresh call instead of importing auth service.
  - Token refresh race condition handled: concurrent 401s queue a single refresh via a promise reference.
  - Application now has client-side auth guard — unauthenticated users cannot access protected routes.

### Tests

- **Backend (197 lines):** Google login (new user, existing user, name/avatar update, missing token, empty token, invalid token, wrong issuer, no email), token refresh (success, invalid, missing), profile (authenticated, unauthenticated, JWT auth, expired JWT, patch name, patch avatar, empty body, invalid field).
- **Frontend:** `GoogleSignInButton` render/credential/error tests, `ProtectedRoute` auth/unauth redirect tests, `Login` page render tests, `auth.service` API call tests, `auth.store` persistence/setAuth/logout tests.

<a name="110---2026-07-07"></a>
## [1.1.0] — 2026-07-07

### Added

- **Frontend — Product Detail Feature**
  - `ProductDetailPage` at `/products/:id` with four states: invalid id, loading (skeleton), error, not found, and full detail view.
  - `useProduct(id)` React Query hook with scoped cache key (`['product', id]`).
  - `getProduct(id)` API service calling `GET /products/{id}/`.
  - Click-through navigation from `ProductCard` to product detail via React Router `Link`.

- **Frontend — Reusable Component Architecture**
  - `ProductCard` component: placeholder image (4:5), product name, formatted price.
  - `ProductGrid` component: responsive CSS grid (2→3→4 columns), empty state.
  - Barrel exports via `components/index.ts`.
  - Clean separation: pages own data fetching, components own rendering.

### Changed

- **Backend — Products**
  - Product Detail API migrated from integer PK to slug-based routing.
  - Product filtering (category, price range), search (name/description), ordering (price, date, name), and pagination completed and tested via Bruno.

- **Frontend — Home Page**
  - Refactored from monolithic list to fetch-and-delegate pattern: `Home` passes `data.results` to `ProductGrid`.

- **Frontend — Architecture**
  - React Router integrated into feature flow (`/products/:id` route added).
  - API services and React Query hooks separated into distinct layers.
  - `ProductCard` wrapped in `<Link>` enabling keyboard-accessible navigation.

### Project Status at v1.2.0

| Area | Status |
|---|---|
| Project Configuration | ✅ Complete |
| Architecture Documentation | ✅ Complete |
| UI Design Bible | ✅ Complete |
| Deployment Guide | ✅ Complete |
| Accounts Backend | ✅ Complete |
| Products Backend | ✅ ~90% Complete |
| Cart Backend | ❌ Not Started |
| Orders Backend | ❌ Not Started |
| Payments Backend | ❌ Not Started |
| Reviews Backend | ❌ Not Started |
| Coupons Backend | ❌ Not Started |
| Frontend Pages | ⏳ ~45% Complete |
| Component Architecture | ✅ Established |
| Authentication (Google OAuth) | ✅ Complete |
| Tests | ✅ Backend + Frontend auth tests |
| CI/CD | ❌ Not Started |
| Docker | ❌ Not Started |

---

## [Unreleased]

### Sprint 1 — Completed (All 14 tasks)

Sprint 1 (6 Jul — 18 Jul) delivered: product listing with filtering/search/infinite scroll, product detail with slug routing, Google OAuth full auth flow (backend + frontend), reusable component architecture.

### Sprint 2 (13 Jul — 19 Jul) — ✅ Complete

- [x] Cart backend: Cart & CartItem models, add/view/update/remove endpoints
- [x] Frontend: Cart page, add-to-cart flow
- [x] Orders backend: Order model, create order from cart
- [x] Checkout page + Order confirmation flow (released in v1.4.0)

### Planned for Sprint 3 (20 Jul — 26 Jul)

- [ ] Razorpay payment integration
- [ ] Email notifications via Resend

### Planned for Sprint 4 (27 Jul — 2 Aug)

- [ ] Product Customizer (Fabric.js)
- [ ] Cloudinary image upload
- [ ] User profile page
- [ ] Order history

### Planned for Sprint 5 (3 Aug — 10 Aug)

- [ ] Deployment to production
- [ ] Analytics setup (GA4)
- [ ] Smoke testing
- [ ] Launch checklist verification
- [ ] MVP Launch 🚀

---

*This changelog follows the [Keep a Changelog](https://keepachangelog.com/) format.*
