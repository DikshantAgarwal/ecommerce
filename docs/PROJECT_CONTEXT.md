# Project Context

> **Last Updated:** 5 July 2026  
> **Version:** 1.0

---

## Purpose

This document captures the full context of the KuHu Apparels project — why it exists, who it's for, the constraints we operate under, and the principles guiding every decision.

## Project Overview

KuHu Apparels is a **production-grade premium apparel e-commerce platform** built by a single developer with 11 years of frontend engineering experience who is learning backend development while building this project.

| Attribute | Value |
|---|---|
| Product | Premium apparel (Men & Women) |
| Model | D2C (Direct-to-Consumer) |
| Target MVP Launch | 10 August 2026 |
| Team | 1 developer |
| Developer Experience | 11 yr Frontend — Learning Backend |
| Codebase | Monorepo (backend + frontend) |

## Core Goals

1. **Launch production MVP by 10 August 2026** — 5 weeks from today.
2. **Learn backend engineering properly** — not just copy-paste, but understand Django, DRF, PostgreSQL, and production patterns.
3. **Build using production engineering practices** — testing, documentation, CI/CD, security, monitoring.
4. **Keep infrastructure cost minimal** — choose cost-effective services that scale.
5. **Avoid overengineering** — build what's needed for MVP, not what's theoretically optimal.

## Technology Stack

### Locked Decisions

| Layer | Technology | Rationale |
|---|---|---|
| Backend Framework | Django + DRF | Batteries-included, excellent ORM, admin panel |
| Database | PostgreSQL (Neon) | Production-grade, serverless option, free tier |
| Frontend Framework | React 19 + TypeScript | Developer's existing expertise |
| Build Tool | Vite | Fast dev server, modern bundling |
| Styling | Tailwind CSS v4 | Utility-first, rapid iteration |
| Routing | React Router 7 | Standard React routing |
| Data Fetching | TanStack Query v5 | Caching, loading/error states, deduplication |
| State Management | Zustand | Lightweight, minimal boilerplate |
| HTTP Client | Axios | Interceptors, request/response transforms |
| Frontend Hosting | Vercel | Free tier, seamless React deployment |
| Backend Hosting | Railway | Docker-native, simple deploy, free tier |
| Database Hosting | Neon | Serverless PostgreSQL, free tier |
| Image Hosting | Cloudinary | CDN, transformations, upload widgets |
| Payments | Razorpay | Indian payments market, good DX |
| Analytics | Google Analytics 4 | Industry standard, free |
| Emails | Resend | Modern email API, React email support |
| Product Customizer | Fabric.js | Canvas manipulation, JSON serialization |
| Auth | Google OAuth (Social Login Only) | No manual passwords to manage, reduced security surface |
| Admin | Django Admin | Free, generated from models |

### Future Considerations

| Technology | When | Why |
|---|---|---|
| Manual Email/Password Login | Post-MVP | Fallback for users without Google accounts |
| Celery + Redis | Post-MVP | Async tasks (emails, image processing) |
| Sentry | Post-MVP | Error tracking at scale |
| Redis Caching | Post-MVP | Performance optimization |

## Business Constraints

- **Budget:** Minimal. Prefer free tiers. Spend only on essential services (domain, email, payments).
- **Time:** 5 weeks to MVP. Every week has a clear delivery goal.
- **Scope:** Premium apparel only. Initially 2-3 categories. No multi-vendor, no marketplace.
- **Geography:** India-first. Razorpay for payments, INR as primary currency.

## Development Principles

### 1. Working Software Over Perfect Architecture
Ship working features. Refactor when there's evidence the current approach is a bottleneck.

### 2. Tests Are Not Optional
Write tests alongside code. Backend tests with `pytest` + `factory_boy`. Frontend tests with `vitest` + `testing-library`.

### 3. Document Decisions
Every architecture decision is recorded as a lightweight ADR (see [Architecture Decisions](./handbook/03_Architecture_Decisions.md)).

### 4. Security First
- Never commit secrets.
- Use environment variables for all configuration.
- Validate all inputs server-side.
- Use Django's built-in protections (CSRF, XSS, SQL injection).

### 5. Mobile-First Responsive Design
All pages are designed mobile-first. Desktop is a progressive enhancement.

### 6. Accessibility Is Not Optional
Target WCAG 2.1 AA compliance. Keyboard navigation, screen reader support, sufficient color contrast.

## Key Metrics for MVP Success

| Metric | Target |
|---|---|
| Pages | Home, PLP, PDP, Cart, Checkout, Order Confirmation, Customizer |
| Products | 20-30 products across 2-3 categories |
| Auth | Google OAuth Login, Profile |
| Payments | Razorpay checkout flow functional |
| Emails | Order confirmation, payment receipt |
| Customizer | Upload logo, change colors, move/resize/rotate, save design |
| Load Time | < 3s on 3G |
| Lighthouse Score | > 80 on all categories |

## Open Questions

- [ ] Should we support guest checkout or require login?
- [ ] What is the return/refund policy flow?
- [ ] Do we need GST invoice generation at MVP?
- [ ] What is the inventory management approach (track qty or oversell)?
- [ ] Should we support multiple addresses at MVP?
- [ ] What coupon/promo code logic makes sense for pre-launch?
- [ ] Should we support Apple ID as a secondary social login provider?

## References

- [ARCHITECTURE.md](../ARCHITECTURE.md) — Original architecture document
- [Project Vision](./handbook/01_Project_Vision.md) — Brand & product vision
- [Roadmap](./handbook/02_Roadmap.md) — Weekly milestones
- [Deployment Guide](./handbook/06_Deployment_Guide.md) — Infrastructure setup

---

*Last reviewed: 5 July 2026. Update when project context changes.*
