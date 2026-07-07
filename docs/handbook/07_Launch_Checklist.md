# Launch Checklist

> **Version:** 1.0  
> **Last Updated:** 5 July 2026  
> **Target MVP Launch:** 10 August 2026  
> **Status:** Draft — Mark items complete as we progress

---

## Purpose

This document is the final verification checklist before the KuHu Apparels MVP launch. Every item must be verified and marked complete before going live. This checklist covers deployment, functionality, security, payments, emails, analytics, and testing.

---

## How to Use This Checklist

- Each item has a checkbox and a status column.
- Mark items as ✅ Complete, ⏳ In Progress, ❌ Not Started, or N/A.
- Add notes or references for verification.
- The final sign-off requires ALL items to be ✅ Complete.

---

## 1. Pre-Launch (Complete 1 Week Before)

### 1.1 Domain & DNS

| # | Item | Status | Notes |
|---|---|---|---|
| 1.1.1 | Custom domain purchased (e.g., `kuhuapparels.com`) | ❌ | Budget ~₹800/year |
| 1.1.2 | Domain pointed to Vercel (nameservers or CNAME) | ❌ | |
| 1.1.3 | Domain pointed to Railway (CNAME or A record) | ❌ | Or use Railway subdomain for MVP |
| 1.1.4 | SSL certificate valid for all domains | ❌ | Vercel + Railway provide auto-SSL |
| 1.1.5 | `www` subdomain configured | ❌ | Redirect to root or serve both |

### 1.2 Environment Variables

