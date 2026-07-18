# Changelog

> **All notable changes to the KuHu Apparels project will be documented here.**

---

## Version History

| Version | Date | Summary |
|---|---|---|
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

### Project Status at v1.1.0

| Area | Status |
|---|---|
| Project Configuration | ✅ Complete |
| Architecture Documentation | ✅ Complete |
| UI Design Bible | ✅ Complete |
| Deployment Guide | ✅ Complete |
| Accounts Backend | ⏳ 30% Complete |
| Products Backend | ✅ ~90% Complete |
| Cart Backend | ❌ Not Started |
| Orders Backend | ❌ Not Started |
| Payments Backend | ❌ Not Started |
| Reviews Backend | ❌ Not Started |
| Coupons Backend | ❌ Not Started |
| Frontend Pages | ⏳ ~30% Complete |
| Component Architecture | ✅ Established |
| Tests | ❌ Not Started |
| CI/CD | ❌ Not Started |
| Docker | ❌ Not Started |

---

## [Unreleased]

### Sprint 1 (6 Jul — 12 Jul)

#### Completed
- [x] Product detail page (Frontend)
- [x] Product detail routing (`/products/:id`)
- [x] Product navigation from ProductCard to Product Detail
- [x] `useProduct()` hook and `getProduct()` service
- [x] Home page refactored into reusable component architecture
- [x] ProductGrid and ProductCard components created
- [x] Backend: Product Detail API migrated to slug-based routing
- [x] Backend: Product filtering, searching, ordering, pagination completed and tested
- [x] ADRs 021-022: Social-only login decision documented
- [x] Category Filter UI with horizontal pill buttons
- [x] Search UI with 400ms debounce
- [x] Infinite scrolling via `useInfiniteQuery` + Load More button

#### Remaining
- [ ] Google OAuth integration: `django-allauth` + Google provider

### Planned for Sprint 2 (13 Jul — 19 Jul)

- [ ] Cart backend: Cart & CartItem models, add/view/update/remove endpoints
- [ ] Frontend: Cart page, add-to-cart flow
- [ ] Orders backend: Order model, create order from cart

### Planned for Sprint 3 (20 Jul — 26 Jul)

- [ ] Checkout page (Frontend)
- [ ] Razorpay payment integration
- [ ] Order confirmation flow
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
