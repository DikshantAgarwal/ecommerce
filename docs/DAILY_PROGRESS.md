# Daily Engineering Report

| Field | Value |
|---|---|
| **Date** | 2026-08-11 |
| **Current Sprint** | Sprint 5 (Launch Prep) |
| **MVP Deadline** | 10 August 2026 |
| **Status** | 🟢 On Track |

---

## Daily Report Index

| Date | Summary |
|---|---|
| [2026-07-07](#2026-07-07) | Product detail page, reusable components, slug routing |
| [2026-07-14](#2026-07-14) | Category filter, search, infinite scrolling |
| [2026-07-18](#2026-07-18) | Google OAuth + Cart backend + frontend, JWT auth, Tailwind theme, CORS fix |
| [2026-07-29](#2026-07-29) | Railway deployment — backend live, 502 debugging, Docker/gunicorn setup |
| [2026-08-10](#2026-08-10) | Phases 2–4 done — homepage, filters/sort, checkout+orders; variants; deployment finished |
| [2026-08-10](#2026-08-10-catalog) | Real-product catalog shipped — 4-theme catalog, 263 Cloudinary images, full prod deploy |
| [2026-08-10](#2026-08-10-ui-polish) | UI polish complete — lens/lightbox zoom, breadcrumb + section nav, unified theme carousel, logo, states, focus rings |
| [2026-08-11](#2026-08-11-storefront-ux-fixes) | ₹ pricing, edit-carousel + editorial hero, ₹-aware cart, logout, compact hero, dedupe filters, carousel perf, scroll-to-top |

---

## 🎯 Overall Project Status

| Health | Milestone | Focus | Completion |
|---|---|---|---|
| ✅ In Progress | Sprint 5 — Launch Prep | UI polish done; Payments (Razorpay) + order emails pending | ~70% toward MVP |

Products backend ~95% complete with variants. Frontend component architecture established. Google OAuth fully implemented with JWT auth, profile API, and frontend integration. Sprint 1-2 complete. Cart Backend complete with full CRUD, guest support, merge, and stock validation. Orders backend + checkout flow complete end-to-end (cart → order → confirmation, stock decrement). Backend deployed to Railway; frontend live on Vercel with the real catalog. Storefront UI polish complete (lens/lightbox zoom, breadcrumbs, section nav, unified theme carousel, loading/empty states, focus rings).

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
| Backend — Products | ✅ Complete | ~95% |
| Backend — Accounts | ✅ Complete | ~100% |
| Backend — Cart | ✅ Complete | ~100% |
| Backend — Orders | ✅ Complete | ~100% |
| Backend — Payments | ❌ Not Started | 0% |
| Frontend — Pages | ✅ Complete | ~85% |
| Frontend — Components | ✅ Complete | 100% |
| UI Polish (zoom, carousel, breadcrumb, states) | ✅ Complete | 100% |
| Authentication (Google OAuth) | ✅ Complete | 100% |
| Cart (Full Stack) | ✅ Complete | 100% |
| Checkout (Full Stack) | ✅ Complete | 100% |
| Variants (Full Stack) | ✅ Complete | 100% |
| Documentation | ✅ Complete | 100% |
| Testing | 🟡 In Progress | ~60% |
| Deployment | ✅ Complete | 100% |

---

## 🚧 Current Sprint

### Sprint 2 — Cart & Orders (Jul 13 – Jul 19) — ✅ Complete

**Completed**
- [x] Cart Model + endpoints (CRUD, guest merge, stock validation)
- [x] Cart Frontend (page, add-to-cart, icon badge, quantity controls)
- [x] Orders backend (Order + OrderItem models, create order from cart)
- [x] Checkout Page + Order Confirmation (Frontend)
- [x] Railway Deployment — backend containerized and live

**Remaining (Sprint 3 — Payments)**
- [ ] Razorpay Integration (Backend + Frontend)
- [ ] Order Confirmation Email Notifications

### Blocked

Nothing currently blocked.

---

## 🎯 Current Focus

**Current Feature:** Checkout flow — ✅ Complete. Next: Razorpay Payments

**What was delivered:**
- Homepage (Phase 2) — HeroBanner, PopularThemes, All Products sections
- Product listing (Phase 3) — FilterSidebar, SortSelect, MobileFilterDrawer, ActiveFilterPills
- Checkout (Phase 4) — Orders backend (create from cart, stock decrement), Checkout page, Order Confirmation page
- Product variants — color/size selection on detail page, variant-aware cart and orders
- Backend live on Railway; Vercel SPA config + security headers added
- 52 frontend tests + 47 backend tests passing

**Remaining:**
- Razorpay payment integration
- Order confirmation emails
- Frontend deploy to Vercel (config committed)

**Learning:** Variant-based cart/orders, `transaction.atomic` for order creation, Vercel SPA rewrites

---

## ⏭️ What's Next

1. **Payments (Sprint 3)** — Razorpay integration, order confirmation emails
2. **Vercel Frontend Deployment** — Deploy frontend to production
3. **Launch Prep (Sprint 5)** — Smoke test full purchase flow, launch checklist

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

---

<a name="2026-07-29"></a>
## 2026-07-29

### ✅ Completed Today

**Backend — Railway Deployment**
- Dockerized Django backend with `gunicorn` + `whitenoise` + `dj-database-url`
- `railway.json` configured with Dockerfile builder and startCommand
- Production settings: SSL headers, secure cookies, CORS for production
- Debugged and fixed 502 error: app must bind to `$PORT` (not hardcoded 8000)
- Fixed `DJANGO_SETTINGS_MODULE` value (had leading space causing import error)
- Added missing `requests` transitive dependency
- Backend live at `https://kuhu-apparels-production.up.railway.app/`

**Architecture / Learning**
- Dockerfile: `FROM`, `WORKDIR`, `COPY`, `RUN`, `CMD` basics
- Railway: Dockerfile builder vs Nixpacks, `$PORT` env var, `railway.json`
- Gunicorn: WSGI server, `--bind`, `--workers`, `--timeout`
- Django production: `SECRET_KEY`, `ALLOWED_HOSTS`, `DATABASE_URL` as env vars
- Migrate hangs in startCommand → run separately via `railway run`

### 🎯 Current Focus

**Feature:** Railway Deployment — Partial (backend live, frontend pending)

**Definition of Done progress:**
- [x] Dockerfile created with production dependencies
- [x] Production settings with whitenoise, dj-database-url, SSL
- [x] Backend accessible at Railway URL (200 OK)
- [ ] Frontend deployed to Vercel
- [ ] CORS configured for production frontend URL
- [ ] Migrations applied on Railway PostgreSQL

### 📌 End of Day

- **Biggest achievement:** First successful Railway deployment — backend is live and responding
- **Overall project completion:** ~42% toward MVP
- **Current feature:** Railway Deployment
- **Tomorrow:** Run migrations on Railway, deploy frontend to Vercel, start Checkout + Payments

---

<a name="2026-08-10"></a>
## 2026-08-10

### ✅ Completed Today

**Backend**
- `ProductVariant` model (color, size, stock, price override) with migrations; slug constraints for product/variant images
- Orders app — `Order` + `OrderItem` models, `POST /api/orders/` creates order from cart with stock validation + decrement inside `transaction.atomic`, `GET /api/orders/:id/` for ownership-scoped order detail
- Cart refactored to variant-based items (variant FK, stock checked at variant level)
- Production settings finalized: `x-session-id` in CORS headers, DRF JSON-only renderer (fixes browser 500)

**Frontend**
- Phase 2 Homepage — `HeroBanner`, `PopularThemes`, "All Products" sections; homepage clean-up, theme filtering
- Phase 3 Listing — `FilterSidebar`, `SortSelect`, `MobileFilterDrawer`, `ActiveFilterPills`; filter/sort/search compose together
- Phase 4 Checkout — `Checkout` page (order summary, place order), `OrderConfirmation` page, `useOrder`/`useCreateOrder` hooks, `order.service`, `/orders/:id/confirmation` route
- Product detail color/size selection with variant-aware `AddToCartButton`; `ProductCard` without CTA on listing, nav/products routing fixes
- `vercel.json` — SPA rewrites + `X-Frame-Options`, `X-Content-Type-Options`, `Referrer-Policy` headers; TS build errors fixed

**Architecture / Learning**
- Variant-aware cart and orders — `CartItem.variant` and `OrderItem.variant` FK, variant price fallback to product price
- `transaction.atomic` with per-variant stock decrement during order creation
- Vercel SPA rewrites for React Router client-side routing

**Testing**
- 52 frontend tests passing (14 files) — added HeroBanner, PopularThemes, FilterSidebar, ActiveFilterPills, SortSelect
- 47 backend tests passing (accounts, products, cart) — cart tests extended for variant support

**Documentation**
- None this session

### 🎯 Current Focus

**Feature:** Product Variants + Homepage + Listing Filters + Checkout — ✅ Complete end-to-end (browse → filter → select variant → cart → order → confirmation)

**Definition of Done progress:**
- [x] ProductVariant model + migrations
- [x] Detail page color/size selection
- [x] Cart variant support (add/update/remove)
- [x] Orders backend creates order from cart, decrements stock
- [x] Checkout page with order summary + place order
- [x] Order confirmation page with order items + status
- [x] Homepage HeroBanner / PopularThemes / All Products
- [x] Listing filters, sort, mobile filter drawer
- [x] Vercel SPA config with security headers
- [x] Tests: 52 frontend + 47 backend passing
- [ ] Razorpay payment integration
- [ ] Order confirmation emails

### 📌 End of Day

- **Biggest achievement:** Full purchase flow works end-to-end — user can browse, filter, pick a variant (color/size), add to cart, place an order, and see confirmation with stock decremented
- **Overall project completion:** ~62% toward MVP
- **Sprint completion:** Sprint 2 (Cart & Orders) fully complete; Phase 2-4 delivered
- **Current feature:** Checkout complete → **Payments (Razorpay)** next
- **Remaining blocker:** Payments not started (0%), order email pending, frontend not yet deployed to Vercel
- **Tomorrow:** Razorpay integration, Vercel frontend deploy, smoke test full purchase

---

<a name="2026-08-10-catalog"></a>
## 2026-08-10 (Catalog + Deployment)

### ✅ Completed Today

**Catalog — Real product images**
- Replaced placeholder themes with 4 live themes: **Gods & Mythology, Premium, Alcohol, Motivation & Quotes** (each in Men + Women)
- Seeded **31 products / 232 variants** from `backend/media/new-images/` (58 real design files) — idempotent `seed_catalog` command
- `Product.is_active` flag added (migration 0011) + views filter to active products/categories; old catalog deactivated, not deleted
- Slug collision support via `DESIGN_HINTS` (e.g. `women-challenge-quotes`)
- Image folder hygiene: removed `:Zone.Identifier` files and duplicate `.jpeg.jpeg` extensions, normalized folder casing

**Cloudinary media hosting (ADR-009 implemented)**
- `cloudinary` + `django-cloudinary-storage` added; Cloudinary storage wired via `STORAGES['default']` (env-driven, `PREFIX=''`)
- `sync_cloudinary` command uploaded all **263 images** as extension-less public_ids (`products/<slug>` / `products/<sku>`); cleaned up legacy `.jpeg`-suffixed orphans
- All 263 product/variant URLs verified returning 200 from `res.cloudinary.com`
- Cloudinary-aware seeding: production `seed_catalog` now stores extension-less names matching uploaded assets

**Production deployment**
- Backend live on Railway with the new catalog (migrate + seed against production Postgres)
- Fixed prod boot failures: `DEFAULT_FILE_STORAGE`/`STORAGES` mutually-exclusive error (Django 5), missing staticfiles backend, CORS trailing-slash rejection
- `backend/media/new-images/` now tracked in git (`.gitignore` exception) so Railway can seed
- Frontend live on Vercel: root directory set to `frontend`, Vercel builds latest `master` code, `PopularThemes` rebuilt with the 4 live themes + mobile snap slider

### 🎯 Current Focus

**Feature:** Production launch for real-product catalog — ✅ Complete

**Definition of Done progress:**
- [x] 4-theme catalog seeded (31 products / 232 variants)
- [x] All images uploaded to Cloudinary and URLs verified
- [x] Backend deployed and serving new catalog from Railway
- [x] Frontend deployed to Vercel with 4-theme PopularThemes
- [x] Production `seed_catalog` works (source images shipped in git)
- [ ] Product detail image lens/magnifier zoom
- [ ] UI polish items (logo, mobile slider polish, etc.)
- [ ] Razorpay payment integration
- [ ] Order confirmation emails

### 📌 End of Day

- **Biggest achievement:** The storefront now serves a real catalog with real product images from Cloudinary in production — no more placeholder/demo data
- **Overall project completion:** ~66% toward MVP
- **Sprint completion:** Sprint 5 — production catalog + full deployment delivered
- **Current feature:** Catalog + Deployment done → **UI polish tasks** next
- **Remaining blocker:** Payments not started (0%), order email pending, image lens/magnifier + UI polish pending

---

<a name="2026-08-10-ui-polish"></a>
## 2026-08-10 (UI Polish)

### ✅ Completed Today

**Frontend**
- `ProductImageZoom` — hover lens/magnifier on product detail image + click-to-open full-view lightbox with hover magnification; focus ring, loading state
- **Breadcrumb** on ProductDetail — `Home → section → product`, section link derived from URL params; Products page reads selected section from the URL so section nav works without a reload
- **Theme carousel** — replaced the mobile-only 3D stack carousel + desktop static grid with a single unified `ThemeCarousel` that works on every breakpoint: infinite looping (3 cycles), horizontal drag + keyboard (←/→) navigation, snap scrolling, `prefers-reduced-motion` support, focus management (only the active slide is focusable/tabbable), and "Explore the … collection →" active-slide hint
- **10 polish items**: product card hover (tilt/scale + shadow), header logo, hero/slider polish, PDP layout tightening, Add to Cart / Load More / hero button states, global focus-visible rings, Cart page row polish, Home page cleanup
- Barrel exports updated: `ThemeStackCarousel` → `ThemeCarousel`; `PopularThemes` consumes the unified carousel

**Testing**
- 57 frontend tests passing (15 files, +5 vs last report) — rewrote `PopularThemes` tests for the looping carousel (3 render cycles, single accessible front slide, arrow-key navigation to next slide) and added `ProductImageZoom` tests; `tsc -b` clean

### 🎯 Current Focus

**Feature:** Storefront UI Polish — ✅ Complete (closes remaining DoD items from the Catalog feature)

**Definition of Done progress:**
- [x] Product detail image lens/magnifier zoom + lightbox
- [x] UI polish items (logo, carousel/slider, card hover, PDP layout, states, focus rings)
- [x] Breadcrumb + section navigation without page reload
- [x] Unified theme carousel across all breakpoints
- [x] Tests updated and passing (57 frontend)
- [ ] Razorpay payment integration
- [ ] Order confirmation emails

### 📌 End of Day

- **Biggest achievement:** Browsing experience is polished end-to-end — lens/lightbox image viewing, breadcrumbs, section nav, and one smooth infinite theme carousel on mobile and desktop alike
- **Overall project completion:** ~70% toward MVP
- **Current feature:** UI polish done → **Payments (Razorpay) + order emails** next
- **Remaining blocker:** Payments not started (0%), order confirmation emails pending
- **Tomorrow:** Razorpay integration (backend + frontend), order confirmation email, smoke test full purchase flow

---

<a name="2026-08-11-storefront-ux-fixes"></a>
## 2026-08-11 (Storefront UX Fixes)

### ✅ Completed Today

**Frontend**
- **₹ pricing util** — new `src/utils/format.ts` `formatPrice()`; replaced hardcoded `$`/`₹` across `Cart`, `Checkout`, `OrderConfirmation`, `ProductDetail`, `ActiveFilterPills` (₹-aware, India-first pricing)
- **Modular snap carousel hook** — new `src/hooks/useSnapCarousel.ts`; `ThemeCarousel` + `HeroBanner` refactored onto it (previously duplicated stack-carousel logic)
- **Editorial hero** — `HeroBanner` rewritten as a 3-slide editorial carousel with active-slide heading + CTA and new tests; desktop re-sized to a compact landscape `16/10`–`16/9` strip so it no longer dominates the viewport
- **Logout option** — `LogOut` button in the desktop header (when signed in) and a full "Log out" action in the mobile slide-over menu; calls `useAuthStore.logout()` and routes home
- **Deduplicated theme filters** — `Products` now de-dupes categories by name (same `Set` pattern as `MobileCategoryNav`) so each theme shows exactly one checkbox in both the desktop sidebar and mobile filter drawer
- **Mobile-first footer** — brand spans full width, Customer Care + Connect sit side-by-side, larger tap targets, full-width back-to-top button on mobile

**Performance / Bugs**
- **Theme carousel flicker (fast rotation)** — reset rewind now loops (`while raw >= count*resetThreshold`), slides wrapped in `React.memo` with stable refs, "Explore…" hint always reserves space (no layout shift), all images `loading="eager"`, and imperative style writes coalesced into a single `requestAnimationFrame` per frame
- **Scroll-to-top on navigation** — `RootLayout` scrolls to `(0,0)` whenever the pathname changes, so Products/Cart/etc. don't restore the previous page's scroll position

**Testing**
- 74 frontend tests passing (17 files, +17 vs last report) — `HeroBanner` tests added, `PopularThemes`/`ThemeCarousel` updated for the looping carousel; `tsc -b` clean

### 🎯 Current Focus

**Feature:** Storefront polish follow-ups — ✅ Complete

**Definition of Done progress:**
- [x] ₹ pricing throughout the frontend
- [x] Modular snap-carousel hook (theme carousel + hero)
- [x] Desktop hero sized appropriately
- [x] Logout from header + mobile menu
- [x] One filter per category
- [x] Carousel flicker eliminated under fast rotation
- [x] Scroll to top on route change
- [x] Tests updated and passing (74 frontend)
- [ ] Razorpay payment integration
- [ ] Order confirmation emails

### 📌 End of Day

- **Biggest achievement:** Storefront UX issues closed — a user can now sign out, filter each theme once, browse without carousel flicker, and land at the top of every new page with India-correct pricing throughout
- **Overall project completion:** ~72% toward MVP
- **Current feature:** Polish follow-ups done → **Payments (Razorpay) + order emails** next
- **Remaining blocker:** Payments not started (0%), order confirmation emails pending
- **Tomorrow:** Razorpay integration (backend + frontend), order confirmation email, smoke test full purchase flow

---
