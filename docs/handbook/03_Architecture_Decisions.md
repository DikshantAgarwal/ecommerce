# Architecture Decision Records

> **Version:** 1.0  
> **Last Updated:** 5 July 2026  
> **Status:** Active

---

## Purpose

This document captures lightweight Architecture Decision Records (ADRs) for all major technical decisions in the KuHu Apparels project. Each ADR follows a consistent template: Decision, Reason, Alternatives, Tradeoffs, Future Migration Strategy.

---

## ADR Index

| # | Decision | Status | Date |
|---|---|---|---|
| 001 | Django + DRF for Backend | ✅ Accepted | 2026-07-05 |
| 002 | PostgreSQL via Neon | ✅ Accepted | 2026-07-05 |
| 003 | Monorepo Structure | ✅ Accepted | 2026-07-05 |
| 004 | JWT Authentication (SimpleJWT) | ✅ Accepted | 2026-07-05 |
| 005 | Tailwind CSS for Styling | ✅ Accepted | 2026-07-05 |
| 006 | React Router for Routing | ✅ Accepted | 2026-07-05 |
| 007 | TanStack Query for Data Fetching | ✅ Accepted | 2026-07-05 |
| 008 | Zustand for State Management | ✅ Accepted | 2026-07-05 |
| 009 | Cloudinary for Image Hosting | ✅ Accepted | 2026-07-05 |
| 010 | Razorpay for Payments | ✅ Accepted | 2026-07-05 |
| 011 | Resend for Emails | ✅ Accepted | 2026-07-05 |
| 012 | Fabric.js for Product Customizer | ✅ Accepted | 2026-07-05 |
| 013 | Vercel + Railway for Deployment | ✅ Accepted | 2026-07-05 |
| 014 | UUID Primary Keys (Backend) | ✅ Accepted | 2026-07-05 |
| 015 | Split Settings (base/local/production) | ✅ Accepted | 2026-07-05 |
| 016 | Google Analytics 4 | ✅ Accepted | 2026-07-05 |
| 017 | Mobile-First Responsive Design | ✅ Accepted | 2026-07-05 |
| 018 | DecimalField for Monetary Values | ✅ Accepted | 2026-07-05 |
| 019 | No Celery/Redis at MVP | ✅ Accepted | 2026-07-05 |
| 020 | Django Admin for Backend Admin Panel | ✅ Accepted | 2026-07-05 |
| 021 | Google OAuth (Social-Only Login) | ✅ Accepted | 2026-07-05 |
| 022 | django-allauth for Social Auth | ✅ Accepted | 2026-07-05 |

---

## ADR Templates

### ADR-001: Django + DRF for Backend

| Field | Value |
|---|---|
| **Decision** | Use Django with Django REST Framework as the backend framework |
| **Status** | ✅ Accepted |
| **Date** | 2026-07-05 |

**Reason:**
- Batteries-included framework: ORM, admin panel, authentication, security protections out of the box.
- DRF provides serializers, viewsets, routers, authentication classes, pagination, filtering — all needed for a REST API.
- Extensive documentation and community support.
- Developer is learning backend — Django's "batteries included" approach reduces decisions.
- PostgreSQL support is first-class.

**Alternatives Considered:**
- **Node.js + Express:** Familiar (JS), but lacks ORM, admin panel, and built-in security. Would require assembling many libraries.
- **FastAPI:** Modern Python, async-first, good performance. Smaller ecosystem, fewer learning resources, auto-schema is good but admin panel is missing.
- **Ruby on Rails:** Great for rapid development, but developer doesn't know Ruby. Learning Ruby + Rails = double learning curve.
- **Laravel:** PHP-based, not aligned with developer's Python interest.

**Tradeoffs:**
- Python can be slower than Node.js for I/O-bound operations. Mitigation: Use database-level optimizations, add caching post-MVP.
- Django's ORM can generate inefficient queries if not careful. Mitigation: Use `select_related`/`prefetch_related`, monitor with `django-debug-toolbar`.
- Monolithic by default. Mitigation: Structure as separate Django apps within the project.

