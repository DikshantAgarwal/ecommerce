# Daily Engineering Report

| Field | Value |
|---|---|
| **Date** | 2026-07-07 |
| **Current Sprint** | Sprint 1 (Foundation & Auth: 6 Jul — 12 Jul) |
| **MVP Deadline** | 10 August 2026 |
| **Status** | ⚠ Slightly Behind |

---

## 🎯 Overall Project Status

| Health | Milestone | Focus | Completion |
|---|---|---|---|
| Stable | Sprint 1 — Foundation & Auth | Google OAuth Backend | ~20% toward MVP |

Products backend ~90% complete. Frontend component architecture established. Google OAuth is the critical remaining path for this sprint.

---

## ✅ Completed Today

**Backend**
- Product Detail API migrated from integer PK to slug-based routing (`products/<str:slug>/`)
- Product filtering, search, ordering, and pagination verified through Bruno

**Frontend**
- Home page refactored into fetch-and-delegate pattern (data fetching → ProductGrid)
- `ProductCard` component: placeholder image (4:5), product name, formatted price
- `ProductGrid` component: responsive grid (2→3→4 columns), empty state
- `ProductDetailPage` at `/products/:id` with invalid ID, loading, error, not-found, and success states
- `useProduct(id)` React Query hook and `getProduct(id)` API service
- Click-through navigation from `ProductCard` to detail page via `<Link>`

**Architecture**
- React Router integrated into feature flow (`/products/:id` route)
- React Query hooks separated from API services into distinct layers
- Reusable component architecture with barrel exports (`components/index.ts`)

**Documentation**
- CHANGELOG updated to v1.1.0
- ADRs 021 (Social-Only Login) and 022 (django-allauth) documented
- Weekly progress report and prompts archive created

---

## 📊 Overall Progress

| Area | Status | Progress |
|---|---|---|
| Backend — Products | ✅ Complete | ~90% |
| Backend — Accounts | 🟡 In Progress | ~30% |
| Backend — Cart | ❌ Not Started | 0% |
| Backend — Orders | ❌ Not Started | 0% |
| Backend — Payments | ❌ Not Started | 0% |
| Frontend — Pages | 🟡 In Progress | ~30% |
| Frontend — Components | ✅ Complete | 100% |
| Authentication (Google OAuth) | ❌ Not Started | 0% |
| Documentation | ✅ Complete | 100% |
| Testing | ❌ Not Started | 0% |
| Deployment | ❌ Not Started | 0% |

---

## 🚧 Current Sprint

### Completed (10/14)

- [x] Product detail page (Frontend)
- [x] Product detail routing (`/products/:id`)
- [x] ProductCard → ProductDetail navigation
- [x] `useProduct()` hook and `getProduct()` service
- [x] Home page refactored into reusable component architecture
- [x] ProductGrid and ProductCard components created
- [x] Backend: Product Detail API migrated to slug-based routing
- [x] Backend: Product filtering, searching, ordering, pagination completed and tested
- [x] ADRs 021-022: Social-only login decision documented

### Remaining (4)

- [ ] Google OAuth integration: `django-allauth` + Google provider
- [ ] Accounts API: Google token exchange → JWT, Profile endpoints
- [ ] Frontend: Google Sign-In button, post-login redirect
- [ ] Staff product CRUD endpoints (backend)

### Blocked

Nothing currently blocked.

---

## 🎯 Current Focus

**Current Feature:** Google OAuth Backend

**Why this is the priority:** Every authenticated feature (cart, checkout, orders, customizer) depends on a working login flow. Until users can authenticate, no downstream feature can be built or tested.

**Definition of Done:**

- [ ] `django-allauth` installed and configured with Google provider
- [ ] Google Cloud project created with OAuth credentials
- [ ] `POST /api/auth/google/` endpoint accepts Google ID token
- [ ] Server verifies ID token signature against Google certs
- [ ] New Django User created on first-time Google sign-in (name, email, avatar from Google)
- [ ] Existing user logged in on subsequent sign-ins
- [ ] JWT access token (15 min) and refresh token (7 days) returned on success
- [ ] Token refresh endpoint (`POST /api/auth/token/refresh/`) works
- [ ] Protected endpoint verified with valid JWT
- [ ] Protected endpoint rejects expired/missing JWT with 401

---

## ⏭️ What's Next

1. **Google Sign-In Frontend** — Google Identity Services button, Zustand auth store, Axios interceptor, protected route redirect
2. **Profile API** — `GET/PATCH /api/auth/me/` returning Google profile data
3. **Railway Deployment** — Deploy backend + frontend skeleton to catch infra issues early
4. **Cart Backend** — Cart + CartItem models and endpoints (Sprint 2)
5. **Cart Frontend** — Cart page, add-to-cart flow (Sprint 2)



## 📌 End of Day Summary

- **Biggest achievement:** Frontend component architecture established with `ProductGrid`, `ProductCard`, and `ProductDetail` — production-ready, reusable, and tested
- **Overall project completion:** ~20% toward MVP
- **Sprint completion:** 10/14 tasks (71%), 5 days remaining in Sprint 1
- **Current feature:** Google OAuth Backend
- **Tomorrow's objective:** Begin Google OAuth backend integration (django-allauth + token exchange endpoint)