| # | Item | Status | Notes |
|---|---|---|---|
| 1.2.1 | Railway: All backend env vars set | ❌ | See [Deployment Guide](./06_Deployment_Guide.md#environment-variables-on-railway) |
| 1.2.2 | Vercel: All frontend env vars set | ❌ | See [Deployment Guide](./06_Deployment_Guide.md#environment-variables-on-vercel) |
| 1.2.3 | `DJANGO_DEBUG=False` verified | ❌ | |
| 1.2.4 | `DJANGO_SECRET_KEY` is strong & unique | ❌ | Not the default or a dev key |
| 1.2.5 | `ALLOWED_HOSTS` includes production domains | ❌ | |
| 1.2.6 | `CORS_ALLOWED_ORIGINS` set to production frontend | ❌ | |
| 1.2.7 | `DATABASE_URL` points to Neon production database | ❌ | Verify read/write access |
| 1.2.8 | Cloudinary credentials are **live** (not test) | ❌ | |
| 1.2.9 | Razorpay keys are **live** (not test) | ❌ | |
| 1.2.10 | Resend API key is valid and domain verified | ❌ | DKIM propagation may take 48h |

### 1.3 Database

| # | Item | Status | Notes |
|---|---|---|---|
| 1.3.1 | Production database created on Neon | ❌ | |
| 1.3.2 | Migrations applied to production DB | ❌ | `python manage.py migrate` on Railway |
| 1.3.3 | Superuser created for admin access | ❌ | `python manage.py createsuperuser` |
| 1.3.4 | Products loaded into production DB | ❌ | Via admin or data migration |
| 1.3.5 | Database backup configured | ❌ | Neon automatic backups + manual weekly |

### 1.4 Backend Deployment

| # | Item | Status | Notes |
|---|---|---|---|
| 1.4.1 | Railway project created and connected to GitHub | ❌ | |
| 1.4.2 | Auto-deploy from `main` branch working | ❌ | Or manual deploy via Railway CLI |
| 1.4.3 | Build succeeds without errors | ❌ | Check Railway deployment logs |
| 1.4.4 | Static files collected | ❌ | `python manage.py collectstatic` |
| 1.4.5 | Health check endpoint responds 200 | ❌ | `GET /` or `GET /api/health/` |
| 1.4.6 | Gunicorn worker count appropriate | ❌ | 2-4 workers for MVP scale |
| 1.4.7 | Django admin accessible | ❌ | `https://{domain}/admin/` |
| 1.4.8 | Logging configured and accessible | ❌ | Railway logs + optional Sentry |

### 1.5 Frontend Deployment

| # | Item | Status | Notes |
|---|---|---|---|
| 1.5.1 | Vercel project created and connected to GitHub | ❌ | |
| 1.5.2 | Build succeeds without errors | ❌ | Check Vercel build logs |
| 1.5.3 | Preview deployment works | ❌ | Vercel provides preview URLs |
| 1.5.4 | Production deployment promoted | ❌ | |
| 1.5.5 | SPA fallback configured (all routes → `index.html`) | ❌ | Via `vercel.json` rewrites |
| 1.5.6 | Custom domain resolving to Vercel | ❌ | |
| 1.5.7 | Security headers configured | ❌ | Via `vercel.json` headers |

---

## 2. Core Functionality Verification

### 2.1 User Authentication (Google OAuth)

| # | Item | Status | Notes |
|---|---|---|---|
| 2.1.1 | Google Sign-In button renders on login page | ❌ | |
| 2.1.2 | Google one-tap auto sign-in works (if enabled) | ❌ | |
| 2.1.3 | Google ID token is received after sign-in | ❌ | |
| 2.1.4 | `POST /api/auth/google/` exchanges token for JWT | ❌ | |
| 2.1.5 | Server verifies Google ID token signature | ❌ | |
| 2.1.6 | New user is created on first-time Google sign-in | ❌ | |
| 2.1.7 | Existing user logs in on subsequent Google sign-ins | ❌ | |
| 2.1.8 | User profile populated with Google data (name, email, avatar) | ❌ | |
| 2.1.9 | Access token returned (15 min expiry) | ❌ | |
| 2.1.10 | Refresh token returned (7 day expiry) | ❌ | |
| 2.1.11 | Token refresh works (`POST /api/auth/token/refresh/`) | ❌ | |
| 2.1.12 | Profile retrieval works (`GET /api/auth/me/`) | ❌ | |
| 2.1.13 | Profile update works (`PATCH /api/auth/me/`) | ❌ | |
| 2.1.14 | Logout invalidates refresh token | ❌ | |
| 2.1.15 | Users without Google accounts see appropriate message | ❌ | |

### 2.2 Product Catalog

| # | Item | Status | Notes |
|---|---|---|---|
| 2.2.1 | Product listing loads (paginated) | ❌ | |
| 2.2.2 | Category filter works | ❌ | |
| 2.2.3 | Size filter works | ❌ | |
| 2.2.4 | Price range filter works | ❌ | |
| 2.2.5 | Search by name/description works | ❌ | |
| 2.2.6 | Sorting works (price, newest, name) | ❌ | |
| 2.2.7 | Product detail page loads correctly | ❌ | |
| 2.2.8 | Product images load from Cloudinary | ❌ | |
| 2.2.9 | Image gallery thumbnails switch main image | ❌ | |
| 2.2.10 | Size selector shows available/unavailable sizes | ❌ | |
| 2.2.11 | Product description renders correctly | ❌ | |
| 2.2.12 | Related products display at bottom of PDP | ❌ | |

### 2.3 Cart

| # | Item | Status | Notes |
|---|---|---|---|
| 2.3.1 | Add to cart works (logged in) | ❌ | |
| 2.3.2 | Add to cart works (guest, with session) | ❌ | |
| 2.3.3 | Cart page shows all items | ❌ | |
| 2.3.4 | Quantity increment works | ❌ | |
| 2.3.5 | Quantity decrement works (min 1) | ❌ | |
| 2.3.6 | Remove item works | ❌ | |
| 2.3.7 | Cart total updates correctly | ❌ | |
| 2.3.8 | Guest cart merges on login | ❌ | |
| 2.3.9 | Empty cart state displays correctly | ❌ | |
| 2.3.10 | Cart badge in header updates with item count | ❌ | |

### 2.4 Checkout & Orders

| # | Item | Status | Notes |
|---|---|---|---|
| 2.4.1 | Checkout page loads with cart summary | ❌ | |
| 2.4.2 | Shipping address form validation works | ❌ | |
| 2.4.3 | Pincode → city/state auto-fill works (if implemented) | ❌ | |
| 2.4.4 | Order summary shows correct totals | ❌ | |
| 2.4.5 | Create order from cart works | ❌ | |
| 2.4.6 | Stock decrements on order creation | ❌ | |
| 2.4.7 | Insufficient stock returns appropriate error | ❌ | |
| 2.4.8 | Order detail page shows order info | ❌ | |
| 2.4.9 | Order history page shows all user orders | ❌ | |
| 2.4.10 | Order cancellation works | ❌ | |
| 2.4.11 | Cancelled order restores stock | ❌ | |

### 2.5 Payments

| # | Item | Status | Notes |
|---|---|---|---|
| 2.5.1 | Razorpay checkout modal opens | ❌ | |
| 2.5.2 | Razorpay order created server-side | ❌ | |
| 2.5.3 | Card payment succeeds (test card) | ❌ | |
| 2.5.4 | UPI payment succeeds (test UPI) | ❌ | |
| 2.5.5 | Payment failure handled gracefully | ❌ | |
| 2.5.6 | Webhook receives payment.captured event | ❌ | |
| 2.5.7 | Order status updates to "Paid" after webhook | ❌ | |
| 2.5.8 | Payment.failed webhook updates order status | ❌ | |
| 2.5.9 | User redirected to order confirmation on success | ❌ | |
| 2.5.10 | Retry payment flow works for failed payments | ❌ | |

### 2.6 Email Notifications

| # | Item | Status | Notes |
|---|---|---|---|
| 2.6.1 | Order confirmation email sent | ❌ | |
| 2.6.2 | Payment receipt email sent | ❌ | |
| 2.6.3 | Email contains order details | ❌ | |
| 2.6.4 | Email renders correctly (mobile + desktop) | ❌ | |
| 2.6.5 | Welcome email sent on registration | ❌ | Post-MVP optional |
| 2.6.6 | Order cancellation confirmation email | ❌ | Optional for MVP |

### 2.7 Product Customizer

| # | Item | Status | Notes |
|---|---|---|---|
| 2.7.1 | Customizer page loads with product template | ❌ | |
| 2.7.2 | Canvas renders product correctly | ❌ | |
| 2.7.3 | Logo upload works (PNG, SVG, JPG) | ❌ | |
| 2.7.4 | Logo appears on canvas at correct position | ❌ | |
| 2.7.5 | Shirt color change updates canvas | ❌ | |
| 2.7.6 | Logo color change works | ❌ | |
| 2.7.7 | Move logo on canvas works | ❌ | |
| 2.7.8 | Resize logo works (aspect ratio maintained) | ❌ | |
| 2.7.9 | Rotate logo works | ❌ | |
| 2.7.10 | Save design sends JSON to backend | ❌ | |
| 2.7.11 | Saved design can be loaded back into canvas | ❌ | |
| 2.7.12 | Reset clears all customizations | ❌ | |
| 2.7.13 | Customized product can be added to cart | ❌ | |

---

## 3. Security Checklist

| # | Item | Status | Notes |
|---|---|---|---|
| 3.1 | `DEBUG=False` in production | ❌ | |
| 3.2 | `SECRET_KEY` is strong and unique | ❌ | |
| 3.3 | CORS configured to allow only frontend domain | ❌ | |
| 3.4 | CSRF protection enabled | ❌ | |
| 3.5 | XSS protection enabled | ❌ | Django defaults |
| 3.6 | SQL injection protection | ❌ | Django ORM handles this |
| 3.7 | Rate limiting on auth endpoints | ❌ | |
| 3.8 | Password minimum length enforced (8 chars) | ❌ | |
| 3.9 | HTTPS enforced (no HTTP) | ❌ | Vercel + Railway enforce this |
| 3.10 | Security headers set (HSTS, X-Frame-Options, etc.) | ❌ | |
| 3.11 | JWT access token expiry ≤ 15 minutes | ❌ | |
| 3.12 | JWT refresh token expiry ≤ 7 days | ❌ | |
| 3.13 | Sensitive data (passwords, tokens) never logged | ❌ | |
| 3.14 | Environment variables not exposed to client | ❌ | Vite only exposes `VITE_*` vars |
| 3.15 | Razorpay webhook signature verified | ❌ | |
| 3.16 | Admin panel accessible only to staff users | ❌ | |
| 3.17 | User can only access own orders/profile | ❌ | Object-level permissions |
| 3.18 | Safe file upload handling | ❌ | Validate type, size, scan |
| 3.19 | `.env` file not in version control | ❌ | Verify `.gitignore` |

---

## 4. Performance Checklist

| # | Item | Status | Notes |
|---|---|---|---|
| 4.1 | Lighthouse Performance score ≥ 80 | ❌ | Mobile + Desktop |
| 4.2 | First Contentful Paint (FCP) < 1.5s | ❌ | |
| 4.3 | Largest Contentful Paint (LCP) < 2.5s | ❌ | |
| 4.4 | First Input Delay (FID) < 100ms | ❌ | |
| 4.5 | Cumulative Layout Shift (CLS) < 0.1 | ❌ | |
| 4.6 | Images lazy-loaded (below the fold) | ❌ | |
| 4.7 | Images use WebP format | ❌ | Via Cloudinary |
| 4.8 | Fonts loaded with `font-display: swap` | ❌ | |
| 4.9 | JS bundle size < 200KB (initial) | ❌ | Check with Vite bundle analysis |
| 4.10 | API response time < 200ms (p95) | ❌ | |
| 4.11 | Database queries optimized (N+1 prevention) | ❌ | |
| 4.12 | Pagination implemented on all list endpoints | ❌ | |

---

## 5. Responsive & Cross-Browser Testing

### Device Testing

| # | Device | Width | Status | Notes |
|---|---|---|---|---|
| 5.1 | iPhone SE | 375px | ❌ | |
| 5.2 | iPhone 14 Pro | 390px | ❌ | |
| 5.3 | Samsung Galaxy S24 | 412px | ❌ | |
| 5.4 | iPad Mini | 768px | ❌ | |
| 5.5 | iPad Pro | 1024px | ❌ | |
| 5.6 | MacBook 13" | 1280px | ❌ | |
| 5.7 | Desktop 27" | 1920px | ❌ | |

### Browser Testing

| # | Browser | Status | Notes |
|---|---|---|---|
| 5.8 | Chrome (latest) | ❌ | |
| 5.9 | Firefox (latest) | ❌ | |
| 5.10 | Safari (latest) | ❌ | |
| 5.11 | Edge (latest) | ❌ | |
| 5.12 | Chrome for Android | ❌ | |
| 5.13 | Safari for iOS | ❌ | |

### Page-by-Page Responsive Check

| # | Page | Mobile | Tablet | Desktop | Notes |
|---|---|---|---|---|---|
| 5.14 | Homepage | ❌ | ❌ | ❌ | |
| 5.15 | PLP | ❌ | ❌ | ❌ | |
| 5.16 | PDP | ❌ | ❌ | ❌ | |
| 5.17 | Cart | ❌ | ❌ | ❌ | |
| 5.18 | Checkout | ❌ | ❌ | ❌ | |
| 5.19 | Order Confirmation | ❌ | ❌ | ❌ | |
| 5.20 | Customizer | ❌ | ❌ | ❌ | |
| 5.21 | Login | ❌ | ❌ | ❌ | |
| 5.22 | Register | ❌ | ❌ | ❌ | |
| 5.23 | Profile | ❌ | ❌ | ❌ | |
| 5.24 | Order History | ❌ | ❌ | ❌ | |
| 5.25 | 404 Page | ❌ | ❌ | ❌ | |

---

## 6. Content & Data Checklist

| # | Item | Status | Notes |
|---|---|---|---|
| 6.1 | 20-30 products loaded across 2-3 categories | ❌ | |
| 6.2 | All products have high-quality images (front + back) | ❌ | |
| 6.3 | Product descriptions are complete and accurate | ❌ | |
| 6.4 | Category names and slugs configured | ❌ | |
| 6.5 | Sizes and pricing verified | ❌ | |
| 6.6 | SEO: Meta titles set for all pages | ❌ | |
| 6.7 | SEO: Meta descriptions set for all pages | ❌ | |
| 6.8 | SEO: Open Graph tags configured | ❌ | |
| 6.9 | SEO: Sitemap.xml generated | ❌ | |
| 6.10 | SEO: Robots.txt configured | ❌ | |
| 6.11 | Legal: Privacy Policy page | ❌ | |
| 6.12 | Legal: Terms of Service page | ❌ | |
| 6.13 | Legal: Return/Refund Policy page | ❌ | |
| 6.14 | Legal: Shipping Policy page | ❌ | |
| 6.15 | Homepage hero banner image finalized | ❌ | |
| 6.16 | Homepage featured categories set | ❌ | |
| 6.17 | Brand favicon created and linked | ❌ | |
| 6.18 | PWA manifest.json configured (basic) | ❌ | |
| 6.19 | Apple touch icon configured | ❌ | |

---

## 7. Monitoring & Analytics

| # | Item | Status | Notes |
|---|---|---|---|
| 7.1 | GA4 property created | ❌ | |
| 7.2 | GA4 measurement ID in frontend env | ❌ | |
| 7.3 | GA4 events firing correctly (page_view, purchase) | ❌ | Test with GA4 DebugView |
| 7.4 | E-commerce events configured (view_item, add_to_cart, purchase) | ❌ | |
| 7.5 | Error tracking set up (Sentry or basic logging) | ❌ | |
| 7.6 | Uptime monitoring configured | ❌ | |
| 7.7 | Database backup verified | ❌ | |
| 7.8 | Railway logs accessible | ❌ | |
| 7.9 | Vercel analytics enabled | ❌ | Free with Vercel |

---

## 8. Smoke Test — Full Purchase Flow

Execute this complete flow in production environment:

| Step | Action | Expected Result | Status |
|---|---|---|---|
| 8.1 | Visit homepage | Page loads, hero visible | ❌ |
| 8.2 | Click "Men" category | PLP loads with men's products | ❌ |
| 8.3 | Filter by "T-Shirts" + size "L" | Filtered results shown | ❌ |
| 8.4 | Click a product | PDP loads with images & info | ❌ |
| 8.5 | Select size "L" | Size selected, highlighted | ❌ |
| 8.6 | Click "Customize" | Customizer opens with product | ❌ |
| 8.7 | Upload logo, change color, resize | Logo appears, color changes | ❌ |
| 8.8 | Click "Save Design" | Design saved, confirmation shown | ❌ |
| 8.9 | Click "Add to Cart" | Item added, badge updates | ❌ |
| 8.10 | Add another product without customization | Second item in cart | ❌ |
| 8.11 | Open cart page | Both items listed with correct prices | ❌ |
| 8.12 | Update quantity | Total updates | ❌ |
| 8.13 | Click "Proceed to Checkout" | Checkout page loads | ❌ |
| 8.14 | Fill shipping address | Form validates | ❌ |
| 8.15 | Click "Pay" | Razorpay modal opens | ❌ |
| 8.16 | Complete payment (test card) | Payment succeeds | ❌ |
| 8.17 | Redirect to order confirmation | Order details shown | ❌ |
| 8.18 | Check email | Order confirmation received | ❌ |
| 8.19 | Check GA4 real-time | Purchase event recorded | ❌ |
| 8.20 | Visit homepage as new user | Fresh state, no auth | ❌ |

---

## 9. Final Sign-Off

| # | Item | Signed Off By | Date |
|---|---|---|---|
| 9.1 | All deployment items complete | | |
| 9.2 | All functionality items complete | | |
| 9.3 | All security items complete | | |
| 9.4 | All performance items meet thresholds | | |
| 9.5 | All responsive/browser tests pass | | |
| 9.6 | All content items complete | | |
| 9.7 | All monitoring items configured | | |
| 9.8 | Smoke test passes completely | | |
| 9.9 | 🚀 **MVP LAUNCHED** | | 10 August 2026 |

---

## 10. Post-Launch (First 48 Hours)

| # | Item | Status | Notes |
|---|---|---|---|
| 10.1 | Monitor Railway logs for errors | ❌ | Check every 2 hours |
| 10.2 | Monitor Vercel deployment for issues | ❌ | |
| 10.3 | Monitor GA4 for real-time traffic | ❌ | |
| 10.4 | Verify Razorpay webhooks are being received | ❌ | |
| 10.5 | Verify emails are being sent | ❌ | |
| 10.6 | Check all payment transactions in Razorpay dashboard | ❌ | |
| 10.7 | Test checkout flow one more time in production | ❌ | |
| 10.8 | Verify database backup ran successfully | ❌ | |
| 10.9 | Check Lighthouse scores on live site | ❌ | |
| 10.10 | Review and fix any P0/P1 bugs | ❌ | |

---

## 11. Rollback Triggers

If any of these conditions are met, rollback immediately:

| Condition | Action |
|---|---|
| Users cannot complete checkout | Rollback to previous backend deployment |
| Payment processing consistently fails | Rollback to previous backend + verify Razorpay config |
| Users cannot access the site | Rollback frontend + backend |
| Database corruption detected | Restore from backup |
| Security vulnerability discovered | Rollback or hotfix depending on severity |
| Emails not being sent for orders | Manual order confirmation until fix deployed |

---

## 12. References

- [Deployment Guide](./06_Deployment_Guide.md) — Infrastructure setup & configuration
- [Architecture Decisions](./03_Architecture_Decisions.md) — Technical decisions
- [Project Context](../PROJECT_CONTEXT.md) — Constraints & goals
- [Project Vision](./01_Project_Vision.md) — Scope & success criteria

---

*This checklist should be completed in full before the MVP launch. Last updated: 5 July 2026.*