**Future Migration Strategy:**
- If performance becomes a bottleneck, specific endpoints can be extracted to FastAPI while keeping Django for admin and ORM-heavy operations.
- Realistically, Django + PostgreSQL will handle significant scale. Migration is unlikely for this project's needs.

---

### ADR-002: PostgreSQL via Neon

| Field | Value |
|---|---|
| **Decision** | Use PostgreSQL hosted on Neon (serverless PostgreSQL) |
| **Status** | ✅ Accepted |
| **Date** | 2026-07-05 |

**Reason:**
- PostgreSQL is production-grade: proper Decimal type, UUID support, full-text search, JSON fields, concurrent write handling.
- Neon offers a generous free tier (500MB storage, branch-based databases).
- Serverless: scales to zero when not in use, no server management.
- Branching for development environments.

**Alternatives Considered:**
- **SQLite:** Great for development, but lacks concurrent write support, Decimal type, and production readiness.
- **Supabase:** PostgreSQL + hosted, excellent free tier. More overhead (auth, realtime features we don't need).
- **AWS RDS:** Overkill for MVP. Higher cost, more management overhead.
- **Railway PostgreSQL:** Native but less mature serverless offering.

**Tradeoffs:**
- Serverless cold starts can cause first-query latency. Mitigation: Connection pooling via PgBouncer (Neon provides this).
- Less control over database configuration compared to self-hosted.
- Vendor lock-in risk (PostgreSQL is standard, but serverless features differ per provider).

**Future Migration Strategy:**
- PostgreSQL is standard SQL. Switching to any other PostgreSQL provider requires only changing the connection string.
- If self-hosting becomes necessary, standard PostgreSQL tooling applies.

---

### ADR-003: Monorepo Structure

| Field | Value |
|---|---|
| **Decision** | Keep backend and frontend in a single Git repository (monorepo) |
| **Status** | ✅ Accepted |
| **Date** | 2026-07-05 |

**Reason:**
- Single developer: no need for multiple repos.
- Atomic commits across backend and frontend for the same feature.
- Simplified CI/CD (one pipeline).
- Single `git clone` to get everything.

**Alternatives Considered:**
- **Polyrepo:** Separate repos for backend and frontend. Adds overhead for a solo developer — PRs across repos, coordinating versions.

**Tradeoffs:**
- `git log` contains both backend and frontend commits. Mitigation: Use commit conventions (e.g., `feat(backend):`, `feat(frontend):`).
- Cannot use different access controls per package. Not relevant for solo developer.

**Future Migration Strategy:**
- Split into separate repos if the team grows to multiple developers who work independently on backend and frontend. Use `git subtree` or manual split.

---

### ADR-004: JWT Authentication (SimpleJWT)

| Field | Value |
|---|---|
| **Decision** | Use `djangorestframework-simplejwt` for JWT-based authentication |
| **Status** | ✅ Accepted |
| **Date** | 2026-07-05 |

**Reason:**
- JWT is stateless — no server-side session storage needed. Works well with SPA architecture.
- SimpleJWT integrates directly with DRF, inheriting Django's User model.
- Token refresh mechanism prevents long-lived tokens.
- Well-documented, widely used in Django + React projects.

**Alternatives Considered:**
- **Session Authentication:** Stateful, requires CSRF handling, more complex with SPA. Harder to scale horizontally.
- **django-rest-knox:** Token-based, but less mainstream, smaller community.
- **Firebase Auth:** External dependency, adds complexity for a simple use case, free tier may not last.

**Tradeoffs:**
- JWT cannot be revoked server-side (until expiration). For MVP, short access token lifetimes (15 min) + refresh tokens (7 days) mitigate this.
- Token storage in browser is a security consideration. Use httpOnly cookies or secure localStorage. **Decision:** Use httpOnly cookies for production, localStorage with `X-Refresh-Token` header.
- JWT is issued after Google OAuth succeeds — the OAuth flow handles identity verification, JWT handles session management.

**Future Migration Strategy:**
- Add token blacklisting if revocation becomes necessary (SimpleJWT supports this with a database-backed blacklist).
- If manual email/password login is added post-MVP, SimpleJWT already supports it — add the login endpoint and password field.

---

### ADR-005: Tailwind CSS for Styling

| Field | Value |
|---|---|
| **Decision** | Use Tailwind CSS v4 for all styling |
| **Status** | ✅ Accepted |
| **Date** | 2026-07-05 |

**Reason:**
- Utility-first approach enables rapid UI development without switching between files.
- Consistent design system through Tailwind's design tokens (spacing, colors, typography).
- Excellent responsive design utilities (`sm:`, `md:`, `lg:`, `xl:`).
- Small production bundle (purge unused styles).
- Developer's existing expertise.

**Alternatives Considered:**
- **CSS Modules:** Scoped styles, but no built-in design system. More CSS to write manually.
- **Styled Components:** Runtime CSS-in-JS, adds bundle size, slower than utility classes.
- **MUI/Chakra UI:** Component libraries with predefined components. Harder to achieve a unique brand identity. Larger bundle size.

**Tradeoffs:**
- HTML can become verbose with many utility classes. Mitigation: Extract repeated patterns into components.
- Learning curve for developers not familiar with utility-first CSS. Not relevant here (developer is experienced).

**Future Migration Strategy:**
- Tailwind v4 is the current standard. Major version upgrades require checking for breaking changes in class names.
- Can be combined with CSS Modules for complex component-specific styles if needed.

---

### ADR-006: React Router for Routing

| Field | Value |
|---|---|
| **Decision** | Use React Router v7 for client-side routing |
| **Status** | ✅ Accepted |
| **Date** | 2026-07-05 |

**Reason:**
- Industry-standard routing library for React.
- Nested routes support layout inheritance.
- Loader/action pattern for data fetching (v6.4+).
- Excellent TypeScript support.
- Familiar to the developer.

**Alternatives Considered:**
- **TanStack Router:** Newer, type-safe routing, but smaller community and fewer resources.
- **Next.js Pages Router:** Would require switching to Next.js framework.

**Tradeoffs:**
- Client-side routing requires server configuration for SPA fallback (Vercel handles this automatically).

**Future Migration Strategy:**
- React Router v8 may introduce breaking changes. Follow migration guides. The API is relatively stable.

---

### ADR-007: TanStack Query for Data Fetching

| Field | Value |
|---|---|
| **Decision** | Use TanStack Query v5 for server state management |
| **Status** | ✅ Accepted |
| **Date** | 2026-07-05 |

**Reason:**
- Automatic caching, background refetching, and deduplication of API requests.
- Built-in loading, error, and success states — reduces boilerplate.
- Pagination and infinite query support for product listing.
- Devtools for debugging.
- Framework-agnostic but excellent React integration.

**Alternatives Considered:**
- **RTK Query:** Requires Redux toolkit, adds boilerplate for a simple app.
- **SWR:** Similar to TanStack Query, smaller ecosystem.
- **Manual `useEffect` + `fetch`:** Would need custom caching, deduplication, and error handling logic.

**Tradeoffs:**
- Adds ~12KB to the bundle. Acceptable for the features it provides.
- Caching strategy needs careful configuration (stale times, cache invalidation).

**Future Migration Strategy:**
- TanStack Query v6+ will follow similar API patterns. Migration is typically incremental.

---

### ADR-008: Zustand for State Management

| Field | Value |
|---|---|
| **Decision** | Use Zustand for client-side state management |
| **Status** | ✅ Accepted |
| **Date** | 2026-07-05 |

**Reason:**
- Minimal boilerplate compared to Redux.
- Tiny bundle size (~1KB).
- Works outside React components (useful for Axios interceptors).
- TypeScript-first API.
- Middleware support (persist, devtools, immer).

**Alternatives Considered:**
- **Redux Toolkit:** Industry standard, but heavier. Too much boilerplate for this project's state needs.
- **Context API:** Built-in, but causes unnecessary re-renders. No middleware support. Not designed for frequent updates.
- **Jotai:** Atomic state, interesting but less proven in production.

**Tradeoffs:**
- Less community resources compared to Redux. Mitigation: Zustand's API is simple enough that community resources aren't critical.
- No built-in devtools (but `devtools` middleware integrates with Redux DevTools).

**Future Migration Strategy:**
- Zustand's API is stable. Major upgrades are rare. Can be replaced if the project outgrows it.

---

### ADR-009: Cloudinary for Image Hosting

| Field | Value |
|---|---|
| **Decision** | Use Cloudinary for all image hosting, transformations, and uploads |
| **Status** | ✅ Accepted |
| **Date** | 2026-07-05 |

**Reason:**
- Free tier: 25GB storage, 25GB bandwidth/month — sufficient for MVP.
- Built-in image transformations (resize, crop, format conversion) via URL parameters.
- Upload widget for frontend direct uploads (no backend processing needed).
- CDN delivery with automatic optimization (WebP, AVIF).
- Background removal, AI-powered enhancements (future use).

**Alternatives Considered:**
- **AWS S3 + CloudFront:** More complex setup, requires backend for signed URLs. Higher cost at scale.
- **Uploadthing:** Newer, simple pricing, but less mature.
- **Self-hosted (MinIO):** Overhead of managing infrastructure.

**Tradeoffs:**
- Vendor lock-in — migration requires re-writing upload URLs.
- Free tier limits may be reached as the catalog grows. Mitigation: Optimize image sizes, use transformations aggressively.

**Future Migration Strategy:**
- Cloudinary provides export tools. If migrating, generate new URLs in the new provider and update the database.

---

### ADR-010: Razorpay for Payments

| Field | Value |
|---|---|
| **Decision** | Use Razorpay as the payment gateway |
| **Status** | ✅ Accepted |
| **Date** | 2026-07-05 |

**Reason:**
- Indian payments market leader. Supports UPI, cards, net banking, wallets.
- Excellent developer experience: well-documented API, test mode, webhooks.
- No monthly fee (pay per transaction).
- Payment Link, Checkout, and API integration options.
- Easy settlement to Indian bank accounts.

**Alternatives Considered:**
- **Stripe:** Better international support but limited India features (no UPI natively). Higher transaction fees. Payouts to Indian accounts are more complex.
- **Paytm Payment Gateway:** Good Indian support but less developer-friendly API.
- **Cashfree:** Good alternative, similar features. Smaller developer community.

**Tradeoffs:**
- Razorpay handles INR only natively. International expansion will require a secondary gateway.
- Webhook delivery is at-least-once — requires idempotency handling on our end.

**Future Migration Strategy:**
- For international expansion, add Stripe as a secondary gateway. Use a payment orchestration layer to abstract gateways.

---

### ADR-011: Resend for Emails

| Field | Value |
|---|---|
| **Decision** | Use Resend for transactional email delivery |
| **Status** | ✅ Accepted |
| **Date** | 2026-07-05 |

**Reason:**
- Modern API-first email service with React Email support.
- Free tier: 100 emails/day — sufficient for MVP traffic.
- High deliverability (dedicated IP on paid plans).
- Simple DKIM/SPF setup.
- Webhook support for delivery tracking.

**Alternatives Considered:**
- **SendGrid:** Mature, but API is older. Free tier is 100 emails/day.
- **Amazon SES:** Cheapest at scale, but complex setup (domain verification, DKIM). No free tier.
- **Mailgun:** Good API, but free tier is limited.
- **SMTP (self-hosted):** Poor deliverability, complex setup, security risks.

**Tradeoffs:**
- Resend is newer than SendGrid — smaller community. Mitigation: API is well-documented, and Django integration is straightforward.
- Free tier limit may be hit during testing. Mitigation: Use environment-based toggles, send only in production.

**Future Migration Strategy:**
- Abstract email sending behind a Django interface (`django-anymail`). Switch providers by changing the backend configuration.

---

### ADR-012: Fabric.js for Product Customizer

| Field | Value |
|---|---|
| **Decision** | Use Fabric.js for the product customization canvas |
| **Status** | ✅ Accepted |
| **Date** | 2026-07-05 |

**Reason:**
- Mature library (10+ years) for canvas-based design tools.
- Built-in interaction: move, resize, rotate objects.
- SVG/JSON serialization for saving and loading designs.
- Event system for real-time preview updates.
- Works without external dependencies.

**Alternatives Considered:**
- **Canvas API (raw):** Too low-level. Would need to implement all interactions from scratch.
- **Konva.js:** Good alternative, React-friendly (react-konva), but smaller community.
- **Three.js:** 3D rendering, overkill for 2D design customization.
- **Custom SVG manipulation:** Complex state management for position, scale, rotation.

**Tradeoffs:**
- Fabric.js is not React-native. Requires refs and imperative canvas manipulation.
- Canvas rendering can be slow on low-end mobile devices. Mitigation: Limit canvas resolution on mobile, use hardware acceleration.
- Learning curve for canvas manipulation concepts.

**Future Migration Strategy:**
- Fabric.js v6+ is stable. The library is in maintenance mode but reliable. If a React-native canvas library matures (e.g., `react-canvas`), evaluate migration.

---

### ADR-013: Vercel + Railway for Deployment

| Field | Value |
|---|---|
| **Decision** | Deploy frontend on Vercel, backend on Railway |
| **Status** | ✅ Accepted |
| **Date** | 2026-07-05 |

**Reason:**

**Vercel (Frontend):**
- Best-in-class React hosting: automatic SPA fallback, CDN, preview deployments.
- Free tier: 100GB bandwidth, 6000 build minutes/month.
- Automatic HTTPS, custom domains.
- Git-integrated deployments.

**Railway (Backend):**
- Docker-native deployment, easy environment variable management.
- Free tier: $5 credit/month (sufficient for MVP).
- PostgreSQL and Redis add-ons available (we use Neon for DB).
- Deploy from GitHub — `git push` triggers redeploy.

**Alternatives Considered:**
- **Heroku:** More expensive ($5+ per month for basic dyno), free tier discontinued.
- **AWS (ECS/Beanstalk):** Too complex for a solo developer learning backend.
- **Fly.io:** Interesting but less mature than Railway.
- **Netlify (Frontend):** Good alternative to Vercel, but Vercel has better React support.

**Tradeoffs:**
- Two platforms to manage instead of one. Mitigation: Both are simple enough that management overhead is minimal.
- Railway's free tier is limited. Mitigation: Upgrade to $5/month plan if needed.
- Vendor lock-in for deployment. Mitigation: Both use standard technologies (Docker for Railway, static export for Vercel).

**Future Migration Strategy:**
- Frontend is a standard static build — can be deployed on any static host (Netlify, Cloudflare Pages, S3).
- Backend is Dockerized — can be deployed on any container platform (AWS ECS, Google Cloud Run, DigitalOcean).

---

### ADR-014: UUID Primary Keys

| Field | Value |
|---|---|
| **Decision** | Use UUIDs as primary keys for all models |
| **Status** | ✅ Accepted |
| **Date** | 2026-07-05 |

**Reason:**
- Prevents IDOR attacks (users cannot guess order IDs or user IDs).
- Globally unique — useful if we ever shard or migrate data.
- PostgreSQL has native UUID support — efficient storage and indexing.

**Alternatives Considered:**
- **Auto-increment integers:** Simpler, smaller (4 bytes vs 16 bytes), faster for joins. Security risk (sequential IDs leak information).
- **ULID:** Sortable, URL-safe, but less widespread. No native Django field.
- **NanoID:** URL-safe, short, but not natively supported by PostgreSQL or Django.

**Tradeoffs:**
- UUIDs are larger (16 bytes vs 4 bytes). Mitigation: PostgreSQL handles UUIDs efficiently.
- UUIDs are slower for index lookups. Mitigation: The difference is negligible at MVP scale.
- Harder to read/debug. Mitigation: Use short display IDs for customer-facing references.

**Future Migration Strategy:**
- Cannot change PK types without significant migration effort. Decision is permanent for this codebase.

---

### ADR-015: Split Settings (base/local/production)

| Field | Value |
|---|---|
| **Decision** | Split Django settings into `base.py`, `local.py`, `production.py` |
| **Status** | ✅ Accepted |
| **Date** | 2026-07-05 |

**Reason:**
- Environment-specific configurations are isolated.
- Secrets are not mixed with development settings.
- Follows the "Two Scoops of Django" pattern — community standard.
- Easy to add a `staging.py` or `testing.py` later.

**Alternatives Considered:**
- **Single `settings.py` with `if DEBUG:` blocks:** Leads to messy conditionals. Accidental production config exposure in development.
- **Environment variables only:** All config via env vars is 12-factor compliant but harder to document and debug locally.
- **django-configurations:** Third-party library, adds learning curve.

**Tradeoffs:**
- Three files to maintain instead of one.
- Import order matters (base first, then override).

**Future Migration Strategy:**
- This is a stable pattern. No migration needed. Can add more environment files as needed.

---

### ADR-016: Google Analytics 4

| Field | Value |
|---|---|
| **Decision** | Use Google Analytics 4 for web analytics |
| **Status** | ✅ Accepted |
| **Date** | 2026-07-05 |

**Reason:**
- Industry standard for web analytics — free.
- Understand user behavior, conversion funnels, traffic sources.
- GA4 is event-based and works well with SPAs (custom events for add-to-cart, checkout, purchase).
- Integrates with Google Ads for future marketing.

**Alternatives Considered:**
- **Plausible:** Privacy-focused, simple, but paid ($9/month).
- **Umami:** Self-hosted open-source, requires server.
- **Mixpanel:** Product analytics, overkill for MVP. Expensive at scale.
- **PostHog:** Product analytics, self-hostable, but more complex.

**Tradeoffs:**
- GA4 has a learning curve (different from Universal Analytics). Mitigation: Stick to standard e-commerce events.
- Privacy concerns (data sent to Google). Mitigation: Implement cookie consent banner post-MVP.

**Future Migration Strategy:**
- Add GA4 via Google Tag Manager for easier management. Switch to a privacy-focused tool if compliance requirements change.

---

### ADR-017: Mobile-First Responsive Design

| Field | Value |
|---|---|
| **Decision** | Design and develop all pages mobile-first |
| **Status** | ✅ Accepted |
| **Date** | 2026-07-05 |

**Reason:**
- 70%+ of e-commerce traffic comes from mobile devices.
- Mobile-first forces prioritization of essential content.
- Better performance (start with mobile styles, add complexity for larger screens).
- Google's mobile-first indexing affects SEO.

**Alternatives Considered:**
- **Desktop-first:** Easier for development (more screen real estate), but results in poor mobile experience.
- **Responsive (no priority):** Leads to inconsistent experiences across devices.

**Tradeoffs:**
- Mobile-first can feel restrictive during development on large screens. Mitigation: Use Tailwind's responsive prefixes (`sm:`, `md:`, etc.) to progressively enhance.
- Complex layouts may need complete restructuring for mobile. Mitigation: Design for mobile first in Figma/wireframes.

**Future Migration Strategy:**
- This is a design principle, not a technology. No migration needed.

---

### ADR-018: DecimalField for Monetary Values

| Field | Value |
|---|---|
| **Decision** | Use Django `DecimalField(max_digits=10, decimal_places=2)` for all monetary values |
| **Status** | ✅ Accepted |
| **Date** | 2026-07-05 |

**Reason:**
- Floating-point cannot represent 0.01 exactly — leads to rounding errors in financial calculations.
- `DecimalField` stores exact base-10 values in PostgreSQL's `NUMERIC` type.
- DRF `DecimalField` serializer handles serialization/deserialization correctly.

**Alternatives Considered:**
- **FloatField:** Smaller storage, faster computation. **Not acceptable for financial data.**
- **IntegerField (paise/cents):** Store amounts as smallest currency unit (e.g., ₹100 as 10000 paise). Requires manual conversion in all displays.
- **MoneyField (django-money):** Third-party library, adds complexity.

**Tradeoffs:**
- Decimal operations are slower than integer operations. Negligible for e-commerce volumes.
- Need to be careful with division (maintain precision). Mitigation: Use `Decimal()` from Python's `decimal` module.

**Future Migration Strategy:**
- This is a database design constraint. Changing would require a data migration. No reason to change.

---

### ADR-019: No Celery/Redis at MVP

| Field | Value |
|---|---|
| **Decision** | Defer Celery + Redis to post-MVP |
| **Status** | ✅ Accepted |
| **Date** | 2026-07-05 |

**Reason:**
- MVP traffic will be low — synchronous email sending via Resend API is fast enough.
- Adding Celery + Redis adds infrastructure complexity (Redis server, worker process, monitoring).
- Redis adds ongoing cost for hosting.
- Follows the principle: "You are optimizing for learning, not scale."

**Alternatives Considered:**
- **Celery + Redis:** Required for async tasks (emails, image processing).
- **Django Q:** Alternative task queue, simpler but smaller community.
- **Huey:** Lightweight task queue, Redis not required (can use filesystem). Interesting alternative for future.
- **Synchronous execution:** Simple, works for MVP traffic.

**Tradeoffs:**
- Synchronous email sending blocks the response. Mitigation: Resend API responds in <100ms typically. Acceptable for MVP.
- No retry mechanism for failed emails. Mitigation: Log failures and manually retry.
- Cart abandonment emails cannot be scheduled. Mitigation: Post-MVP feature.

**Future Migration Strategy:**
- When traffic warrants, add Redis + Celery. Migrate email sending to async tasks. No code change needed for business logic — only for the delivery mechanism.

---

### ADR-020: Django Admin for Backend Admin Panel

| Field | Value |
|---|---|
| **Decision** | Use Django's built-in admin panel for backend administration |
| **Status** | ✅ Accepted |
| **Date** | 2026-07-05 |

**Reason:**
- Comes free with Django — zero additional cost or setup.
- Automatically generates CRUD interfaces from models.
- Customizable via `ModelAdmin` (list display, filters, search, inlines, actions).
- Permission system integrates with Django's auth (staff users, groups, permissions).
- Sufficient for MVP needs: manage products, orders, users, categories.

**Alternatives Considered:**
- **Custom React Admin Panel:** Would need to build from scratch. Months of work.
- **React Admin (marmelab):** Good but adds backend complexity. Requires a custom data provider.
- **Django Unfold:** Modern admin theme, worth evaluating post-MVP for aesthetics.
- **wagtail CMS:** Overkill — we don't need a CMS, we need a simple admin.

**Tradeoffs:**
- Django Admin UI is functional but not beautiful. Mitigation: Add `django-admin-interface` or similar theme post-MVP.
- No mobile-responsive admin experience. Mitigation: Admin is staff-only, used from desktop.

**Future Migration Strategy:**
- If a more sophisticated admin panel is needed, add a React-based admin app that consumes the same API.
- Alternatively, enhance Django Admin with themes.

---

### ADR-021: Google OAuth (Social-Only Login)

| Field | Value |
|---|---|
| **Decision** | Use Google OAuth as the **only** authentication method for MVP. No manual email/password registration or login. |
| **Status** | ✅ Accepted |
| **Date** | 2026-07-05 |

**Reason:**
- Eliminates password management complexity (storage, hashing, reset flows, brute-force protection).
- Reduces security surface area — no password database to leak, no credential stuffing risk.
- Faster user onboarding — one click with existing Google account.
- Google Identity Services (GIS) provides a polished, trusted sign-in UX.
- Google returns verified user info (name, email, avatar) — stored in our Django User model.

**Alternatives Considered:**
- **Manual email/password auth:** Traditional approach. Higher friction (registration form, password rules, email verification). More security surface to manage. **Deferred to post-MVP.**
- **Magic link auth (passwordless):** Good UX but requires email delivery reliability. More complex to implement than OAuth.
- **OTP-based auth:** Common in India. Requires SMS gateway costs. Good for post-MVP fallback.

**Tradeoffs:**
- Users without a Google account cannot sign up. Mitigation: Add manual login post-MVP as a fallback.
- Requires Google Identity Services JavaScript library in the frontend.
- Dependency on Google's OAuth infrastructure — if Google is down, login is down (unlikely).
- Privacy-conscious users may not want to use their Google account.

**Future Migration Strategy:**
- Add manual email/password login post-MVP (new endpoint, password field on User model, password reset flow).
- Add Apple ID or other OAuth providers via the same `django-allauth` integration.

---

### ADR-022: django-allauth for Social Auth

| Field | Value |
|---|---|
| **Decision** | Use `django-allauth` for Google OAuth integration |
| **Status** | ✅ Accepted |
| **Date** | 2026-07-05 |

**Reason:**
- Most widely used Django social auth library — battle-tested, well-documented.
- Handles OAuth token exchange, user creation/linking, and session management.
- Extensible — adding more providers (Apple, Facebook) is a config change, not code.
- Works with DRF via `rest-auth` or custom views.
- Built-in email verification flows (useful post-MVP).

**Alternatives Considered:**
- **python-social-auth:** Good alternative, but `django-allauth` has larger community and better Django integration.
- **Custom OAuth implementation:** Too much work for standard OAuth flows. Risk of security bugs.
- **Firebase Authentication:** External identity provider, adds vendor lock-in. Free tier may not scale.

**Tradeoffs:**
- `django-allauth` is opinionated — uses its own URL routing and templates. Mitigation: Use DRF views to serve the API, bypass allauth's built-in views.
- Adds ~30 tables to the database (for social accounts, email addresses, etc.). Mitigation: Acceptable — these tables are well-designed and necessary.

**Future Migration Strategy:**
- `django-allauth` is stable and actively maintained. Major version upgrades require checking changelog for breaking changes.
- If moving away from Django, the social account data can be exported from allauth's tables.

---

## Decision Log

| Date | Decision | Status |
|---|---|---|
| 2026-07-05 | ADRs 001-022 documented | ✅ Accepted |

## Open Questions

- [ ] Should we add an ADR for testing framework (pytest + factory_boy)?
- [ ] Should we add an ADR for API documentation (drf-spectacular)?
- [ ] Should we add an ADR for error tracking (Sentry vs logging)?

## References

- [Project Context](../PROJECT_CONTEXT.md) — Technology stack overview
- [API Conventions](./05_API_Conventions.md) — API design standards
- [Deployment Guide](./06_Deployment_Guide.md) — Infrastructure decisions in practice
- [django-allauth Documentation](https://django-allauth.readthedocs.io/)
- [Google Identity Services Documentation](https://developers.google.com/identity/gsi/web)

---

*ADRs are never deleted — only superseded by newer ADRs. This preserves decision history.*
