# Changelog

> **All notable changes to the KuHu Apparels project will be documented here.**

---

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

## [Unreleased]

### Planned for Sprint 1 (6 Jul — 12 Jul)

- [ ] Google OAuth integration: `django-allauth` + Google provider
- [ ] Accounts API: Google token exchange → JWT, Profile endpoints
- [ ] Frontend: Google Sign-In button, post-login redirect
- [ ] Product detail page (Frontend)
- [ ] Add remaining product endpoints (CRUD for staff)
- [ ] ADRs 021-022: Social-only login decision documented

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
