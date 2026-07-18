# Daily Engineering Report

| Field | Value |
|---|---|
| **Date** | 2026-07-14 |
| **Current Sprint** | Sprint 1 (Foundation & Auth: 6 Jul — 12 Jul) |
| **MVP Deadline** | 10 August 2026 |
| **Status** | 🟡 On Track |

---

## Daily Report Index

| Date | Summary |
|---|---|
| [2026-07-07](#2026-07-07) | Product detail page, reusable components, slug routing |
| [2026-07-14](#2026-07-14) | Category filter, search, infinite scrolling |
| [2026-07-18](#2026-07-18) | Google OAuth + Cart backend + frontend, JWT auth, Tailwind theme, CORS fix |

---

## 🎯 Overall Project Status

| Health | Milestone | Focus | Completion |
|---|---|---|---|
| Complete | Sprint 1 — Foundation & Auth | Cart Frontend | ~35% toward MVP |

Products backend ~90% complete. Frontend component architecture established. Google OAuth fully implemented with JWT auth, profile API, and frontend integration. Sprint 1 complete. Cart Backend complete with full CRUD, guest support, merge, and stock validation.

---

<a name="2026-07-07"></a>
## 2026-07-07

### ✅ Completed Today

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
| Backend — Accounts | ✅ Complete | ~100% |
| Backend — Cart | ✅ Complete | ~100% |
| Backend — Orders | ❌ Not Started | 0% |
| Backend — Payments | ❌ Not Started | 0% |
| Frontend — Pages | 🟡 In Progress | ~55% |
| Frontend — Components | ✅ Complete | 100% |
| Authentication (Google OAuth) | ✅ Complete | 100% |
| Cart (Full Stack) | ✅ Complete | 100% |
| Documentation | ✅ Complete | 100% |
| Testing | ❌ Not Started | 0% |
| Deployment | ❌ Not Started | 0% |

---

## 🚧 Current Sprint

### Completed (14/14)

- [x] Product detail page (Frontend)
- [x] Product detail routing (`/products/:id`)
- [x] ProductCard → ProductDetail navigation
- [x] `useProduct()` hook and `getProduct()` service
- [x] Home page refactored into reusable component architecture
- [x] ProductGrid and ProductCard components created
- [x] Backend: Product Detail API migrated to slug-based routing
- [x] Backend: Product filtering, searching, ordering, pagination completed and tested
- [x] ADRs 021-022: Social-only login decision documented
- [x] Category Filter UI (horizontal pill buttons with loading/error states)
- [x] Search UI with 400ms debounce
- [x] Infinite scrolling with `useInfiniteQuery` + Load More button
- [x] Google OAuth Backend: `django-allauth` + JWT token exchange endpoint
- [x] Google OAuth Frontend: Google Sign-In button, Zustand auth store, Axios interceptor, ProtectedRoute, Login page

### Remaining (0)

Sprint 1 complete — all 14 tasks delivered.

### Blocked

Nothing currently blocked.

---

## 🎯 Current Focus

**Current Feature:** Google OAuth — ✅ Complete

**What was delivered:**
- `django-allauth` configured with Google provider
- `POST /api/auth/google/` — verifies Google ID token via `google-auth` library
- New Django User created on first sign-in; existing user updated on subsequent sign-ins
- JWT access (15 min) + refresh (7 days) returned on success
- `POST /api/auth/token/refresh/` — refresh endpoint via SimpleJWT
- `GET /api/auth/me/` — protected profile endpoint
- `PATCH /api/auth/me/` — update full_name / avatar
- 197 lines of tests covering login, refresh, profile, and auth errors
- Frontend: GoogleSignInButton, auth Zustand store, Axios interceptor, ProtectedRoute, Login page
- Frontend tests for all components and services

**Authentication flow:** Google ID Token → Backend verification → JWT → Stored in localStorage → Axios interceptor attaches Bearer header → Protected routes redirect to /login when unauthenticated

---

## ⏭️ What's Next

1. **Cart Frontend** — Cart page, add-to-cart flow (Sprint 2)
2. **Railway Deployment** — Deploy backend + frontend skeleton to catch infra issues early



## 📌 End of Day Summary

- **Biggest achievement:** Frontend component architecture established with `ProductGrid`, `ProductCard`, and `ProductDetail` — production-ready, reusable, and tested
- **Overall project completion:** ~20% toward MVP
- **Sprint completion:** 10/14 tasks (71%), 5 days remaining in Sprint 1
- **Current feature:** Google OAuth Backend
- **Tomorrow's objective:** Begin Google OAuth backend integration (django-allauth + token exchange endpoint)

---

<a name="2026-07-14"></a>
## 2026-07-14

### ✅ Completed Today

**Frontend**
- Category Filter UI: horizontal pill buttons with "All Categories" default, loading skeletons, and error state
- Search Bar: text input with clear button, 400ms debounce before API call
- Infinite Scrolling: replaced `useQuery` with `useInfiniteQuery`, products append on "Load More", button hides when no more pages
- Preserved category + search filter combination — both params sent simultaneously to backend
- Query key composition updated to `['products', categorySlug, searchQuery]` — filters reset to page 1 on change automatically
- `useDebounce` hook extracted as reusable utility

**Architecture / Learning**
- `useInfiniteQuery` with `getNextPageParam` parsing DRF's `next` URL for page number extraction
- Clean separation: `LoadMoreButton` is a standalone component — swapping to Intersection Observer later requires changing only `Home.tsx` rendering

### 🎯 Current Focus

**Current Feature:** Product Listing Enhancements (Category Filter, Search, Infinite Scroll)

**Definition of Done progress:**
- [x] Fetch categories from backend with loading/error states
- [x] Display category pills with "All Categories" option
- [x] Category selection updates product list via `?category=` param
- [x] Search input with debounce prevents excessive API calls
- [x] Category and search filters compose correctly (both params sent)
- [x] `useQuery` replaced with `useInfiniteQuery`
- [x] Products from all pages render as a single continuous grid
- [x] "Load More" button appears only when another page exists
- [x] Filter changes reset to page 1 automatically

### 📌 End of Day

- **Biggest achievement:** Product listing page now has category filtering, debounced search, and endless scrolling — a complete browsing experience
- **Overall project completion:** ~22% toward MVP
- **Sprint completion:** 13/14 tasks (93%)
- **Current feature:** Google OAuth Backend
- **Tomorrow:** Begin Google OAuth backend integration (django-allauth + token exchange endpoint)

---

<a name="2026-07-18"></a>
## 2026-07-18

### ✅ Completed Today

**Backend — Google OAuth**
- `django-allauth` + `google-auth` installed and configured in settings
- Google provider configured with SCOPE, PKCE, and site ID
- `POST /api/auth/google/` — accepts `id_token`, verifies against Google certs, creates/logs in user
- JWT access token (15 min) + refresh token (7 days) returned on success
- `POST /api/auth/token/refresh/` — SimpleJWT token refresh endpoint
- `GET /api/auth/me/` — protected profile endpoint returning email, full_name, avatar
- `PATCH /api/auth/me/` — update full_name and avatar
- 197 lines of tests: Google login (new user, existing user, update, invalid token, wrong issuer, no email), token refresh, profile (auth, unauth, JWT, expired JWT, patch)

**Frontend — Google OAuth**
- `GoogleSignInButton` component: loads Google Identity Services script, renders Sign In With Google button, handles credential response, loading/error states
- `auth.service.ts`: `googleLogin()`, `refreshToken()`, `getProfile()`, `updateProfile()` API calls
- `auth.store.ts`: Zustand store with localStorage persistence, `setAuth()`, `setUser()`, `logout()`, `getStoredRefreshToken()`
- `ProtectedRoute` component: redirects unauthenticated users to `/login`
- `Login` page: renders `GoogleSignInButton`, shows unauthenticated state
- `api/client.ts`: Axios interceptor attaches Bearer token, handles 401 with token refresh
- `RootLayout`: updated with Google Sign-In button, dark primary color
- Tests: `GoogleSignInButton`, `ProtectedRoute`, `Login`, `auth.service`, `auth.store`

**Architecture / Learning**
- Circular dependency broken by inlining refresh call in Axios interceptor (client.ts no longer imports auth.service)
- Google Identity Services GIS library loaded via dynamic script injection
- Token refresh race condition handled: concurrent 401s queue a single refresh call

### 🎯 Current Focus

**Feature:** Google OAuth — ✅ Complete (Sprint 1 Done)

**Sprint 1 (6 Jul — 18 Jul) — All 14 tasks delivered:**
1. Product detail page (Frontend)
2. Product detail routing (`/products/:id`)
3. ProductCard → ProductDetail navigation
4. `useProduct()` hook and `getProduct()` service
5. Home page refactored into reusable component architecture
6. ProductGrid and ProductCard components created
7. Backend: Product Detail API migrated to slug-based routing
8. Backend: Product filtering, searching, ordering, pagination completed and tested
9. ADRs 021-022: Social-only login decision documented
10. Category Filter UI with horizontal pill buttons
11. Search UI with 400ms debounce
12. Infinite scrolling via `useInfiniteQuery` + Load More button
13. Google OAuth Backend: `django-allauth` + JWT token exchange endpoint
14. Google OAuth Frontend: Google Sign-In button, Zustand auth store, Axios interceptor, ProtectedRoute, Login page

### 📌 End of Day

- **Biggest achievement:** Full cart feature end-to-end — backend CRUD with guest support and merge, plus frontend cart page, Add to Cart on listing and detail pages, cart icon with badge, and 16 frontend tests.
- **Overall project completion:** ~40% toward MVP
- **Sprint 2 completion:** Cart complete (backend + frontend). Railway Deployment and Orders remain.
**Cart Backend:**
- `Cart` + `CartItem` models, `GET /api/cart/`, `POST /api/cart/items/`, `PATCH/DELETE /api/cart/items/:id/`, `POST /api/cart/merge/`
- Guest cart via `X-Session-Id` header, stock validation (409), cart merge on login
- 27 backend tests

**Cart Frontend:**
- `CartIcon` component in header with item count badge (handles 99+)
- `AddToCartButton` on `ProductDetail` page and `ProductCard` listing cards
- `Cart` page: loading skeletons, error state, empty state with CTA, item rows with +/- quantity controls, remove button, total display
- `useCart`, `useAddToCart`, `useUpdateCartItem`, `useRemoveCartItem` React Query hooks
- `auth.store` updated to clear guest session ID on logout
- 16 frontend tests (service, hooks via components, page states)

**Bug fixes:**
- `apiClient` auto-generates and attaches `X-Session-Id` header for guest users
- Backend CORS configured to allow `x-session-id` header
- Tailwind v4 `@theme` block added with `primary` color palette (dark green) and `font-heading`

- **Next up:** Sprint 2 — Railway Deployment, Orders Backend
